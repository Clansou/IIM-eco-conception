import { initDb } from '../_lib/db.js';
import { verifyAuth } from '../_lib/auth.js';

export default async function handler(req, res) {
  const userId = verifyAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Token manquant ou invalide' });
  }

  const { id } = req.query;
  const db = await initDb();

  if (req.method === 'GET') {
    const team = (await db.execute({ sql: 'SELECT * FROM teams WHERE id = ? AND user_id = ?', args: [id, userId] })).rows[0];
    if (!team) {
      return res.status(404).json({ error: 'Equipe non trouvee' });
    }
    return res.json({ team });
  }

  if (req.method === 'PUT') {
    const { name, pokemon_ids } = req.body;

    const existing = (await db.execute({ sql: 'SELECT * FROM teams WHERE id = ? AND user_id = ?', args: [id, userId] })).rows[0];
    if (!existing) {
      return res.status(404).json({ error: 'Equipe non trouvee' });
    }

    if (pokemon_ids && (!Array.isArray(pokemon_ids) || pokemon_ids.length === 0 || pokemon_ids.length > 6)) {
      return res.status(400).json({ error: "L'equipe doit contenir entre 1 et 6 Pokemon" });
    }

    const updatedName = name || existing.name;
    const updatedPokemonIds = pokemon_ids ? JSON.stringify(pokemon_ids) : existing.pokemon_ids;

    await db.execute({
      sql: "UPDATE teams SET name = ?, pokemon_ids = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?",
      args: [updatedName, updatedPokemonIds, id, userId],
    });

    const team = (await db.execute({ sql: 'SELECT * FROM teams WHERE id = ?', args: [id] })).rows[0];
    return res.json({ team });
  }

  if (req.method === 'DELETE') {
    const existing = (await db.execute({ sql: 'SELECT * FROM teams WHERE id = ? AND user_id = ?', args: [id, userId] })).rows[0];
    if (!existing) {
      return res.status(404).json({ error: 'Equipe non trouvee' });
    }

    await db.execute({ sql: 'DELETE FROM teams WHERE id = ? AND user_id = ?', args: [id, userId] });
    return res.json({ message: 'Equipe supprimee' });
  }

  res.setHeader('Allow', 'GET, PUT, DELETE');
  return res.status(405).json({ error: 'Method not allowed' });
}
