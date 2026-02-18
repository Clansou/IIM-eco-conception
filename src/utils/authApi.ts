import { AuthResponse, Team, User } from '../types/auth'

function getToken(): string | null {
  return localStorage.getItem('token')
}

function authHeaders(): HeadersInit {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// Auth

export async function register(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Erreur inscription')
  return data
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Erreur connexion')
  return data
}

export async function getMe(): Promise<{ user: User }> {
  const res = await fetch('/api/auth/me', {
    headers: authHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Non authentifie')
  return data
}

// Teams

export async function getTeams(): Promise<{ teams: Team[] }> {
  const res = await fetch('/api/teams', {
    headers: authHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Erreur chargement equipes')
  return data
}

export async function getTeam(id: number): Promise<{ team: Team }> {
  const res = await fetch(`/api/teams/${id}`, {
    headers: authHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Equipe non trouvee')
  return data
}

export async function createTeam(name: string, pokemonIds: number[]): Promise<{ team: Team }> {
  const res = await fetch('/api/teams', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ name, pokemon_ids: pokemonIds }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Erreur creation equipe')
  return data
}

export async function updateTeam(id: number, name: string, pokemonIds: number[]): Promise<{ team: Team }> {
  const res = await fetch(`/api/teams/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ name, pokemon_ids: pokemonIds }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Erreur modification equipe')
  return data
}

export async function deleteTeam(id: number): Promise<void> {
  const res = await fetch(`/api/teams/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error || 'Erreur suppression equipe')
  }
}
