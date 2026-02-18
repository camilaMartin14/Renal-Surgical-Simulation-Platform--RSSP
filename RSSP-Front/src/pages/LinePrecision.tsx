import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import GameFrame, { useGameSession } from '../components/GameFrame'
import DifficultySelector from '../components/DifficultySelector'
import ErrorFlash from '../components/ErrorFlash'
import GameActions from '../components/GameActions'
import { addResult } from '../store'
import type { Difficulty } from '../types'

const W = 700
const H = 400

/** Genera la ruta a seguir: fácil = casi recta, medio = ondulada, difícil = curvas muy marcadas. */
function buildPath(difficulty: Difficulty): [number, number][] {
  const pts: [number, number][] = []
  const n = difficulty === 'easy' ? 50 : difficulty === 'medium' ? 100 : 130
  const margin = 80
  const rangeX = W - 2 * margin

  for (let i = 0; i <= n; i++) {
    const t = i / n
    let x: number
    let y: number

    if (difficulty === 'easy') {
      // Casi recta: solo una ligera curvatura
      x = margin + rangeX * t
      y = H / 2 + 12 * Math.sin(t * Math.PI)
    } else if (difficulty === 'medium') {
      // Como está: dos ondulaciones
      x = margin + rangeX * t + 25 * Math.sin(t * Math.PI * 2)
      y = H / 2 + 75 * Math.sin(t * Math.PI)
    } else {
      // Difícil: curvas más pronunciadas y picos más marcados
      x = margin + rangeX * t + 45 * Math.sin(t * Math.PI * 3.5)
      y = H / 2 + 90 * Math.sin(t * Math.PI * 2.2)
    }

    pts.push([x, y])
  }

  return pts
}

function getTolerance(d: Difficulty): number {
  return d === 'easy' ? 28 : d === 'medium' ? 18 : 10
}

/** Distancia del punto (px,py) al segmento (x1,y1)-(x2,y2). Opcionalmente devuelve el parámetro t del segmento. */
function distToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): { dist: number; t: number } {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy) || 1
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (len * len)))
  const qx = x1 + t * dx
  const qy = y1 + t * dy
  return { dist: Math.hypot(px - qx, py - qy), t }
}

const CANVAS_BG = '#0f172a'
/** Radio máximo (px) para considerar que el cursor está "sobre" la ruta y avanzar progreso. */
const CATCH_RADIUS = 110
/** Progreso mínimo (0..1) para dar por completada la ruta. */
const FINISH_THRESHOLD = 0.97
/** Mínima distancia (px) entre puntos del trazo para registrar — efecto lápiz suave. */
const PENCIL_MIN_STEP = 3
/** Radio del círculo de inicio (px). El juego solo inicia con el cursor dentro de este círculo. */
const START_CIRCLE_R = 14

export default function LinePrecision() {
  return (
    <GameFrame title="Sutura de Vena Renal" gameId="line-precision">
      <LinePrecisionGame />
    </GameFrame>
  )
}

