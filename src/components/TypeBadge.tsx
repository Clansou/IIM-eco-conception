import { TypeName } from '../types/pokemon'
import { typeColors, typeFrenchNames } from '../utils/typeColors'

interface TypeBadgeProps {
  type: TypeName;
}

function TypeBadge({ type }: TypeBadgeProps) {
  return (
    <span
      className="type-badge"
      style={{ backgroundColor: typeColors[type] || '#777' }}
    >
      {typeFrenchNames[type] || type}
    </span>
  )
}

export default TypeBadge
