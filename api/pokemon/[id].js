import { CACHE_TTL_LONG, POKEAPI_BASE, fetchJson, pickPokemon } from '../_lib/poke.js';

export default async function handler(req, res) {
  try {
    const data = await fetchJson(`${POKEAPI_BASE}/pokemon/${req.query.id}`, CACHE_TTL_LONG);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.json(pickPokemon(data));
  } catch (err) {
    return res.status(502).json({ error: 'Pokemon introuvable' });
  }
}