function LinePrecisionGame() {
  const { endGame, trackMovement } = useGameSession()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const PATH = useMemo(() => buildPath(difficulty), [difficulty])
  const [errorFlash, setErrorFlash] = useState(false)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [timeMs, setTimeMs] = useState(0)
  const [perfection, setPerfection] = useState(100)
  const [progress, setProgress] = useState(0)
  const [cursorPos, setCursorPos] = useState<[number, number] | null>(null)
  const [trailVersion, setTrailVersion] = useState(0)
  const startTime = useRef(0)
  const pathProgress = useRef(0)
  const deviations = useRef<number[]>([])
  const pencilTrail = useRef<[number, number][]>([])
  const TOL = getTolerance(difficulty)

  const resetLevel = useCallback(() => {
    setStarted(false)
    setFinished(false)
    setProgress(0)
    setTimeMs(0)
    setPerfection(100)
    setErrorFlash(false)
    setCursorPos(null)
    setTrailVersion(0)
    pathProgress.current = 0
    deviations.current = []
    pencilTrail.current = []
  }, [])

  const goNextLevel = useCallback(() => {
    setDifficulty((d) => (d === 'easy' ? 'medium' : d === 'medium' ? 'hard' : d))
    resetLevel()
  }, [resetLevel])

  useEffect(() => {
    resetLevel()
  }, [difficulty, resetLevel])

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, W, H)
    // Fondo semitransparente para dejar ver la imagen de fondo
    ctx.fillStyle = 'rgba(15, 23, 42, 0.4)' 
    ctx.fillRect(0, 0, W, H)

    // 1) Línea guía a seguir (punteada)
    ctx.setLineDash([10, 8])
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.9)'
    ctx.lineWidth = 5
    ctx.beginPath()
    PATH.forEach(([x, y], i) => {
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()
    ctx.setLineDash([])

    // 2) Trazo del cursor como lápiz (camino real que hizo el cursor)
    const trail = pencilTrail.current
    if (trail.length >= 1) {
      ctx.strokeStyle = '#0EA5E9' // var(--accent)
      ctx.lineWidth = 4
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(trail[0][0], trail[0][1])
      for (let i = 1; i < trail.length; i++) ctx.lineTo(trail[i][0], trail[i][1])
      ctx.stroke()
      if (trail.length === 1) {
        ctx.fillStyle = '#0EA5E9' // var(--accent)
        ctx.beginPath()
        ctx.arc(trail[0][0], trail[0][1], 5, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // 3) Punto de inicio (círculo azul — solo inicia si el cursor está dentro)
    ctx.fillStyle = '#10B981' // var(--success)
    ctx.beginPath()
    ctx.arc(PATH[0][0], PATH[0][1], START_CIRCLE_R, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#0F172A' // var(--text)
    ctx.lineWidth = 2
    ctx.stroke()

    // 4) Punto de llegada (círculo celeste)
    ctx.fillStyle = '#0EA5E9' // var(--accent)
    ctx.beginPath()
    ctx.arc(PATH[PATH.length - 1][0], PATH[PATH.length - 1][1], 14, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()

    // 5) Cursor actual (punto rojo) durante la partida
    if (cursorPos && started && !finished) {
      ctx.fillStyle = '#EF4444' // var(--danger)
      ctx.beginPath()
      ctx.arc(cursorPos[0], cursorPos[1], 6, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [PATH, started, finished, cursorPos])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    draw(ctx)
  }, [draw, progress, trailVersion])

  useEffect(() => {
    if (!started || finished) return
    const id = setInterval(() => setTimeMs(Date.now() - startTime.current), 50)
    return () => clearInterval(id)
  }, [started, finished])

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const mx = (e.clientX - rect.left) * scaleX
    const my = (e.clientY - rect.top) * scaleY
    setCursorPos([mx, my])
    
    // Send telemetry to GameSession
    trackMovement(e.clientX, e.clientY)

    if (finished) return

    if (!started) {
      const d = Math.hypot(mx - PATH[0][0], my - PATH[0][1])
      if (d < START_CIRCLE_R) {
        setStarted(true)
        startTime.current = Date.now()
        pathProgress.current = 0
        deviations.current = []
        pencilTrail.current = [[mx, my]]
      }
      return
    }

    // Registrar posición del cursor como trazo de lápiz
    const trail = pencilTrail.current
    if (trail.length > 0) {
      const last = trail[trail.length - 1]
      const distFromLast = Math.hypot(mx - last[0], my - last[1])
      if (distFromLast >= PENCIL_MIN_STEP) {
        trail.push([mx, my])
        setTrailVersion((v) => v + 1)
      }
    } else {
      pencilTrail.current = [[mx, my]]
      setTrailVersion(1)
    }

    const n = PATH.length
    const numSegments = n - 1
    let bestDist = 1e9
    let bestProgress = 0

    for (let i = 0; i < numSegments; i++) {
      const { dist, t } = distToSegment(mx, my, PATH[i][0], PATH[i][1], PATH[i + 1][0], PATH[i + 1][1])
      if (dist < bestDist) {
        bestDist = dist
        bestProgress = (i + t) / numSegments
      }
    }

    if (bestDist > TOL * 2) {
      setErrorFlash(true)
    }

    if (bestDist < CATCH_RADIUS) {
      deviations.current.push(bestDist)
      const newProgress = Math.max(pathProgress.current, bestProgress)
      pathProgress.current = newProgress
      setProgress(Math.round(newProgress * 100))

      if (newProgress >= FINISH_THRESHOLD) {
        setFinished(true)
        const avgDev =
          deviations.current.length > 0
            ? deviations.current.reduce((a, b) => a + b, 0) / deviations.current.length
            : 0
        const perf = Math.max(0, 100 - (avgDev / TOL) * 25)
        setPerfection(Math.round(perf))
        const routeAdherence = Math.min(pathProgress.current, 1) * 100
        
        endGame({
          perfection: perf,
          timeMs: Date.now() - startTime.current,
          difficulty,
          routeAdherence,
          extra: {
            avgDeviation: avgDev,
            tolerance: TOL,
            routeAdherence,
          },
        })
      }
    }
  }

  const handleMouseLeave = () => {
    setCursorPos(null)
  }

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <DifficultySelector value={difficulty} onChange={setDifficulty} disabled={started && !finished} />
        <span className="metric">Tiempo: {(timeMs / 1000).toFixed(2)} s</span>
        <span className="metric">Progreso: {progress}%</span>
        {finished && <span className="metric">Perfección: {perfection}%</span>}
      </div>

      <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
        Coloca el cursor <strong>dentro del círculo azul</strong> para empezar (solo inicia cuando está dentro). Al mover el cursor queda registrado el camino como un <strong>trazo de lápiz</strong> (línea sólida). Sigue la línea punteada lo más fielmente posible. Cada nivel tiene una ruta distinta (más curvas = más difícil).
      </p>
      
      <ErrorFlash 
        trigger={errorFlash} 
        onClear={() => setErrorFlash(false)} 
        style={{ position: 'relative', width: W, height: H, margin: '0 auto', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}
      >
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ cursor: 'none', background: CANVAS_BG }}
        />
      </ErrorFlash>

      <GameActions
        started={started}
        finished={finished}
        difficulty={difficulty}
        showStartButton={false}
        onStart={() => {}}
        onPlayAgain={resetLevel}
        onNextLevel={goNextLevel}
      />
    </div>
  )
}
