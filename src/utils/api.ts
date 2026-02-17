import { Pokemon, PokemonListResponse, PokemonSpecies, EvolutionChain } from '../types/pokemon';

const BASE_URL = 'https://pokeapi.co/api/v2';

const cache = new Map<string, unknown>();

async function fetchWithCache<T>(url: string): Promise<T> {
  if (cache.has(url)) {
    return cache.get(url) as T;
  }
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}`);
  const data = await response.json();
  cache.set(url, data);
  return data as T;
}

export async function getPokemonList(limit = 151, offset = 0): Promise<PokemonListResponse> {
  return fetchWithCache<PokemonListResponse>(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
}

export async function getPokemon(nameOrId: string | number): Promise<Pokemon> {
  return fetchWithCache<Pokemon>(`${BASE_URL}/pokemon/${nameOrId}`);
}

export async function getPokemonSpecies(nameOrId: string | number): Promise<PokemonSpecies> {
  return fetchWithCache<PokemonSpecies>(`${BASE_URL}/pokemon-species/${nameOrId}`);
}

export async function getEvolutionChain(url: string): Promise<EvolutionChain> {
  return fetchWithCache<EvolutionChain>(url);
}

export async function getAllPokemon(limit = 151): Promise<Pokemon[]> {
  const list = await getPokemonList(limit);
  const promises = list.results.map((_, i) => getPokemon(i + 1));
  return Promise.all(promises);
}

export function getPokemonImage(pokemon: Pokemon): string {
  return (
    pokemon.sprites.other['official-artwork'].front_default ||
    pokemon.sprites.other.dream_world.front_default ||
    pokemon.sprites.front_default
  );
}

export function getPokemonIdFromUrl(url: string): number {
  const parts = url.split('/').filter(Boolean);
  return parseInt(parts[parts.length - 1]);
}
