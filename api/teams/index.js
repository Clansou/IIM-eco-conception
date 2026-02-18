import { initDb } from '../_lib/db.js';
import { verifyAuth } from '../_lib/auth.js';

export default async function handler(req, res) {
  const userId = verifyAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Token manquant ou invalide' });
  }

  const db = await initDb();

  if (req.method === 'GET') {
    const teams = (await db.execute({ sql: 'SELECT * FROM teams WHERE user_id = ? ORDER BY updated_at DESC', args: [userId] })).rows;
    return res.json({ teams });
  }

  if (req.method === 'POST') {
    const { name, pokemon_ids } = req.body;

    if (!name || !pokemon_ids) {
      return res.status(400).json({ error: 'Nom et pokemon_ids requis' });
    }
    if (!Array.isArray(pokemon_ids) || pokemon_ids.length === 0 || pokemon_ids.length > 6) {
      return res.status(400).json({ error: "L'equipe doit contenir entre 1 et 6 Pokemon" });
    }

    const result = await db.execute({
      sql: 'INSERT INTO teams (user_id, name, pokemon_ids) VALUES (?, ?, ?)',
      args: [userId, name, JSON.stringify(pokemon_ids)],
    });
    const teamId = Number(result.lastInsertRowid);

    const team = (await db.execute({ sql: 'SELECT * FROM teams WHERE id = ?', args: [teamId] })).rows[0];
    return res.status(201).json({ team });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
}
