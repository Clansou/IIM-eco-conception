import { useNavigate } from 'react-router-dom'
import { Pokemon, TypeName } from '../types/pokemon'
import { getPokemonImage } from '../utils/api'
import TypeBadge from './TypeBadge'

interface PokemonCardProps {
  pokemon: Pokemon;
}

function PokemonCard({ pokemon }: PokemonCardProps) {
  const navigate = useNavigate()

  return (
    <div
      className="pokemon-card"
      onClick={() => navigate(`/pokemon/${pokemon.id}`)}
    >
      <div className="pokemon-card-id">#{String(pokemon.id).padStart(3, '0')}</div>
      <img
        className="pokemon-card-image"
        src={getPokemonImage(pokemon)}
        alt={pokemon.name}
        loading="eager"
      />
      <div className="pokemon-card-name">{pokemon.name}</div>
      <div className="pokemon-card-types">
        {pokemon.types.map((t) => (
          <TypeBadge key={t.type.name} type={t.type.name as TypeName} />
        ))}
      </div>
    </div>
  )
}

export default PokemonCard
