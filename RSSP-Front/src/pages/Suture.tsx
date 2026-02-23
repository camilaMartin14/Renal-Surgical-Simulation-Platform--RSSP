import { useMemo, useState, useRef, useEffect } from 'react'
import GameFrame from '../components/GameFrame'
import { useGameSession } from '../context/GameSessionContext'
import DifficultySelector from '../components/DifficultySelector'
import ErrorFlash from '../components/ErrorFlash'
import type { Difficulty } from '../types'

const W = 600
const H = 400

function getTargets(d: Difficulty): { x: number; y: number; r: number }[] {
  // Positions relative to W=600, H=400
  const base = [
    [120, 150], [280, 120], [450, 160], [500, 280], [350, 320], [180, 300],
  ].map(([x, y]) => ({ x, y, r: 22 }))
  
  if (d === 'easy') return base.slice(0, 4)
  if (d === 'hard') {
    const extras = [
      [300, 200], [400, 220]
    ].map(([x, y]) => ({ x, y, r: 20 }))
    
    return [...base, ...extras]
  }
  return base
}

function SutureGame() {
  const { endGame, trackMovement } = useGameSession()
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const TARGETS = useMemo(() => {
    const t = getTargets(difficulty)
    // Re-index logic? No, getTargets returns array, index is implied.
    return t
  }, [difficulty])
  
  const [order, setOrder] = useState<number[]>([])
  const [started, setStarted] = useState(false)
  const [timeMs, setTimeMs] = useState(0)
  const [errorFlash, setErrorFlash] = useState(false)
  const [mistakes, setMistakes] = useState(0)
  
  const startRef = useRef(0)
  const intervalRef = useRef<number>(0)

  const start = () => {
    setOrder([])
    setMistakes(0)
    setStarted(true)
    setTimeMs(0)
    setErrorFlash(false)
    startRef.current = Date.now()
    intervalRef.current = window.setInterval(() => setTimeMs(Date.now() - startRef.current), 50)
  }

  useEffect(() => {
    return () => clearInterval(intervalRef.current)
  }, [])

  const handleClick = (index: number) => {
    if (!started) return
    
    // Telemetry tracking for click
    // Note: Mouse move tracks path, click confirms action.
    
    const next = order.length
    if (index !== next) {
      setErrorFlash(true)
      setMistakes(m => m + 1)
      return
    }
    
    const newOrder = [...order, index]
    setOrder(newOrder)
    
    if (newOrder.length >= TARGETS.length) {
      window.clearInterval(intervalRef.current)
      const t = Date.now() - startRef.current
      
      // Scoring:
      // Base 100
      // Time penalty: -1 per second?
      // Mistake penalty: -10 per mistake?
      let perf = 100 - (mistakes * 10) - (t / 1000) * 2
      if (perf < 0) perf = 0
      if (perf > 100) perf = 100
      
      endGame({
        perfection: Math.round(perf),
        timeMs: t,
        score: Math.round(perf * 10),
        difficulty,
        extra: {
          errors: mistakes,
          targets: TARGETS.length,
        },
      })
    }
  }
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (started) {
      trackMovement(e.clientX, e.clientY)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
        <DifficultySelector value={difficulty} onChange={setDifficulty} disabled={started} />
        <span className="metric">Tiempo: {(timeMs / 1000).toFixed(2)} s</span>
        <span className="metric">Puntos: {order.length} / {TARGETS.length}</span>
        {mistakes > 0 && <span className="metric" style={{ color: 'var(--danger)' }}>Errores: {mistakes}</span>}
      </div>
      
      <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', textAlign: 'center' }}>
        Haz clic en los círculos en orden numérico (1 → 2 → …).
      </p>

      {!started && (
        <button onClick={start} className="btn-primary" style={{ marginBottom: '1rem' }}>
          Comenzar
        </button>
      )}

      <ErrorFlash trigger={errorFlash} onClear={() => setErrorFlash(false)} message="¡Orden Incorrecto!" className="canvas-wrap" style={{ width: '100%', maxWidth: W, height: H }}>
          <div 
          style={{ width: W, height: H, position: 'relative', background: 'rgba(200, 217, 230, 0.05)', borderRadius: '8px' }}
          onMouseMove={handleMouseMove}
        >
          {TARGETS.map((t, i) => (
            <div
              key={i}
              role={started ? 'button' : undefined}
              tabIndex={started ? 0 : -1}
              onClick={(e) => { e.stopPropagation(); handleClick(i); }}
              onKeyDown={(e) => {
                if (!started) return
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleClick(i)
                }
              }}
              style={{
                position: 'absolute',
                left: t.x - t.r,
                top: t.y - t.r,
                width: t.r * 2,
                height: t.r * 2,
                borderRadius: '50%',
                border: '3px solid #F7C9D4', // Azalea
                background: order.includes(i) ? '#F7C9D4' : 'rgba(22, 36, 46, 0.6)', // Azalea or Dark Navy transparent
                cursor: started ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: order.includes(i) ? '#2F4858' : '#F5EFEB', // Navy text on active, Beige on inactive
                fontWeight: 700,
                fontSize: '1.2rem',
                transition: 'background 0.2s, transform 0.1s'
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </ErrorFlash>
    </div>
  )
}

export default function Suture() {
  return (
    <GameFrame title="Sutura de Trasplante Renal" gameId="suture">
      <SutureGame />
    </GameFrame>
  )
}
