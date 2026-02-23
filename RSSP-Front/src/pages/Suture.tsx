import { useMemo, useState, useRef, useEffect } from 'react'
import GameFrame from '../components/GameFrame'
import { useGameSession } from '../context/GameSessionContext'
import DifficultySelector from '../components/DifficultySelector'
import ErrorFlash from '../components/ErrorFlash'
import type { Difficulty } from '../types'
import { useGameSound } from '../hooks/useGameSound'

const W = 600
const H = 400

// Maze configuration for each difficulty
interface MazeConfig {
  walls: { x: number, y: number, w: number, h: number }[]
  start: { x: number, y: number }
  end: { x: number, y: number }
}

function getMaze(d: Difficulty): MazeConfig {
  // Walls: x, y, width, height
  // Start/End: x, y (center points)
  
  if (d === 'easy') {
    return {
      walls: [
        { x: 100, y: 0, w: 20, h: 300 },
        { x: 250, y: 100, w: 20, h: 300 },
        { x: 400, y: 0, w: 20, h: 250 },
        { x: 400, y: 300, w: 200, h: 20 },
      ],
      start: { x: 50, y: 50 },
      end: { x: 550, y: 350 }
    }
  }
  
  if (d === 'medium') {
    return {
      walls: [
        { x: 0, y: 80, w: 450, h: 20 },
        { x: 150, y: 180, w: 450, h: 20 },
        { x: 0, y: 280, w: 450, h: 20 },
        { x: 500, y: 0, w: 20, h: 180 },
        { x: 100, y: 180, w: 20, h: 120 },
      ],
      start: { x: 50, y: 40 },
      end: { x: 550, y: 350 }
    }
  }
  
  // Hard
  return {
    walls: [
      { x: 80, y: 0, w: 20, h: 320 },
      { x: 180, y: 80, w: 20, h: 320 },
      { x: 280, y: 0, w: 20, h: 320 },
      { x: 380, y: 80, w: 20, h: 320 },
      { x: 480, y: 0, w: 20, h: 320 },
    ],
    start: { x: 40, y: 50 },
    end: { x: 550, y: 350 }
  }
}

