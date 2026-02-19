import { EvolutionChain, Pokemon, PokemonPageResponse, PokemonSpecies, TypeName } from '../types/pokemon'

const API_BASE = '/api'
const CACHE_TTL_SHORT = 1000 * 60 * 5
const CACHE_TTL_LONG = 1000 * 60 * 60 * 24

type CacheEntry = { expires: number; value: unknown }
const memoryCache = new Map<string, CacheEntry>()
const inFlight = new Map<string, Promise<unknown>>()

function getCached<T>(key: string): T | null {
  const entry = memoryCache.get(key)
  if (!entry) return null
  if (entry.expires < Date.now()) {
    memoryCache.delete(key)
    return null
  }
  return entry.value as T
}

async function fetchJson<T>(
  url: string,
  options: { signal?: AbortSignal; ttlMs?: number; cacheKey?: string } = {}
): Promise<T> {
  const { signal, ttlMs = CACHE_TTL_SHORT, cacheKey = url } = options
  const cached = getCached<T>(cacheKey)
  if (cached) return cached

  if (!signal) {
    const existing = inFlight.get(cacheKey) as Promise<T> | undefined
    if (existing) return existing
  }

  const request = fetch(url, { signal })
    .then(async (res) => {
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(text || `Failed to fetch ${url}`)
      }
      return res.json() as Promise<T>
    })
    .then((data) => {
      memoryCache.set(cacheKey, { value: data, expires: Date.now() + ttlMs })
      return data
    })

  if (!signal) {
    inFlight.set(cacheKey, request)
    request.finally(() => inFlight.delete(cacheKey))
  }

  return request
}

export interface Generation {
  id: number
  name: string
  region: string
  start: number
  end: number
  count: number
}

export const generations: Generation[] = [
  { id: 1, name: 'Gen 1', region: 'Kanto', start: 1, end: 151, count: 151 },
  { id: 2, name: 'Gen 2', region: 'Johto', start: 152, end: 251, count: 100 },
  { id: 3, name: 'Gen 3', region: 'Hoenn', start: 252, end: 386, count: 135 },
  { id: 4, name: 'Gen 4', region: 'Sinnoh', start: 387, end: 493, count: 107 },
  { id: 5, name: 'Gen 5', region: 'Unova', start: 494, end: 649, count: 156 },
  { id: 6, name: 'Gen 6', region: 'Kalos', start: 650, end: 721, count: 72 },
  { id: 7, name: 'Gen 7', region: 'Alola', start: 722, end: 809, count: 88 },
  { id: 8, name: 'Gen 8', region: 'Galar', start: 810, end: 905, count: 96 },
  { id: 9, name: 'Gen 9', region: 'Paldea', start: 906, end: 1025, count: 120 },
]

function buildQuery(params: Record<string, string | number | undefined | null>): string {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    searchParams.set(key, String(value))
  })
  const qs = searchParams.toString()
  return qs ? `?${qs}` : ''
}

export async function getPokemonPage(options: {
  gen?: Generation | null
  page?: number
  limit?: number
  search?: string
  type?: TypeName | null
  signal?: AbortSignal
}): Promise<PokemonPageResponse> {
  const query = buildQuery({
    gen: options.gen?.id,
    page: options.page ?? 1,
    limit: options.limit ?? 24,
    search: options.search?.trim(),
    type: options.type ?? undefined,
  })
  const url = `${API_BASE}/pokemon${query}`
  return fetchJson<PokemonPageResponse>(url, {
    signal: options.signal,
    ttlMs: CACHE_TTL_SHORT,
    cacheKey: url,
  })
}

export async function getPokemon(nameOrId: string | number, signal?: AbortSignal): Promise<Pokemon> {
  const url = `${API_BASE}/pokemon/${nameOrId}`
  return fetchJson<Pokemon>(url, { signal, ttlMs: CACHE_TTL_LONG, cacheKey: url })
}

export async function getPokemonSpecies(nameOrId: string | number, signal?: AbortSignal): Promise<PokemonSpecies> {
  const url = `${API_BASE}/pokemon-species/${nameOrId}`
  return fetchJson<PokemonSpecies>(url, { signal, ttlMs: CACHE_TTL_LONG, cacheKey: url })
}

export async function getEvolutionChain(urlOrId: string | number, signal?: AbortSignal): Promise<EvolutionChain> {
  const id = typeof urlOrId === 'string' && urlOrId.includes('/')
    ? getPokemonIdFromUrl(urlOrId)
    : Number(urlOrId)
  const url = `${API_BASE}/evolution-chain/${id}`
  return fetchJson<EvolutionChain>(url, { signal, ttlMs: CACHE_TTL_LONG, cacheKey: url })
}

export function getRandomPokemonId(gen: Generation | null): number {
  if (!gen) {
    return Math.floor(Math.random() * 1025) + 1
  }
  return gen.start + Math.floor(Math.random() * gen.count)
}

export function getRandomPokemonIds(count: number, gen: Generation | null): number[] {
  const max = gen ? gen.count : 1025
  const start = gen ? gen.start : 1
  const ids = new Set<number>()
  while (ids.size < count) {
    ids.add(start + Math.floor(Math.random() * max))
  }
  return Array.from(ids)
}

export function getPokemonImage(pokemon: Pokemon): string {
  return (
    pokemon.sprites.other['official-artwork'].front_default ||
    pokemon.sprites.other.dream_world.front_default ||
    pokemon.sprites.front_default
  )
}

export function getPokemonThumbnail(pokemon: Pokemon): string {
  return (
    pokemon.sprites.front_default ||
    pokemon.sprites.other['official-artwork'].front_default ||
    pokemon.sprites.other.dream_world.front_default
  )
}

export function getPokemonIdFromUrl(url: string): number {
  const parts = url.split('/').filter(Boolean)
  return parseInt(parts[parts.length - 1])
}
