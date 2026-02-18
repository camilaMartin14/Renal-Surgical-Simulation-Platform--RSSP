import type { GameId, GameResult, Difficulty } from './types'

const KEY = 'justina-game-results'
const USER_KEY = 'justina-current-user'

export const API_BASE_URL = 'http://localhost:5023'

const TEST_NAME_BY_GAME: Record<GameId, string> = {
  'line-precision': 'Line Precision',
  'reflex': 'Reflex Training',
  'suture': 'Suture Practice',
  'steady-hand': 'Steady Hand',
  'tumor-ablation': 'Tumor Ablation',
}

type CurrentUser = {
  id: number
  email?: string
}

function load(): GameResult[] {
  try {
    const s = localStorage.getItem(KEY)
    return s ? JSON.parse(s) : []
  } catch {
    return []
  }
}

function save(results: GameResult[]) {
  localStorage.setItem(KEY, JSON.stringify(results))
}

export function getCurrentUser(): CurrentUser | null {
  try {
    const s = localStorage.getItem(USER_KEY)
    return s ? (JSON.parse(s) as CurrentUser) : null
  } catch {
    return null
  }
}

export function setCurrentUser(user: CurrentUser | null) {
  if (!user) {
    localStorage.removeItem(USER_KEY)
    return
  }
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function addResult(result: GameResult) {
  const list = load()
  list.push({ ...result, at: new Date().toISOString() })
  save(list)

  // Además de persistir en localStorage para mantener la UI funcionando offline,
  // intentamos registrar el intento en el backend para tener un histórico centralizado.
  // Este llamado es "fire and forget": si falla, no interrumpe el flujo del juego.
  void postAttemptToBackend(result)
}

// Envía al backend un resumen del intento usando el endpoint de Attempts.
// Se hace el mapeo mínimo desde el modelo de GameResult a la estructura que
// espera la API de ASP.NET.
async function postAttemptToBackend(result: GameResult) {
  const user = getCurrentUser()
  if (!user?.id) return

  const testId = await resolveTestId(result.gameId)
  if (!testId) return

  try {
    await fetch(`${API_BASE_URL}/api/attempts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        gameKey: result.gameId,
        gameDifficulty: result.difficulty ?? 'medium',
        userId: user.id,
        testId,
        duration: result.timeMs,
        errorCount: result.extra?.errors ?? 0,
        trajectoryScore: result.routeAdherence ?? null,
        precisionScore: result.perfection,
        smoothnessScore: result.extra?.smoothness ?? null,
        completionStatus: 'Completed',
        date: result.at ?? new Date().toISOString(),
      }),
    })
  } catch {
    // Si el backend no está disponible o hay error, simplemente lo ignoramos
    // para no afectar la experiencia de juego en el cliente.
  }
}

async function resolveTestId(gameId: GameId): Promise<number | null> {
  const expectedName = TEST_NAME_BY_GAME[gameId]
  if (!expectedName) return null

  try {
    const response = await fetch(`${API_BASE_URL}/api/tests`)
    if (!response.ok) return null
    const tests: { id: number; name: string }[] = await response.json()
    const match = tests.find((t) => t.name === expectedName)
    return match?.id ?? null
  } catch {
    return null
  }
}

export function getResultsByGame(gameId: GameId): GameResult[] {
  return load().filter((r) => r.gameId === gameId)
}

export function getBestPerGame(gameId: GameId): { perfection: number; timeMs: number } | null {
  const list = getResultsByGame(gameId)
  if (!list.length) return null
  const best = list.reduce((a, b) => (a.perfection >= b.perfection ? a : b))
  return { perfection: best.perfection, timeMs: best.timeMs }
}

export function getResultsByGameAndDifficulty(gameId: GameId, difficulty: Difficulty): GameResult[] {
  return load().filter((r) => r.gameId === gameId && r.difficulty === difficulty)
}

export function getStatsForGame(gameId: GameId): {
  attempts: number
  avgPerfection: number
  avgTimeMs: number
  bestPerfection: number
  bestTimeMs: number
  byDifficulty: Record<Difficulty, { attempts: number; avgPerfection: number; avgTimeMs: number }>
} {
  const list = getResultsByGame(gameId)
  const byDifficulty: Record<Difficulty, { attempts: number; avgPerfection: number; avgTimeMs: number }> = {
    easy: { attempts: 0, avgPerfection: 0, avgTimeMs: 0 },
    medium: { attempts: 0, avgPerfection: 0, avgTimeMs: 0 },
    hard: { attempts: 0, avgPerfection: 0, avgTimeMs: 0 },
  }
  for (const d of ['easy', 'medium', 'hard'] as const) {
    const sub = list.filter((r) => r.difficulty === d)
    byDifficulty[d].attempts = sub.length
    if (sub.length) {
      byDifficulty[d].avgPerfection = sub.reduce((a, r) => a + r.perfection, 0) / sub.length
      byDifficulty[d].avgTimeMs = sub.reduce((a, r) => a + r.timeMs, 0) / sub.length
    }
  }
  const attempts = list.length
  const avgPerfection = attempts ? list.reduce((a, r) => a + r.perfection, 0) / attempts : 0
  const avgTimeMs = attempts ? list.reduce((a, r) => a + r.timeMs, 0) / attempts : 0
  const best = list.length ? list.reduce((a, b) => (a.perfection >= b.perfection ? a : b)) : null
  return {
    attempts,
    avgPerfection,
    avgTimeMs,
    bestPerfection: best?.perfection ?? 0,
    bestTimeMs: best?.timeMs ?? 0,
    byDifficulty,
  }
}

export function getAllResults(): GameResult[] {
  return load()
}
