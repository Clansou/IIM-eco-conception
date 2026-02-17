import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Pokemon, PokemonSpecies, EvolutionChain, EvolutionLink, TypeName } from '../types/pokemon'
import { getPokemon, getPokemonSpecies, getEvolutionChain, getPokemonImage, getPokemonIdFromUrl } from '../utils/api'
import TypeBadge from '../components/TypeBadge'
import Loading from '../components/Loading'

const statNames: Record<string, string> = {
  hp: 'PV',
  attack: 'ATK',
  defense: 'DEF',
  'special-attack': 'ATK SPE',
  'special-defense': 'DEF SPE',
  speed: 'VIT',
}

function PokemonDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [pokemon, setPokemon] = useState<Pokemon | null>(null)
  const [species, setSpecies] = useState<PokemonSpecies | null>(null)
  const [evolutions, setEvolutions] = useState<{ name: string; id: number; sprite: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)

    Promise.all([
      getPokemon(id),
      getPokemonSpecies(id),
    ]).then(async ([pokemonData, speciesData]) => {
      setPokemon(pokemonData)
      setSpecies(speciesData)

      const evoChain = await getEvolutionChain(speciesData.evolution_chain.url)
      const evoList = extractEvolutions(evoChain.chain)

      const evosWithSprites = await Promise.all(
        evoList.map(async (evo) => {
          const p = await getPokemon(evo.id)
          return {
            ...evo,
            sprite: getPokemonImage(p),
          }
        })
      )
      setEvolutions(evosWithSprites)
      setLoading(false)
    })
  }, [id])

  function extractEvolutions(chain: EvolutionLink): { name: string; id: number }[] {
    const result: { name: string; id: number }[] = []
    let current: EvolutionLink | null = chain

    while (current) {
      result.push({
        name: current.species.name,
        id: getPokemonIdFromUrl(current.species.url),
      })
      current = current.evolves_to.length > 0 ? current.evolves_to[0] : null
    }

    return result
  }

  if (loading || !pokemon || !species) return <Loading text="Chargement..." />

  const description = species.flavor_text_entries.find(
    (e) => e.language.name === 'fr'
  )?.flavor_text || species.flavor_text_entries.find(
    (e) => e.language.name === 'en'
  )?.flavor_text || ''

  const genus = species.genera.find(
    (g) => g.language.name === 'fr'
  )?.genus || species.genera.find(
    (g) => g.language.name === 'en'
  )?.genus || ''

  const totalStats = pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0)

  return (
    <div className="page">
      <div className="detail-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Retour
        </button>

        <div className="detail-header">
          <img
            className="detail-image"
            src={getPokemonImage(pokemon)}
            alt={pokemon.name}
          />
          <p className="detail-id">#{String(pokemon.id).padStart(3, '0')}</p>
          <h1 className="detail-name">{pokemon.name}</h1>
          <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>{genus}</p>
          <div className="detail-types">
            {pokemon.types.map((t) => (
              <TypeBadge key={t.type.name} type={t.type.name as TypeName} />
            ))}
          </div>
        </div>

        <div className="detail-info-grid">
          <div className="detail-info-item">
            <label>Taille</label>
            <span>{(pokemon.height / 10).toFixed(1)} m</span>
          </div>
          <div className="detail-info-item">
            <label>Poids</label>
            <span>{(pokemon.weight / 10).toFixed(1)} kg</span>
          </div>
          <div className="detail-info-item">
            <label>XP de base</label>
            <span>{pokemon.base_experience}</span>
          </div>
        </div>

        <div className="detail-section">
          <h3>Description</h3>
          <p className="detail-description">
            {description.replace(/\f/g, ' ').replace(/\n/g, ' ')}
          </p>
        </div>

        <div className="detail-section">
          <h3>Statistiques (Total: {totalStats})</h3>
          {pokemon.stats.map((stat) => (
            <div key={stat.stat.name} className="stat-bar-container">
              <div className="stat-bar-label">
                <span>{statNames[stat.stat.name] || stat.stat.name}</span>
                <span>{stat.base_stat}</span>
              </div>
              <div className="stat-bar">
                <div
                  className="stat-bar-fill"
                  style={{
                    width: `${Math.min((stat.base_stat / 255) * 100, 100)}%`,
                    background: stat.base_stat > 100
                      ? 'linear-gradient(90deg, #4CAF50, #8BC34A)'
                      : stat.base_stat > 60
                        ? 'linear-gradient(90deg, #FF9800, #FFC107)'
                        : 'linear-gradient(90deg, #f44336, #FF5722)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="detail-section">
          <h3>Talents</h3>
          <div className="detail-abilities">
            {pokemon.abilities.map((a) => (
              <span
                key={a.ability.name}
                className={`ability-tag ${a.is_hidden ? 'hidden' : ''}`}
              >
                {a.ability.name.replace('-', ' ')}
                {a.is_hidden && ' (cache)'}
              </span>
            ))}
          </div>
        </div>

        {evolutions.length > 1 && (
          <div className="detail-section">
            <h3>Chaine d'evolution</h3>
            <div className="evolution-chain">
              {evolutions.map((evo, index) => (
                <div key={evo.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {index > 0 && <span className="evolution-arrow">→</span>}
                  <div
                    className="evolution-pokemon"
                    onClick={() => navigate(`/pokemon/${evo.id}`)}
                  >
                    <img src={evo.sprite} alt={evo.name} />
                    <p>{evo.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PokemonDetail
