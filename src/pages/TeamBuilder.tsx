import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Pokemon, TypeName } from '../types/pokemon'
import { getPokemonPage, getPokemonThumbnail, getPokemon, Generation, generations } from '../utils/api'
import { typeColors } from '../utils/typeColors'
import TypeBadge from '../components/TypeBadge'
import GenerationSelector from '../components/GenerationSelector'
import Loading from '../components/Loading'
import { useAuth } from '../context/AuthContext'
import { getTeam, createTeam, updateTeam } from '../utils/authApi'
import { useDebouncedValue } from '../hooks/useDebouncedValue'

const PAGE_SIZE = 30

const statNames: Record<string, string> = {
  hp: 'PV',
  attack: 'ATK',
  defense: 'DEF',
  'special-attack': 'SPA',
  'special-defense': 'SPD',
  speed: 'VIT',
}

function TeamBuilder() {
  const [searchResults, setSearchResults] = useState<Pokemon[]>([])
  const [team, setTeam] = useState<Pokemon[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [selectedGen, setSelectedGen] = useState<Generation | null>(generations[0])
  const [teamName, setTeamName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const abortRef = useRef<AbortController | null>(null)

  const editingTeamId = searchParams.get('teamId')
  const debouncedSearch = useDebouncedValue(search.trim(), 300)

  // Load existing team if editing
  useEffect(() => {
    if (editingTeamId && user) {
      getTeam(Number(editingTeamId))
        .then(async (data) => {
          setTeamName(data.team.name)
          const ids: number[] = JSON.parse(data.team.pokemon_ids)
          const pokemonData = await Promise.all(ids.map((id) => getPokemon(id)))
          setTeam(pokemonData)
        })
        .catch(() => {
          setSaveMessage('Equipe non trouvee')
        })
    }
  }, [editingTeamId, user])

  const loadPage = async (pageToLoad: number, replace: boolean) => {
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const isCurrent = () => abortRef.current === controller

    setError('')
    if (replace) setLoading(true)
    else setLoadingMore(true)

    try {
      const data = await getPokemonPage({
        gen: selectedGen,
        page: pageToLoad,
        limit: PAGE_SIZE,
        search: debouncedSearch,
        signal: controller.signal,
      })

      setSearchResults((prev) => (replace ? data.results : [...prev, ...data.results]))
      setHasMore(pageToLoad * PAGE_SIZE < data.count)
      setPage(pageToLoad)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      setError(err instanceof Error ? err.message : 'Erreur chargement')
    } finally {
      if (!isCurrent()) return
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    setSearchResults([])
    setHasMore(true)
    setPage(1)
    loadPage(1, true)

    return () => {
      abortRef.current?.abort()
    }
  }, [selectedGen, debouncedSearch])

  const addToTeam = (pokemon: Pokemon) => {
    if (team.length >= 6) return
    if (team.some((p) => p.id === pokemon.id)) return
    setTeam((prev) => [...prev, pokemon])
  }

  const removeFromTeam = (pokemonId: number) => {
    setTeam((prev) => prev.filter((p) => p.id !== pokemonId))
  }

  const handleSave = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    if (!teamName.trim()) {
      setSaveMessage('Donnez un nom a votre equipe')
      return
    }
    if (team.length === 0) {
      setSaveMessage('Ajoutez au moins un Pokemon')
      return
    }

    setSaving(true)
    setSaveMessage('')
    try {
      const pokemonIds = team.map((p) => p.id)
      if (editingTeamId) {
        await updateTeam(Number(editingTeamId), teamName.trim(), pokemonIds)
        setSaveMessage('Equipe mise a jour !')
      } else {
        await createTeam(teamName.trim(), pokemonIds)
        setSaveMessage('Equipe sauvegardee !')
      }
      setTimeout(() => navigate('/mes-equipes'), 1000)
    } catch (err) {
      setSaveMessage(err instanceof Error ? err.message : 'Erreur sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const teamTypes = useMemo(() => {
    const types = new Set<string>()
    team.forEach((p) => p.types.forEach((t) => types.add(t.type.name)))
    return Array.from(types)
  }, [team])

  const averageStats = useMemo(() => {
    if (team.length === 0) return null
    const statTotals: Record<string, number> = {}
    team.forEach((p) => {
      p.stats.forEach((s) => {
        statTotals[s.stat.name] = (statTotals[s.stat.name] || 0) + s.base_stat
      })
    })
    return Object.entries(statTotals).map(([name, total]) => ({
      name,
      value: Math.round(total / team.length),
    }))
  }, [team])

  if (loading && searchResults.length === 0) return <Loading text="Chargement des Pokemon..." />

  return (
    <div className="page">
      <div className="page-header">
        <h1>{editingTeamId ? "Modifier l'equipe" : 'Team Builder'}</h1>
        <p>Construisez votre equipe de reve ({team.length}/6 Pokemon)</p>
      </div>

      <GenerationSelector selected={selectedGen} onChange={setSelectedGen} />

      <div className="team-builder">
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Votre Equipe</h3>

          <div className="team-save-section">
            <label htmlFor="team-name" className="sr-only">Nom de l'equipe</label>
            <input
              id="team-name"
              type="text"
              className="search-input"
              placeholder="Nom de l'equipe..."
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              style={{ maxWidth: '100%', marginBottom: '0.5rem' }}
            />
            <button
              className="team-save-btn"
              onClick={handleSave}
              disabled={saving}
              type="button"
            >
              {saving ? 'Sauvegarde...' : editingTeamId ? 'Mettre a jour' : 'Sauvegarder'}
            </button>
            {saveMessage && (
              <p className="team-save-message" role="status" aria-live="polite">
                {saveMessage}
              </p>
            )}
          </div>

          <div className="team-slots">
            {Array.from({ length: 6 }).map((_, i) => {
              const pokemon = team[i]
              return (
                <div key={i} className={`team-slot ${pokemon ? 'filled' : ''}`}>
                  {pokemon ? (
                    <>
                      <button
                        className="team-slot-remove"
                        onClick={() => removeFromTeam(pokemon.id)}
                        aria-label={`Retirer ${pokemon.name} de l'equipe`}
                        type="button"
                      >
                        X
                      </button>
                      <img
                        src={getPokemonThumbnail(pokemon)}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        decoding="async"
                        width={70}
                        height={70}
                      />
                      <p className="pokemon-name" lang="en">{pokemon.name}</p>
                      <div style={{ display: 'flex', gap: '0.2rem', marginTop: '0.3rem' }}>
                        {pokemon.types.map((t) => (
                          <span
                            key={t.type.name}
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: typeColors[t.type.name as TypeName],
                            }}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="team-slot-empty">+</div>
                  )}
                </div>
              )
            })}
          </div>

          {team.length > 0 && (
            <div className="team-coverage">
              <h3>Couverture de Types</h3>
              <div className="team-coverage-types">
                {teamTypes.map((type) => (
                  <TypeBadge key={type} type={type as TypeName} />
                ))}
              </div>

              {averageStats && (
                <div className="team-stats">
                  <h3 style={{ color: 'var(--accent)', marginBottom: '0.8rem', marginTop: '1rem' }}>
                    Stats Moyennes
                  </h3>
                  {averageStats.map((stat) => (
                    <div key={stat.name} className="team-stat-row">
                      <label>{statNames[stat.name] || stat.name}</label>
                      <div className="team-stat-bar">
                        <div
                          className="team-stat-bar-fill"
                          style={{ width: `${Math.min((stat.value / 255) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="team-stat-value">{stat.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="team-search">
          <label htmlFor="team-search" className="sr-only">Rechercher un Pokemon</label>
          <input
            id="team-search"
            type="text"
            className="search-input"
            placeholder="Rechercher un Pokemon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: '100%', marginBottom: '0.5rem' }}
            aria-describedby="team-search-help"
          />
          <p
            id="team-search-help"
            style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}
          >
            Cliquez sur un Pokemon pour l'ajouter a votre equipe
          </p>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <div className="team-search-results" aria-live="polite">
            {searchResults.map((p) => {
              const isInTeam = team.some((t) => t.id === p.id)
              return (
                <button
                  key={p.id}
                  className="team-search-item"
                  onClick={() => !isInTeam && addToTeam(p)}
                  disabled={isInTeam}
                  type="button"
                  style={{
                    opacity: isInTeam ? 0.3 : 1,
                    cursor: isInTeam ? 'not-allowed' : 'pointer',
                  }}
                >
                  <img
                    src={getPokemonThumbnail(p)}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                    width={50}
                    height={50}
                  />
                  <p lang="en">{p.name}</p>
                </button>
              )
            })}
          </div>
          {!loading && searchResults.length === 0 && !error && (
            <p className="loading-text" role="status">Aucun Pokemon trouve</p>
          )}

          {hasMore && !error && searchResults.length > 0 && (
            <div className="load-more">
              <button
                className="load-more-btn"
                onClick={() => loadPage(page + 1, false)}
                disabled={loadingMore}
                type="button"
              >
                {loadingMore ? 'Chargement...' : 'Charger plus'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TeamBuilder
