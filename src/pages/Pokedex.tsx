import { useEffect, useRef, useState } from 'react'
import { Pokemon, TypeName } from '../types/pokemon'
import { Generation, generations, getPokemonPage } from '../utils/api'
import { allTypes, typeColors, typeFrenchNames, getContrastTextColor } from '../utils/typeColors'
import PokemonCard from '../components/PokemonCard'
import GenerationSelector from '../components/GenerationSelector'
import Loading from '../components/Loading'
import { useDebouncedValue } from '../hooks/useDebouncedValue'

const PAGE_SIZE = 24

function Pokedex() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState<TypeName | null>(null)
  const [selectedGen, setSelectedGen] = useState<Generation | null>(generations[0])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const abortRef = useRef<AbortController | null>(null)
  const isInitialLoading = loading && pokemon.length === 0

  const debouncedSearch = useDebouncedValue(search.trim(), 300)

  const loadPage = async (pageToLoad: number, replace: boolean) => {
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const isCurrent = () => abortRef.current === controller

    setError('')
    if (replace) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }

    try {
      const data = await getPokemonPage({
        gen: selectedGen,
        page: pageToLoad,
        limit: PAGE_SIZE,
        search: debouncedSearch,
        type: selectedType,
        signal: controller.signal,
      })

      setTotal(data.count)
      setPokemon((prev) => (replace ? data.results : [...prev, ...data.results]))
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
    setPokemon([])
    setTotal(0)
    setHasMore(true)
    setPage(1)
    loadPage(1, true)

    return () => {
      abortRef.current?.abort()
    }
  }, [selectedGen, selectedType, debouncedSearch])

  return (
    <div className="page">
      <div className="page-header">
        <h1>Pokedex</h1>
        <p aria-live="polite">
          {total > 0 ? `${pokemon.length} / ${total} Pokemon affiches` : 'Aucun Pokemon affiche'}
        </p>
      </div>

      <GenerationSelector selected={selectedGen} onChange={setSelectedGen} />

      <div className="search-bar">
        <label htmlFor="pokedex-search" className="sr-only">Rechercher un Pokemon</label>
        <input
          id="pokedex-search"
          type="text"
          className="search-input"
          placeholder="Rechercher un Pokemon par nom ou numero..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="type-filters" aria-label="Filtres par type">
        <button
          className={`type-filter-btn ${!selectedType ? 'active' : ''}`}
          style={{ backgroundColor: '#555', color: '#fff' }}
          onClick={() => setSelectedType(null)}
          aria-pressed={!selectedType}
          type="button"
        >
          Tous
        </button>
        {allTypes.map((type) => {
          const bg = typeColors[type]
          return (
            <button
              key={type}
              className={`type-filter-btn ${selectedType === type ? 'active' : ''}`}
              style={{ backgroundColor: bg, color: getContrastTextColor(bg) }}
              onClick={() => setSelectedType(selectedType === type ? null : type)}
              aria-pressed={selectedType === type}
              type="button"
            >
              {typeFrenchNames[type]}
            </button>
          )
        })}
      </div>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      {isInitialLoading && (
        <div className="loading-inline" role="status" aria-live="polite">
          Chargement du Pokedex...
        </div>
      )}

      <div className="pokemon-grid" aria-live="polite" aria-busy={loading}>
        {isInitialLoading
          ? Array.from({ length: PAGE_SIZE }).map((_, index) => (
              <div key={`skeleton-${index}`} className="pokemon-card skeleton" aria-hidden="true">
                <div className="skeleton-line skeleton-id" />
                <div className="skeleton-image" />
                <div className="skeleton-line skeleton-name" />
                <div className="skeleton-badges">
                  <span className="skeleton-badge" />
                  <span className="skeleton-badge" />
                </div>
              </div>
            ))
          : pokemon.map((p) => (
              <PokemonCard key={p.id} pokemon={p} />
            ))}
      </div>

      {!loading && pokemon.length === 0 && !error && (
        <div className="loading-container" style={{ minHeight: '200px' }} role="status" aria-live="polite">
          <p style={{ fontSize: '3rem' }}>🔍</p>
          <p className="loading-text">Aucun Pokemon trouve</p>
        </div>
      )}

      {hasMore && !loading && !error && pokemon.length > 0 && (
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
  )
}

export default Pokedex
