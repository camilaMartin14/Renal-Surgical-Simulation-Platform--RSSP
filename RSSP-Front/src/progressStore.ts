import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserProgress, UserRank, GameId } from './types'

interface ProgressState extends UserProgress {
  setRank: (rank: UserRank) => void
  completeGame: (gameId: GameId) => void
  resetProgress: () => void
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      rank: 'Estudiante',
      completedGames: [],
      
      setRank: (rank) => set({ rank }),
      completeGame: (gameId) => set((state) => ({
        completedGames: state.completedGames.includes(gameId) 
          ? state.completedGames 
          : [...state.completedGames, gameId]
      })),
      resetProgress: () => set({ rank: 'Estudiante', completedGames: [] })
    }),
    {
      name: 'justina-user-progress',
    }
  )
)

export const RANK_ORDER: UserRank[] = ['Estudiante', 'Residente', 'Cirujano Jefe']

export const canPlayGame = (gameRank: UserRank | undefined, userRank: UserRank): boolean => {
  if (!gameRank) return true
  const userRankIndex = RANK_ORDER.indexOf(userRank)
  const gameRankIndex = RANK_ORDER.indexOf(gameRank)
  return userRankIndex >= gameRankIndex
}
