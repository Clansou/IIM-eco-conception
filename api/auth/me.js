import { initDb } from '../_lib/db.js';
import { verifyAuth } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = verifyAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Token manquant ou invalide' });
  }

  const db = await initDb();

  const user = (await db.execute({ sql: 'SELECT id, email, created_at FROM users WHERE id = ?', args: [userId] })).rows[0];
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur non trouve' });
  }

  res.json({ user });
}
