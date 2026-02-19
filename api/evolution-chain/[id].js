import { CACHE_TTL_LONG, POKEAPI_BASE, fetchJson } from '../_lib/poke.js';

export default async function handler(req, res) {
  try {
    const data = await fetchJson(`${POKEAPI_BASE}/evolution-chain/${req.query.id}`, CACHE_TTL_LONG);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.json({ chain: data.chain });
  } catch (err) {
    return res.status(502).json({ error: "Chaine d'evolution introuvable" });
  }
}
