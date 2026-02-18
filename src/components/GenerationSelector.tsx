import { Generation, generations } from '../utils/api'

interface GenerationSelectorProps {
  selected: Generation | null
  onChange: (gen: Generation | null) => void
}

function GenerationSelector({ selected, onChange }: GenerationSelectorProps) {
  return (
    <div className="generation-selector">
      <button
        className={`gen-btn ${selected === null ? 'active' : ''}`}
        onClick={() => onChange(null)}
      >
        <span className="gen-btn-name">Toutes</span>
        <span className="gen-btn-count">1025</span>
      </button>
      {generations.map((gen) => (
        <button
          key={gen.id}
          className={`gen-btn ${selected?.id === gen.id ? 'active' : ''}`}
          onClick={() => onChange(gen)}
        >
          <span className="gen-btn-name">{gen.region}</span>
          <span className="gen-btn-count">Gen {gen.id}</span>
        </button>
      ))}
    </div>
  )
}

export default GenerationSelector
