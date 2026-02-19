import { useState, useEffect, useRef } from 'react'
import { Pokemon, TypeName } from '../types/pokemon'
import { getPokemon, getPokemonImage, getRandomPokemonId, Generation } from '../utils/api'
import { getContrastTextColor, typeColors, typeFrenchNames, typeEffectiveness, allTypes } from '../utils/typeColors'
import GenerationSelector from '../components/GenerationSelector'
import Loading from '../components/Loading'

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function Quiz() {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null)
  const [correctTypes, setCorrectTypes] = useState<string[]>([])
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [loading, setLoading] = useState(true)
  const [typeChoices, setTypeChoices] = useState<TypeName[]>([])
  const [selectedGen, setSelectedGen] = useState<Generation | null>(null)
  const selectedGenRef = useRef<Generation | null>(null)

  const handleGenChange = (gen: Generation | null) => {
    setSelectedGen(gen)
    selectedGenRef.current = gen
    setScore(0)
    setTotal(0)
    setStreak(0)
    setBestStreak(0)
    loadRound(gen)
  }

  const loadRound = async (gen?: Generation | null) => {
    setLoading(true)
    setRevealed(false)
    setSelectedType(null)

    const currentGen = gen !== undefined ? gen : selectedGenRef.current
    const id = getRandomPokemonId(currentGen)
    const pokemonData = await getPokemon(id)
    setPokemon(pokemonData)

    const primaryType = pokemonData.types[0].type.name
    const weaknesses = typeEffectiveness[primaryType] || []
    setCorrectTypes(weaknesses)

    const wrongTypes = allTypes.filter((t) => !weaknesses.includes(t))
    const shuffledWrong = shuffleArray(wrongTypes).slice(0, 6)
    const oneCorrect = weaknesses[Math.floor(Math.random() * weaknesses.length)]
    const choices = shuffleArray([...shuffledWrong, oneCorrect]) as TypeName[]
    setTypeChoices(choices)

    setLoading(false)
  }

  useEffect(() => {
    loadRound(null)
  }, [])

  const handleAnswer = (type: string) => {
    if (revealed) return
    setSelectedType(type)
    setRevealed(true)
    setTotal((t) => t + 1)

    if (correctTypes.includes(type)) {
      setScore((s) => s + 1)
      setStreak((s) => {
        const newStreak = s + 1
        setBestStreak((best) => Math.max(best, newStreak))
        return newStreak
      })
    } else {
      setStreak(0)
    }
  }

  if (loading || !pokemon) return <Loading text="Preparation du quiz..." />

  const isCorrect = selectedType && correctTypes.includes(selectedType)
  const primaryType = pokemon.types[0].type.name as TypeName
  const primaryColor = typeColors[primaryType]
  const primaryText = getContrastTextColor(primaryColor)

  return (
    <div className="page">
      <div className="game-container">
        <div className="page-header">
          <h1>Quiz des Types</h1>
          <p>Quel type est super efficace contre ce Pokemon ?</p>
        </div>

        <GenerationSelector selected={selectedGen} onChange={handleGenChange} />

        <div className="quiz-streak">
          <div className="quiz-streak-item">
            <div className="value">{score}/{total}</div>
            <div className="label">Score</div>
          </div>
          <div className="quiz-streak-item">
            <div className="value">{streak}</div>
            <div className="label">Serie</div>
          </div>
          <div className="quiz-streak-item">
            <div className="value">{bestStreak}</div>
            <div className="label">Record</div>
          </div>
        </div>

        <div className="quiz-question">
          <h2>
            Quel type est <span style={{ color: '#e94560' }}>super efficace</span> contre un
            Pokemon de type <span style={{ color: primaryColor }}>
              {typeFrenchNames[primaryType]}
            </span> ?
          </h2>

          <div className="quiz-pokemon-display">
            <img
              src={getPokemonImage(pokemon)}
              alt=""
              aria-hidden="true"
              decoding="async"
              width={120}
              height={120}
            />
            <div>
              <div className="pokemon-name" lang="en">{pokemon.name}</div>
              <span
                className="type-badge"
                style={{ backgroundColor: primaryColor, color: primaryText }}
              >
                {typeFrenchNames[primaryType]}
              </span>
            </div>
          </div>
        </div>

        <div aria-live="polite" aria-atomic="true">
          {revealed && (
            <p className={`game-result ${isCorrect ? 'correct' : 'wrong'}`} role="status">
              {isCorrect
                ? 'Excellent ! Bonne reponse !'
                : `Rate ! Les bonnes reponses etaient : ${correctTypes
                    .map((t) => typeFrenchNames[t as TypeName])
                    .join(', ')}`}
            </p>
          )}
        </div>

        <div className="quiz-type-choices">
          {typeChoices.map((type) => {
            let className = 'quiz-type-btn'
            if (revealed) {
              if (correctTypes.includes(type)) className += ' correct'
              else if (type === selectedType) className += ' wrong'
            }
            const bg = typeColors[type]
            return (
              <button
                key={type}
                className={className}
                style={{ backgroundColor: bg, color: getContrastTextColor(bg) }}
                onClick={() => handleAnswer(type)}
                disabled={revealed}
                type="button"
              >
                {typeFrenchNames[type]}
              </button>
            )
          })}
        </div>

        {revealed && (
          <div style={{ marginTop: '1.5rem' }}>
            <button className="game-next-btn" onClick={() => loadRound()} type="button">
              Question suivante →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Quiz
