import { useState, useEffect, useMemo } from 'react'
import { Pokemon, TypeName } from '../types/pokemon'
import { getAllPokemon } from '../utils/api'
import { allTypes, typeColors, typeFrenchNames } from '../utils/typeColors'
import PokemonCard from '../components/PokemonCard'
import Loading from '../components/Loading'

function Pokedex() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState<TypeName | null>(null)

  useEffect(() => {
    getAllPokemon(151).then((data) => {
      setPokemon(data)
      setLoading(false)
    })
  }, [])

  const filteredPokemon = useMemo(() => {
    return pokemon.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        String(p.id).includes(search)
      const matchesType = !selectedType ||
        p.types.some((t) => t.type.name === selectedType)
      return matchesSearch && matchesType
    })
  }, [pokemon, search, selectedType])

  if (loading) return <Loading text="Chargement du Pokedex..." />

  return (
    <div className="page">
      <div className="page-header">
        <h1>Pokedex</h1>
        <p>{filteredPokemon.length} Pokemon trouves</p>
      </div>

      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Rechercher un Pokemon par nom ou numero..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="type-filters">
        <button
          className={`type-filter-btn ${!selectedType ? 'active' : ''}`}
          style={{ backgroundColor: '#555' }}
          onClick={() => setSelectedType(null)}
        >
          Tous
        </button>
        {allTypes.map((type) => (
          <button
            key={type}
            className={`type-filter-btn ${selectedType === type ? 'active' : ''}`}
            style={{ backgroundColor: typeColors[type] }}
            onClick={() => setSelectedType(selectedType === type ? null : type)}
          >
            {typeFrenchNames[type]}
          </button>
        ))}
      </div>

      <div className="pokemon-grid">
        {filteredPokemon.map((p) => (
          <PokemonCard key={p.id} pokemon={p} />
        ))}
      </div>

      {filteredPokemon.length === 0 && (
        <div className="loading-container" style={{ minHeight: '200px' }}>
          <p style={{ fontSize: '3rem' }}>🔍</p>
          <p className="loading-text">Aucun Pokemon trouve</p>
        </div>
      )}
    </div>
  )
}

export default Pokedex
