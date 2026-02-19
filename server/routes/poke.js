const express = require('express')

const router = express.Router()

const POKEAPI_BASE = 'https://pokeapi.co/api/v2'
const CACHE_TTL_SHORT = 1000 * 60 * 5
const CACHE_TTL_LONG = 1000 * 60 * 60 * 24
const CONCURRENCY_LIMIT = 8

const memoryCache = new Map()
const inFlight = new Map()

const generations = [
  { id: 1, start: 1, end: 151, count: 151 },
  { id: 2, start: 152, end: 251, count: 100 },
  { id: 3, start: 252, end: 386, count: 135 },
  { id: 4, start: 387, end: 493, count: 107 },
  { id: 5, start: 494, end: 649, count: 156 },
  { id: 6, start: 650, end: 721, count: 72 },
  { id: 7, start: 722, end: 809, count: 88 },
  { id: 8, start: 810, end: 905, count: 96 },
  { id: 9, start: 906, end: 1025, count: 120 },
]

const validTypes = new Set([
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
])

function getCached(key) {
  const entry = memoryCache.get(key)
  if (!entry) return null
  if (entry.expires < Date.now()) {
    memoryCache.delete(key)
    return null
  }
  return entry.value
}

async function fetchJson(url, ttlMs = CACHE_TTL_SHORT) {
  const cached = getCached(url)
  if (cached) return cached

  const existing = inFlight.get(url)
  if (existing) return existing

  const request = fetch(url)
    .then(async (res) => {
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(text || `Failed to fetch ${url}`)
      }
      return res.json()
    })
    .then((data) => {
      memoryCache.set(url, { value: data, expires: Date.now() + ttlMs })
      return data
    })
    .finally(() => inFlight.delete(url))

  inFlight.set(url, request)
  return request
}

function getIdFromUrl(url) {
  const parts = url.split('/').filter(Boolean)
  return parseInt(parts[parts.length - 1], 10)
}

async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length)
  let index = 0

  const workers = new Array(Math.min(limit, items.length)).fill(null).map(async () => {
    while (index < items.length) {
      const current = index
      index += 1
      results[current] = await fn(items[current])
    }
  })

  await Promise.all(workers)
  return results
}

function pickPokemon(data) {
  const sprites = data.sprites || {}
  const other = sprites.other || {}
  const official = other['official-artwork'] || {}
  const dreamWorld = other.dream_world || {}

  return {
    id: data.id,
    name: data.name,
    sprites: {
      front_default: sprites.front_default || '',
      other: {
        'official-artwork': { front_default: official.front_default || '' },
        dream_world: { front_default: dreamWorld.front_default || '' },
      },
    },
    types: data.types,
    stats: data.stats,
    abilities: data.abilities,
    height: data.height,
    weight: data.weight,
    base_experience: data.base_experience,
    species: data.species,
  }
}

async function getPokemonIndex() {
  const cacheKey = 'pokemon-index'
  const cached = getCached(cacheKey)
  if (cached) return cached

  const data = await fetchJson(`${POKEAPI_BASE}/pokemon?limit=1025&offset=0`, CACHE_TTL_LONG)
  const index = new Map()
  data.results.forEach((entry) => {
    index.set(getIdFromUrl(entry.url), entry.name)
  })

  memoryCache.set(cacheKey, { value: index, expires: Date.now() + CACHE_TTL_LONG })
  return index
}

async function getTypeIds(type) {
  const cacheKey = `type-${type}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  const data = await fetchJson(`${POKEAPI_BASE}/type/${type}`, CACHE_TTL_LONG)
  const ids = data.pokemon.map((entry) => getIdFromUrl(entry.pokemon.url))
  memoryCache.set(cacheKey, { value: ids, expires: Date.now() + CACHE_TTL_LONG })
  return ids
}

function parseGeneration(genParam) {
  if (!genParam) {
    return { start: 1, count: 1025 }
  }
  const genId = Number(genParam)
  const gen = generations.find((g) => g.id === genId)
  if (!gen) return null
  return { start: gen.start, count: gen.count }
}

router.get('/pokemon', async (req, res) => {
  try {
    const { gen, page = '1', limit = '24', search = '', type } = req.query

    const generation = parseGeneration(gen)
    if (!generation) {
      return res.status(400).json({ error: 'Generation invalide' })
    }

    const pageNum = Math.max(1, Number(page) || 1)
    const limitNum = Math.min(Math.max(Number(limit) || 24, 1), 60)

    let ids = []
    for (let id = generation.start; id < generation.start + generation.count; id += 1) {
      ids.push(id)
    }

    if (type) {
      const typeValue = String(type).toLowerCase()
      if (!validTypes.has(typeValue)) {
        return res.status(400).json({ error: 'Type invalide' })
      }
      const typeIds = await getTypeIds(typeValue)
      const typeSet = new Set(typeIds)
      ids = ids.filter((id) => typeSet.has(id))
    }

    const searchValue = String(search || '').trim().toLowerCase()
    if (searchValue) {
      const isNumeric = /^[0-9]+$/.test(searchValue)
      const index = isNumeric ? null : await getPokemonIndex()
      ids = ids.filter((id) => {
        if (String(id).includes(searchValue)) return true
        if (!index) return false
        const name = index.get(id) || ''
        return name.includes(searchValue)
      })
    }

    const count = ids.length
    const startIndex = (pageNum - 1) * limitNum
    const pageIds = ids.slice(startIndex, startIndex + limitNum)

    const results = await mapWithConcurrency(pageIds, CONCURRENCY_LIMIT, async (id) => {
      const data = await fetchJson(`${POKEAPI_BASE}/pokemon/${id}`, CACHE_TTL_LONG)
      return pickPokemon(data)
    })

    res.set('Cache-Control', 'public, max-age=300')
    res.json({ count, results })
  } catch (err) {
    res.status(502).json({ error: 'Erreur lors du chargement des Pokemon' })
  }
})

router.get('/pokemon/:id', async (req, res) => {
  try {
    const data = await fetchJson(`${POKEAPI_BASE}/pokemon/${req.params.id}`, CACHE_TTL_LONG)
    res.set('Cache-Control', 'public, max-age=86400')
    res.json(pickPokemon(data))
  } catch (err) {
    res.status(502).json({ error: 'Pokemon introuvable' })
  }
})

router.get('/pokemon-species/:id', async (req, res) => {
  try {
    const data = await fetchJson(`${POKEAPI_BASE}/pokemon-species/${req.params.id}`, CACHE_TTL_LONG)
    res.set('Cache-Control', 'public, max-age=86400')
    res.json({
      evolution_chain: data.evolution_chain,
      flavor_text_entries: data.flavor_text_entries,
      genera: data.genera,
      color: data.color,
    })
  } catch (err) {
    res.status(502).json({ error: 'Species introuvable' })
  }
})

router.get('/evolution-chain/:id', async (req, res) => {
  try {
    const data = await fetchJson(`${POKEAPI_BASE}/evolution-chain/${req.params.id}`, CACHE_TTL_LONG)
    res.set('Cache-Control', 'public, max-age=86400')
    res.json({ chain: data.chain })
  } catch (err) {
    res.status(502).json({ error: "Chaine d'evolution introuvable" })
  }
})

module.exports = router
