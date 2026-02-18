export interface User {
  id: number
  email: string
  created_at?: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface Team {
  id: number
  user_id: number
  name: string
  pokemon_ids: string // JSON string, e.g. "[25,6,9]"
  created_at: string
  updated_at: string
}
