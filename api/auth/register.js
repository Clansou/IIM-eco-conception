import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { initDb } from '../_lib/db.js';
import { JWT_SECRET } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit faire au moins 6 caracteres' });
  }

  const db = await initDb();

  const existing = (await db.execute({ sql: 'SELECT id FROM users WHERE email = ?', args: [email] })).rows[0];
  if (existing) {
    return res.status(409).json({ error: 'Cet email est deja utilise' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = await db.execute({ sql: 'INSERT INTO users (email, password) VALUES (?, ?)', args: [email, hash] });
  const userId = Number(result.lastInsertRowid);

  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

  res.status(201).json({
    token,
    user: { id: userId, email },
  });
}
