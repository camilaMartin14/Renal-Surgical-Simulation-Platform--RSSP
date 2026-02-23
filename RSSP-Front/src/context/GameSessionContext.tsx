import { createContext, useContext } from 'react'
import type { Difficulty } from '../types'

export interface EndGameMetrics {
  perfection: number
  timeMs: number
  score?: number
  difficulty?: Difficulty
  routeAdherence?: number
  extra?: Record<string, number>
}

export interface GameSessionContextType {
  startGame: () => void
  endGame: (metrics: EndGameMetrics) => void
  trackMovement: (x: number, y: number) => void
  phase: 'pre' | 'playing' | 'post'
}

export const GameSessionContext = createContext<GameSessionContextType | null>(null)

export const useGameSession = () => {
  const ctx = useContext(GameSessionContext)
  if (!ctx) throw new Error('useGameSession must be used within a GameFrame')
  return ctx
}
