import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Pokemon, TypeName } from '../types/pokemon'
import { getPokemonThumbnail } from '../utils/api'
import TypeBadge from './TypeBadge'

interface PokemonCardProps {
  pokemon: Pokemon
}

function PokemonCard({ pokemon }: PokemonCardProps) {
  return (
    <Link className="pokemon-card" to={`/pokemon/${pokemon.id}`}>
      <div className="pokemon-card-id">#{String(pokemon.id).padStart(3, '0')}</div>
      <img
        className="pokemon-card-image"
        src={getPokemonThumbnail(pokemon)}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        width={120}
        height={120}
      />
      <div className="pokemon-card-name" lang="en">{pokemon.name}</div>
      <div className="pokemon-card-types">
        {pokemon.types.map((t) => (
          <TypeBadge key={t.type.name} type={t.type.name as TypeName} />
        ))}
      </div>
    </Link>
  )
}

export default memo(PokemonCard)
