import { TypeName } from '../types/pokemon'
import { getContrastTextColor, typeColors, typeFrenchNames } from '../utils/typeColors'

interface TypeBadgeProps {
  type: TypeName
}

function TypeBadge({ type }: TypeBadgeProps) {
  const background = typeColors[type] || '#777'
  const color = getContrastTextColor(background)

  return (
    <span
      className="type-badge"
      style={{ backgroundColor: background, color }}
    >
      {typeFrenchNames[type] || type}
    </span>
  )
}

export default TypeBadge
