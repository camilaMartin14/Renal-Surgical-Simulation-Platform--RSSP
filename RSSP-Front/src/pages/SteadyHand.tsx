import { useRef, useEffect, useState, useCallback } from 'react'
import GameFrame, { useGameSession } from '../components/GameFrame'
import DifficultySelector from '../components/DifficultySelector'
import ErrorFlash from '../components/ErrorFlash'
import type { Difficulty } from '../types'

const W = 500
const H = 400
const CENTER = { x: W / 2, y: H / 2 }
const CANVAS_BG = 'rgba(15, 23, 42, 0.4)'

function getParams(d: Difficulty) {
  return d === 'easy'
    ? { zoneR: 50, durationMs: 3000, amplitude: 18, speed: 0.0022 }
    : d === 'medium'
    ? { zoneR: 35, durationMs: 5000, amplitude: 38, speed: 0.0028 }
    : { zoneR: 22, durationMs: 7000, amplitude: 58, speed: 0.0035 }
}

function getZoneCenter(elapsedMs: number, amplitude: number, speed: number): { x: number; y: number } {
  const t = elapsedMs * speed
  return {
    x: CENTER.x + amplitude * Math.sin(t),
    y: CENTER.y + amplitude * 0.75 * Math.cos(t * 1.3),
  }
}

function SteadyHandGame() {
  const { endGame, trackMovement } = useGameSession()
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const params = getParams(difficulty)
  const { zoneR: ZONE_R, durationMs: DURATION_MS, amplitude, speed } = params
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [pos, setPos] = useState(CENTER)
  const [zoneCenter, setZoneCenter] = useState(CENTER)
  const [started, setStarted] = useState(false)
  const [timeHeld, setTimeHeld] = useState(0)
  const [exits, setExits] = useState(0)
  const [errorFlash, setErrorFlash] = useState(false)
  
  const startRef = useRef(0)
  const insideRef = useRef(true)
  const driftRef = useRef<number[]>([])
  const intervalRef = useRef<number>()

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = CANVAS_BG
    ctx.fillRect(0, 0, W, H)
    
    // Draw Zone
    ctx.fillStyle = 'rgba(56, 189, 248, 0.25)'
    ctx.beginPath()
    ctx.arc(zoneCenter.x, zoneCenter.y, ZONE_R, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'var(--accent)'
    ctx.lineWidth = 2
    ctx.stroke()
    
    // Draw Cursor
    ctx.fillStyle = 'var(--accent)'
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2)
    ctx.fill()
  }, [pos, zoneCenter, ZONE_R])

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    draw(ctx)
  }, [draw])

  useEffect(() => {
    if (!started) return
    
    intervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startRef.current
      setZoneCenter(getZoneCenter(elapsed, amplitude, speed))
      
      if (elapsed >= DURATION_MS) {
        clearInterval(intervalRef.current)
        setStarted(false)
        
        // Calculate Score
        const avgDrift = driftRef.current.length 
          ? driftRef.current.reduce((a, b) => a + b, 0) / driftRef.current.length 
          : 0
        const smoothness = Math.max(0, 100 - avgDrift)
          
        let perf = 100 - (exits * 12) - (avgDrift / 2)
        if (perf < 0) perf = 0
        if (perf > 100) perf = 100
        
        endGame({
          perfection: Math.round(perf),
          timeMs: DURATION_MS,
          score: Math.round(perf * 10),
          difficulty,
          extra: {
            errors: exits,
            avgDrift,
            smoothness,
          },
        })
        return
      }
      setTimeHeld(elapsed)
    }, 50)
    
    return () => clearInterval(intervalRef.current)
  }, [started, DURATION_MS, amplitude, speed, endGame, exits]) // Added dependencies

  const start = () => {
    setStarted(true)
    setTimeHeld(0)
    setExits(0)
    setErrorFlash(false)
    setZoneCenter(CENTER)
    driftRef.current = []
    insideRef.current = true
    startRef.current = Date.now()
  }

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (canvas.width / rect.width)
    const y = (e.clientY - rect.top) * (canvas.height / rect.height)
    setPos({ x, y })
    
    // Telemetry
    if (started) {
       trackMovement(e.clientX, e.clientY)
    }

    if (!started) return
    
    const elapsed = Date.now() - startRef.current
    const center = getZoneCenter(elapsed, amplitude, speed)
    const d = Math.hypot(x - center.x, y - center.y)
    driftRef.current.push(d)
    
    if (d > ZONE_R) {
      if (insideRef.current) {
        insideRef.current = false
        setExits((ex) => ex + 1)
        setErrorFlash(true)
      }
    } else {
      insideRef.current = true
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
        <DifficultySelector value={difficulty} onChange={setDifficulty} disabled={started} />
        <span className="metric">Tiempo: {(timeHeld / 1000).toFixed(1)} / {(DURATION_MS / 1000).toFixed(0)} s</span>
        <span className="metric">Salidas: {exits}</span>
      </div>

      <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', textAlign: 'center' }}>
        Sigue el círculo con el cursor sin salir. El círculo se mueve.
      </p>

      {!started && (
        <button onClick={start} className="btn-primary" style={{ marginBottom: '1rem' }}>
          Comenzar
        </button>
      )}

      <ErrorFlash trigger={errorFlash} onClear={() => setErrorFlash(false)} className="canvas-wrap" style={{ width: '100%', maxWidth: W, height: H }}>
        <canvas 
          ref={canvasRef} 
          width={W} 
          height={H} 
          onMouseMove={onMouseMove} 
          style={{ cursor: 'none', borderRadius: '8px' }} 
        />
      </ErrorFlash>
    </div>
  )
}

export default function SteadyHand() {
  return (
    <GameFrame title="Disección de Arteria Renal" gameId="steady-hand">
      <SteadyHandGame />
    </GameFrame>
  )
}
