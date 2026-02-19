import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Team } from '../types/auth'
import { Pokemon } from '../types/pokemon'
import { getTeams, deleteTeam } from '../utils/authApi'
import { getPokemon, getPokemonThumbnail } from '../utils/api'
import Loading from '../components/Loading'

interface TeamWithSprites extends Team {
  pokemonData?: Pokemon[]
}

function MesEquipes() {
  const [teams, setTeams] = useState<TeamWithSprites[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const loadTeams = async () => {
    try {
      const data = await getTeams()
      const teamsWithSprites = await Promise.all(
        data.teams.map(async (team) => {
          const ids: number[] = JSON.parse(team.pokemon_ids)
          const pokemonData = await Promise.all(ids.map((id) => getPokemon(id).catch(() => null)))
          return { ...team, pokemonData: pokemonData.filter(Boolean) as Pokemon[] }
        })
      )
      setTeams(teamsWithSprites)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTeams()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette equipe ?')) return
    try {
      await deleteTeam(id)
      setTeams(teams.filter((t) => t.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur suppression')
    }
  }

  if (loading) return <Loading text="Chargement de vos equipes..." />

  return (
    <div className="page">
      <div className="page-header">
        <h1>Mes Equipes</h1>
        <p>Gerez vos equipes sauvegardees</p>
      </div>

      {error && <div className="auth-error" style={{ marginBottom: '1rem' }} role="alert">{error}</div>}

      {teams.length === 0 ? (
        <div className="teams-empty">
          <p>Vous n'avez pas encore d'equipe sauvegardee.</p>
          <button className="auth-submit" onClick={() => navigate('/team-builder')} type="button">
            Creer une equipe
          </button>
        </div>
      ) : (
        <div className="teams-grid">
          {teams.map((team) => (
            <div key={team.id} className="team-card">
              <h3 className="team-card-name">{team.name}</h3>
              <div className="team-card-sprites">
                {team.pokemonData?.map((p) => (
                  <img
                    key={p.id}
                    src={getPokemonThumbnail(p)}
                    alt={p.name}
                    title={p.name}
                    loading="lazy"
                    decoding="async"
                    width={56}
                    height={56}
                  />
                ))}
              </div>
              <div className="team-card-actions">
                <button
                  className="team-card-edit"
                  onClick={() => navigate(`/team-builder?teamId=${team.id}`)}
                  type="button"
                >
                  Modifier
                </button>
                <button
                  className="team-card-delete"
                  onClick={() => handleDelete(team.id)}
                  type="button"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MesEquipes
