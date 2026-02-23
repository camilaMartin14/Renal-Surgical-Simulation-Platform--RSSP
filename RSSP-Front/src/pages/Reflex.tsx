import { useState, useCallback, useRef, useEffect } from 'react'
import GameFrame from '../components/GameFrame'
import { useGameSession } from '../context/GameSessionContext'
import DifficultySelector from '../components/DifficultySelector'
import ErrorFlash from '../components/ErrorFlash'
import type { Difficulty } from '../types'

function getN(d: Difficulty): number {
  return d === 'easy' ? 6 : d === 'medium' ? 12 : 18
}

const W = 600
const H = 450
const HARD_VISIBLE_MS = 2000
const HARD_GAP_MS = 800

function ReflexGame() {
  const { endGame, trackMovement } = useGameSession()
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const N = getN(difficulty)
  const isBlinkMode = difficulty === 'hard'
  const [points, setPoints] = useState<{ x: number; y: number; id: number; clicked?: boolean }[]>([])
  const [visibleId, setVisibleId] = useState<number | null>(null)
  const [timeMs, setTimeMs] = useState(0)
  const [reactionTimes, setReactionTimes] = useState<number[]>([])
  const [phase, setPhase] = useState<'ready' | 'play'>('ready')
  const [clickCount, setClickCount] = useState(0)
  const [errorFlash, setErrorFlash] = useState(false)
  const [missCount, setMissCount] = useState(0)
  
  const timerRef = useRef<number>(0)
  const showAtRef = useRef(0)
  const reactionTimesRef = useRef<number[]>([])
  const hideTimeoutRef = useRef<number>(0)
  const nextShowTimeoutRef = useRef<number>(0)
  const currentIndexRef = useRef(0)
  const missCountRef = useRef(0)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current)
      clearTimeout(hideTimeoutRef.current)
      clearTimeout(nextShowTimeoutRef.current)
    }
  }, [])

  const spawn = useCallback(() => {
    const list: { x: number; y: number; id: number; clicked?: boolean }[] = []
    for (let i = 0; i < N; i++) {
      list.push({
        x: 40 + Math.random() * (W - 80),
        y: 40 + Math.random() * (H - 80),
        id: i,
      })
    }
    setPoints(list)
    setReactionTimes([])
    reactionTimesRef.current = []
    setClickCount(0)
    setMissCount(0)
    missCountRef.current = 0
    setVisibleId(null)
    currentIndexRef.current = 0
    setPhase('play')
    setTimeMs(0)
    showAtRef.current = Date.now()
    timerRef.current = window.setInterval(() => setTimeMs(Date.now() - showAtRef.current), 50)

    if (isBlinkMode) {
      nextShowTimeoutRef.current = window.setTimeout(() => {
        setVisibleId(0)
        showAtRef.current = Date.now()
      }, 400)
    }
  }, [N, isBlinkMode])

  const showNextHard = useCallback(() => {
    const idx = currentIndexRef.current
    if (idx >= N) {
      clearInterval(timerRef.current)
      const times = reactionTimesRef.current
      const totalTime = Date.now() - showAtRef.current
      const avgRt = times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0
      const misses = missCountRef.current
      const perfection = Math.max(0, 100 - (avgRt / 500) * 30 - misses * 5)
      
      endGame({
        perfection,
        timeMs: totalTime,
        score: Math.round(perfection * 10),
        difficulty,
        extra: {
          avgReactionTimeMs: avgRt,
          errors: misses,
        },
      })
      return
    }
    setVisibleId(idx)
    showAtRef.current = Date.now()
  }, [N, endGame])

  const handleClick = (id: number) => {
    if (phase !== 'play') return
    if (isBlinkMode && visibleId !== id) return
    const now = Date.now()
    const rt = now - showAtRef.current
    reactionTimesRef.current.push(rt)
    setReactionTimes((r) => [...r, rt])
    setPoints((p) => p.map((q) => (q.id === id ? { ...q, clicked: true } : q)))
    setClickCount((c) => {
      const next = c + 1
      if (isBlinkMode) {
        clearTimeout(hideTimeoutRef.current)
        setVisibleId(null)
        currentIndexRef.current = id + 1
        if (next >= N) {
          clearInterval(timerRef.current)
          clearTimeout(nextShowTimeoutRef.current)
          const times = reactionTimesRef.current
          const totalTime = now - showAtRef.current
          const avgRt = times.reduce((a, b) => a + b, 0) / times.length
          const misses = missCountRef.current
          const perfection = Math.max(0, 100 - (avgRt / 500) * 30 - misses * 5)
          
          endGame({
            perfection,
            timeMs: totalTime,
            score: Math.round(perfection * 10),
            difficulty,
            extra: {
              avgReactionTimeMs: avgRt,
              errors: misses,
            },
          })
        } else {
          nextShowTimeoutRef.current = window.setTimeout(showNextHard, HARD_GAP_MS)
        }
        return next
      }
      if (next >= N) {
        clearInterval(timerRef.current)
        const times = reactionTimesRef.current
        const totalTime = now - showAtRef.current
        const avgRt = times.reduce((a, b) => a + b, 0) / times.length
        const perfection = Math.max(0, 100 - (avgRt / 500) * 30 - missCount * 5)
        
        endGame({
          perfection,
          timeMs: totalTime,
          score: Math.round(perfection * 10),
          difficulty,
          extra: {
            avgReactionTimeMs: avgRt,
            errors: missCount,
          },
        })
      }
      return next
    })
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (phase !== 'play') return
    // Telemetry tracking handled by onMouseMove, but click is also an event
    trackMovement(e.clientX, e.clientY)

    const target = e.target as HTMLElement
    if (target.getAttribute('data-target') === 'true') return
    setErrorFlash(true)
    setMissCount((m) => m + 1)
  }
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
     if (phase === 'play') {
       trackMovement(e.clientX, e.clientY)
     }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <DifficultySelector value={difficulty} onChange={setDifficulty} disabled={phase === 'play'} />
        <span className="metric">Tiempo: {(timeMs / 1000).toFixed(2)} s</span>
        <span className="metric">Puntos: {clickCount} / {N}</span>
        {missCount > 0 && <span className="metric" style={{ color: 'var(--danger)' }}>Errores: {missCount}</span>}
      </div>

      <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', textAlign: 'center' }}>
        {isBlinkMode
          ? 'Nivel difícil: los puntos aparecen en secuencia. Haz clic en cada uno lo más rápido posible.'
          : 'Toca solo los puntos rosa (Azalea). Clic fuera = error crítico.'}
      </p>

      {phase === 'ready' && (
        <button onClick={spawn} className="btn-primary" style={{ marginBottom: '1rem' }}>
          Comenzar
        </button>
      )}

      <ErrorFlash trigger={errorFlash} onClear={() => setErrorFlash(false)} className="canvas-wrap" style={{ width: '100%', maxWidth: W, height: H }}>
        <div 
          style={{ width: W, height: H, position: 'relative', background: 'rgba(200, 217, 230, 0.05)', borderRadius: '8px', cursor: 'crosshair' }} 
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
        >
          {points.map((p) => {
            const showInHard = isBlinkMode ? visibleId === p.id : true
            const isClicked = p.clicked
            if (isBlinkMode && !showInHard && !isClicked) return null
            return (
              <button
                key={p.id}
                data-target="true"
                onClick={(e) => { e.stopPropagation(); handleClick(p.id); }}
                disabled={isClicked}
                style={{
                  position: 'absolute',
                  left: p.x - 14,
                  top: p.y - 14,
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: isClicked ? 'var(--success)' : showInHard ? '#dc2626' : 'transparent',
                  border: `2px solid ${showInHard || isClicked ? '#fff' : 'transparent'}`,
                  padding: 0,
                  cursor: isClicked ? 'default' : 'pointer'
                }}
              />
            )
          })}
        </div>
      </ErrorFlash>
    </div>
  )
}

export default function Reflex() {
  return (
    <GameFrame title="Control de Hemorragia Renal" gameId="reflex">
      <ReflexGame />
    </GameFrame>
  )
}
