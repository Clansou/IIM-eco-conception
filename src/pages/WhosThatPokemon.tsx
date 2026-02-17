import { useState, useEffect, useCallback } from 'react'
import { Pokemon } from '../types/pokemon'
import { getPokemon, getPokemonImage } from '../utils/api'
import Loading from '../components/Loading'

function getRandomIds(count: number, max: number): number[] {
  const ids = new Set<number>()
  while (ids.size < count) {
    ids.add(Math.floor(Math.random() * max) + 1)
  }
  return Array.from(ids)
}

function WhosThatPokemon() {
  const [correctPokemon, setCorrectPokemon] = useState<Pokemon | null>(null)
  const [choices, setChoices] = useState<string[]>([])
  const [revealed, setRevealed] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  const loadRound = useCallback(async () => {
    setLoading(true)
    setRevealed(false)
    setSelectedAnswer(null)

    const ids = getRandomIds(4, 151)
    const pokemons = await Promise.all(ids.map((id) => getPokemon(id)))
    const correctIndex = Math.floor(Math.random() * 4)

    setCorrectPokemon(pokemons[correctIndex])
    setChoices(pokemons.map((p) => p.name))
    setLoading(false)
  }, [])

  useEffect(() => {
    loadRound()
  }, [loadRound])

  const handleAnswer = (name: string) => {
    if (revealed) return
    setSelectedAnswer(name)
    setRevealed(true)
    setTotal((t) => t + 1)

    if (name === correctPokemon?.name) {
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

  if (loading) return <Loading text="Preparation du jeu..." />

  const isCorrect = selectedAnswer === correctPokemon?.name

  return (
    <div className="page">
      <div className="game-container">
        <div className="page-header">
          <h1>Qui est ce Pokemon ?</h1>
          <p>Devinez le Pokemon a partir de sa silhouette !</p>
        </div>

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
            <div className="label">Meilleure serie</div>
          </div>
        </div>

        <div className="game-image-container">
          {correctPokemon && (
            <img
              className={`game-image ${revealed ? 'revealed' : 'silhouette'}`}
              src={getPokemonImage(correctPokemon)}
              alt="Pokemon mystere"
            />
          )}
        </div>

        {revealed && (
          <p className={`game-result ${isCorrect ? 'correct' : 'wrong'}`}>
            {isCorrect ? 'Bien joue !' : `C'etait ${correctPokemon?.name} !`}
          </p>
        )}

        <div className="game-choices">
          {choices.map((name) => {
            let className = 'game-choice-btn'
            if (revealed) {
              if (name === correctPokemon?.name) className += ' correct'
              else if (name === selectedAnswer) className += ' wrong'
            }
            return (
              <button
                key={name}
                className={className}
                onClick={() => handleAnswer(name)}
                disabled={revealed}
              >
                {name}
              </button>
            )
          })}
        </div>

        {revealed && (
          <button className="game-next-btn" onClick={loadRound}>
            Pokemon suivant →
          </button>
        )}
      </div>
    </div>
  )
}

export default WhosThatPokemon