function SutureGame() {
  const { endGame, trackMovement } = useGameSession()
  const { playStart, playSuccess, playError, playClick } = useGameSound()
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const MAZE = useMemo(() => getMaze(difficulty), [difficulty])
  
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [timeMs, setTimeMs] = useState(0)
  const [errorFlash, setErrorFlash] = useState(false)
  const [collisions, setCollisions] = useState(0)
  const [cursorPos, setCursorPos] = useState<{x: number, y: number} | null>(null)
  
  const startRef = useRef(0)
  const intervalRef = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => clearInterval(intervalRef.current)
  }, [])

  // Check collision with walls
  const checkCollision = (x: number, y: number) => {
    // Check maze walls
    for (const wall of MAZE.walls) {
      if (x >= wall.x && x <= wall.x + wall.w && 
          y >= wall.y && y <= wall.y + wall.h) {
        return true
      }
    }
    // Check boundaries
    if (x < 0 || x > W || y < 0 || y > H) return true
    
    return false
  }

  // Check if reached end
  const checkWin = (x: number, y: number) => {
    const dx = x - MAZE.end.x
    const dy = y - MAZE.end.y
    return Math.sqrt(dx*dx + dy*dy) < 25 // 25px radius for end goal
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (finished) return

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      setCursorPos({x, y})
      trackMovement(e.clientX, e.clientY)

      if (started) {
        if (checkCollision(x, y)) {
          if (!errorFlash) {
            playError()
            setErrorFlash(true)
            setCollisions(c => c + 1)
            // Optional: Reset to start or just penalty?
            // For now just penalty and visual feedback
            setTimeout(() => setErrorFlash(false), 500)
          }
        } else {
            // Check win condition
            if (checkWin(x, y)) {
                handleWin()
            }
        }
      } else {
        // Check start condition
        const dx = x - MAZE.start.x
        const dy = y - MAZE.start.y
        if (Math.sqrt(dx*dx + dy*dy) < 20) { // Start radius
             setStarted(true)
             playStart()
             startRef.current = Date.now()
             intervalRef.current = window.setInterval(() => setTimeMs(Date.now() - startRef.current), 50)
        }
      }
    }
  }

  const handleWin = () => {
    clearInterval(intervalRef.current)
    setFinished(true)
    playSuccess()
    const t = Date.now() - startRef.current
    
    // Scoring logic
    // Base 100
    // Time penalty
    // Collision penalty
    let perf = 100 - (collisions * 15) - (t / 1000) * 2
    if (perf < 0) perf = 0
    if (perf > 100) perf = 100
    
    endGame({
      perfection: Math.round(perf),
      timeMs: t,
      score: Math.round(perf * 10),
      difficulty,
      extra: {
        collisions,
      },
    })
  }

  const handleReset = () => {
    setStarted(false)
    setFinished(false)
    setCollisions(0)
    setTimeMs(0)
    setErrorFlash(false)
    clearInterval(intervalRef.current)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
        <DifficultySelector value={difficulty} onChange={(d) => { setDifficulty(d); handleReset(); }} disabled={started && !finished} />
        <span className="metric">Tiempo: {(timeMs / 1000).toFixed(2)} s</span>
        {collisions > 0 && <span className="metric" style={{ color: 'var(--danger)' }}>Colisiones: {collisions}</span>}
      </div>
      
      <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', textAlign: 'center' }}>
        Guía el cursor desde el punto VERDE hasta el punto AZUL sin tocar las paredes.
      </p>

      <ErrorFlash trigger={errorFlash} onClear={() => setErrorFlash(false)} message="¡Cuidado con los bordes!" className="canvas-wrap" style={{ width: '100%', maxWidth: W, height: H }}>
          <div 
          ref={containerRef}
          style={{ 
              width: W, 
              height: H, 
              position: 'relative', 
              background: '#16242e', 
              borderRadius: '8px',
              cursor: 'none', // Hide default cursor
              overflow: 'hidden'
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setCursorPos(null)}
        >
          {/* Walls */}
          {MAZE.walls.map((w, i) => (
              <div key={i} style={{
                  position: 'absolute',
                  left: w.x,
                  top: w.y,
                  width: w.w,
                  height: w.h,
                  background: '#334155', // Slate 700
                  borderRadius: '4px',
                  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
              }} />
          ))}

          {/* Start Point */}
          <div style={{
              position: 'absolute',
              left: MAZE.start.x - 20,
              top: MAZE.start.y - 20,
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.2)', // Success transparent
              border: '2px solid var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--success)',
              fontWeight: 'bold',
              fontSize: '0.8rem'
          }}>
              INICIO
          </div>

          {/* End Point */}
          <div style={{
              position: 'absolute',
              left: MAZE.end.x - 25,
              top: MAZE.end.y - 25,
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: 'rgba(56, 189, 248, 0.2)', // Sky blue transparent
              border: '2px solid #38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
              fontWeight: 'bold',
              fontSize: '0.8rem'
          }}>
              FIN
          </div>

          {/* Custom Cursor */}
          {cursorPos && (
              <div style={{
                  position: 'absolute',
                  left: cursorPos.x - 6,
                  top: cursorPos.y - 6,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: errorFlash ? 'var(--danger)' : '#F7C9D4', // Azalea normally
                  boxShadow: '0 0 8px rgba(247, 201, 212, 0.8)',
                  pointerEvents: 'none',
                  zIndex: 10
              }} />
          )}

        </div>
      </ErrorFlash>
      
      {(finished) && (
          <button onClick={handleReset} className="btn-primary" style={{ marginTop: '1rem' }}>
              Jugar de nuevo
          </button>
      )}
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