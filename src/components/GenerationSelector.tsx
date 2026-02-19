import { memo } from 'react'
import { Generation, generations } from '../utils/api'

interface GenerationSelectorProps {
  selected: Generation | null
  onChange: (gen: Generation | null) => void
}

function GenerationSelector({ selected, onChange }: GenerationSelectorProps) {
  return (
    <div className="generation-selector" aria-label="Selection de generation">
      <button
        className={`gen-btn ${selected === null ? 'active' : ''}`}
        onClick={() => onChange(null)}
        aria-pressed={selected === null}
        type="button"
      >
        <span className="gen-btn-name">Toutes</span>
        <span className="gen-btn-count">1025</span>
      </button>
      {generations.map((gen) => (
        <button
          key={gen.id}
          className={`gen-btn ${selected?.id === gen.id ? 'active' : ''}`}
          onClick={() => onChange(gen)}
          aria-pressed={selected?.id === gen.id}
          type="button"
        >
          <span className="gen-btn-name">{gen.region}</span>
          <span className="gen-btn-count">Gen {gen.id}</span>
        </button>
      ))}
    </div>
  )
}

export default memo(GenerationSelector)
