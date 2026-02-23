import type { GameId, GameResult, Difficulty } from '../types';

const KEY = 'justina-game-results';

function load(): GameResult[] {
  try {
    const s = localStorage.getItem(KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

function save(results: GameResult[]) {
  localStorage.setItem(KEY, JSON.stringify(results));
}

export function addResult(result: GameResult) {
  const withMeta: GameResult = {
    ...result,
    at: result.at ?? new Date().toISOString(),
  };
  const list = load();
  list.push(withMeta);
  save(list);
}

export function updateResult(at: string, partial: Partial<GameResult>) {
  const list = load();
  const idx = list.findIndex((r) => r.at === at);
  if (idx === -1) return;
  list[idx] = { ...list[idx], ...partial };
  save(list);
}

export function getAllResults(): GameResult[] {
  return load();
}

export function getResultsByGame(gameId: GameId): GameResult[] {
  return load().filter((r) => r.gameId === gameId);
}

export function getBestPerGame(gameId: GameId): { perfection: number; timeMs: number } | null {
  const list = getResultsByGame(gameId);
  if (!list.length) return null;
  const best = list.reduce((a, b) => (a.perfection >= b.perfection ? a : b));
  return { perfection: best.perfection, timeMs: best.timeMs };
}

export function getResultsByGameAndDifficulty(gameId: GameId, difficulty: Difficulty): GameResult[] {
  return load().filter((r) => r.gameId === gameId && r.difficulty === difficulty);
}

export function getStatsForGame(gameId: GameId): {
  attempts: number;
  avgPerfection: number;
  avgTimeMs: number;
  bestPerfection: number;
  bestTimeMs: number;
  byDifficulty: Record<Difficulty, { attempts: number; avgPerfection: number; avgTimeMs: number }>;
} {
  const list = getResultsByGame(gameId);
  const byDifficulty: Record<Difficulty, { attempts: number; avgPerfection: number; avgTimeMs: number }> = {
    easy: { attempts: 0, avgPerfection: 0, avgTimeMs: 0 },
    medium: { attempts: 0, avgPerfection: 0, avgTimeMs: 0 },
    hard: { attempts: 0, avgPerfection: 0, avgTimeMs: 0 },
  };
  for (const d of ['easy', 'medium', 'hard'] as const) {
    const sub = list.filter((r) => r.difficulty === d);
    byDifficulty[d].attempts = sub.length;
    if (sub.length) {
      byDifficulty[d].avgPerfection = sub.reduce((a, r) => a + r.perfection, 0) / sub.length;
      byDifficulty[d].avgTimeMs = sub.reduce((a, r) => a + r.timeMs, 0) / sub.length;
    }
  }
  const attempts = list.length;
  const avgPerfection = attempts ? list.reduce((a, r) => a + r.perfection, 0) / attempts : 0;
  const avgTimeMs = attempts ? list.reduce((a, r) => a + r.timeMs, 0) / attempts : 0;
  const best = list.length ? list.reduce((a, b) => (a.perfection >= b.perfection ? a : b)) : null;
  return {
    attempts,
    avgPerfection,
    avgTimeMs,
    bestPerfection: best?.perfection ?? 0,
    bestTimeMs: best?.timeMs ?? 0,
    byDifficulty,
  };
}
