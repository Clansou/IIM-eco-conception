import { Pokemon, PokemonListResponse, PokemonSpecies, EvolutionChain } from '../types/pokemon';

const BASE_URL = 'https://pokeapi.co/api/v2';

export interface Generation {
  id: number;
  name: string;
  region: string;
  start: number;
  end: number;
  count: number;
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
];

export async function getPokemonList(limit = 151, offset = 0): Promise<PokemonListResponse> {
  const response = await fetch(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
  if (!response.ok) throw new Error(`Failed to fetch pokemon list`);
  return response.json();
}

export async function getPokemon(nameOrId: string | number): Promise<Pokemon> {
  const response = await fetch(`${BASE_URL}/pokemon/${nameOrId}`);
  if (!response.ok) throw new Error(`Failed to fetch pokemon ${nameOrId}`);
  return response.json();
}

export async function getPokemonSpecies(nameOrId: string | number): Promise<PokemonSpecies> {
  const response = await fetch(`${BASE_URL}/pokemon-species/${nameOrId}`);
  if (!response.ok) throw new Error(`Failed to fetch pokemon species ${nameOrId}`);
  return response.json();
}

export async function getEvolutionChain(url: string): Promise<EvolutionChain> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch evolution chain`);
  return response.json();
}

export async function getAllPokemon(limit = 151, offset = 0): Promise<Pokemon[]> {
  const list = await getPokemonList(limit, offset);
  const promises = list.results.map((_, i) => getPokemon(offset + i + 1));
  return Promise.all(promises);
}

export function getPokemonByGeneration(gen: Generation): Promise<Pokemon[]> {
  return getAllPokemon(gen.count, gen.start - 1);
}

export function getAllPokemonAllGens(): Promise<Pokemon[]> {
  return getAllPokemon(1025);
}

export function getRandomPokemonId(gen: Generation | null): number {
  if (!gen) {
    return Math.floor(Math.random() * 1025) + 1;
  }
  return gen.start + Math.floor(Math.random() * gen.count);
}

export function getRandomPokemonIds(count: number, gen: Generation | null): number[] {
  const max = gen ? gen.count : 1025;
  const start = gen ? gen.start : 1;
  const ids = new Set<number>();
  while (ids.size < count) {
    ids.add(start + Math.floor(Math.random() * max));
  }
  return Array.from(ids);
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
