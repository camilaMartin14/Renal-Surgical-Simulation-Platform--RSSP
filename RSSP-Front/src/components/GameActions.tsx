import type { Difficulty } from '../types'

const NEXT_LEVEL: Record<Difficulty, Difficulty | null> = {
  easy: 'medium',
  medium: 'hard',
  hard: null,
}

interface GameActionsProps {
  started: boolean
  finished: boolean
  difficulty: Difficulty
  onStart: () => void
  onPlayAgain: () => void
  onNextLevel: () => void
  /** Si false, no se muestra el botón Iniciar (p. ej. cuando el juego empieza por otra acción). */
  showStartButton?: boolean
}

export default function GameActions({
  started,
  finished,
  difficulty,
  onStart,
  onPlayAgain,
  onNextLevel,
  showStartButton = true,
}: GameActionsProps) {
  if (!started) {
    if (!showStartButton) return null
    return (
      <button type="button" onClick={onStart} style={{ marginBottom: '1rem' }}>
        Iniciar
      </button>
    )
  }
  if (!finished) return null
  const next = NEXT_LEVEL[difficulty]
  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
      <button type="button" onClick={onPlayAgain}>
        Jugar de nuevo
      </button>
      {next && (
        <button type="button" onClick={onNextLevel} className="secondary">
        Siguiente nivel ({next === 'medium' ? 'Medio' : 'Difícil'})
        </button>
      )}
    </div>
  )
}
