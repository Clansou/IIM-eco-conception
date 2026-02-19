import {
  CACHE_TTL_LONG,
  CONCURRENCY_LIMIT,
  POKEAPI_BASE,
  fetchJson,
  getPokemonIndex,
  getTypeIds,
  isValidType,
  mapWithConcurrency,
  parseGeneration,
  pickPokemon,
} from '../_lib/poke.js';

export default async function handler(req, res) {
  try {
    const { gen, page = '1', limit = '24', search = '', type } = req.query;

    const generation = parseGeneration(gen);
    if (!generation) {
      return res.status(400).json({ error: 'Generation invalide' });
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(Math.max(Number(limit) || 24, 1), 60);

    let ids = [];
    for (let id = generation.start; id < generation.start + generation.count; id += 1) {
      ids.push(id);
    }

    if (type) {
      const typeValue = String(type).toLowerCase();
      if (!isValidType(typeValue)) {
        return res.status(400).json({ error: 'Type invalide' });
      }
      const typeIds = await getTypeIds(typeValue);
      const typeSet = new Set(typeIds);
      ids = ids.filter((id) => typeSet.has(id));
    }

    const searchValue = String(search || '').trim().toLowerCase();
    if (searchValue) {
      const isNumeric = /^[0-9]+$/.test(searchValue);
      const index = isNumeric ? null : await getPokemonIndex();
      ids = ids.filter((id) => {
        if (String(id).includes(searchValue)) return true;
        if (!index) return false;
        const name = index.get(id) || '';
        return name.includes(searchValue);
      });
    }

    const count = ids.length;
    const startIndex = (pageNum - 1) * limitNum;
    const pageIds = ids.slice(startIndex, startIndex + limitNum);

    const results = await mapWithConcurrency(pageIds, CONCURRENCY_LIMIT, async (id) => {
      const data = await fetchJson(`${POKEAPI_BASE}/pokemon/${id}`, CACHE_TTL_LONG);
      return pickPokemon(data);
    });

    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.json({ count, results });
  } catch (err) {
    return res.status(502).json({ error: 'Erreur lors du chargement des Pokemon' });
  }
}
