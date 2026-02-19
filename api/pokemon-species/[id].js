import { CACHE_TTL_LONG, POKEAPI_BASE, fetchJson } from '../_lib/poke.js';

export default async function handler(req, res) {
  try {
    const data = await fetchJson(`${POKEAPI_BASE}/pokemon-species/${req.query.id}`, CACHE_TTL_LONG);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.json({
      evolution_chain: data.evolution_chain,
      flavor_text_entries: data.flavor_text_entries,
      genera: data.genera,
      color: data.color,
    });
  } catch (err) {
    return res.status(502).json({ error: 'Species introuvable' });
  }
}
