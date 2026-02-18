import React, { createContext, useContext, useState, useRef, useEffect } from 'react'
import { GameId, PatientProfile, Instrument, TelemetryPoint, GameResult, Difficulty } from '../types'
import { addResult } from '../store'
import PreOpBriefing from './PreOpBriefing'
import PostOpReport from './PostOpReport'

// Context Definition
interface EndGameMetrics {
  perfection: number
  timeMs: number
  score?: number
  difficulty?: Difficulty
  routeAdherence?: number
  extra?: Record<string, number>
}

interface GameSessionContextType {
  startGame: () => void
  endGame: (metrics: EndGameMetrics) => void
  trackMovement: (x: number, y: number) => void
  phase: 'pre' | 'playing' | 'post'
}

const GameSessionContext = createContext<GameSessionContextType | null>(null)

export const useGameSession = () => {
  const ctx = useContext(GameSessionContext)
  if (!ctx) throw new Error('useGameSession must be used within a GameFrame')
  return ctx
}

// Props
interface GameFrameProps {
  title: string
  gameId: GameId
  children: React.ReactNode
  backgroundImage?: string
  overlayOpacity?: number
}

export default function GameFrame({ title, gameId, children, backgroundImage, overlayOpacity }: GameFrameProps) {
  // State
  const [phase, setPhase] = useState<'pre' | 'playing' | 'post'>('pre')
  const [patient, setPatient] = useState<PatientProfile | null>(null)
  const [selectedInstruments, setSelectedInstruments] = useState<Instrument[]>([])
  const [telemetry, setTelemetry] = useState<TelemetryPoint[]>([])
  const [finalMetrics, setFinalMetrics] = useState<any>(null)
  
  // Refs for telemetry throttling
  const lastTelemetryTime = useRef(0)
  const lastPos = useRef({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Handlers
  const handlePreOpComplete = (instruments: Instrument[], p: PatientProfile) => {
    setSelectedInstruments(instruments)
    setPatient(p)
    setPhase('playing')
    setTelemetry([]) // Reset telemetry
    lastTelemetryTime.current = Date.now()
    lastPos.current = { x: 0, y: 0 }
  }

  const trackMovement = (x: number, y: number) => {
    if (phase !== 'playing') return
    const now = Date.now()
    if (now - lastTelemetryTime.current > 50) { // 20Hz sample rate
      const dx = x - lastPos.current.x
      const dy = y - lastPos.current.y
      const dist = Math.sqrt(dx*dx + dy*dy)
      const velocity = dist / (now - lastTelemetryTime.current)
      
      let nx = 0, ny = 0
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        nx = (x - rect.left) / rect.width
        ny = (y - rect.top) / rect.height
        nx = Math.max(0, Math.min(1, nx))
        ny = Math.max(0, Math.min(1, ny))
      }

      setTelemetry(prev => [...prev, { x, y, nx, ny, timestamp: now, velocity }])
      
      lastTelemetryTime.current = now
      lastPos.current = { x, y }
    }
  }

  const endGame = (metrics: EndGameMetrics) => {
    setFinalMetrics(metrics)
    setPhase('post')
    
    const result: GameResult = {
      gameId,
      perfection: metrics.perfection,
      timeMs: metrics.timeMs,
      difficulty: metrics.difficulty,
      routeAdherence: metrics.routeAdherence,
      extra: metrics.extra,
      at: new Date().toISOString(),
      telemetry: telemetry
    }
    addResult(result)
  }

  // Mouse Listener for global telemetry fallback
  const handleMouseMove = (e: React.MouseEvent) => {
    trackMovement(e.clientX, e.clientY)
  }

  return (
    <GameSessionContext.Provider value={{ startGame: () => {}, endGame, trackMovement, phase }}>
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: 'calc(100vh - 100px)', 
          background: 'var(--sim-bg)', 
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid var(--sim-border)',
          '--text': 'var(--text-on-dark)',
          '--text-muted': 'var(--text-muted-on-dark)',
          '--bg-card': 'var(--sim-bg-dark)',
        } as React.CSSProperties}
      >
        {/* Header */}
        <div style={{ 
          padding: '1rem 1.5rem', 
          borderBottom: '1px solid var(--sim-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--sim-bg-dark)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h2 style={{ margin: 0, color: 'var(--text-on-dark)', fontSize: '1.25rem' }}>{title}</h2>
            {phase === 'playing' && (
              <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)', fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                EN PROGRESO
              </span>
            )}
          </div>
          
          {phase === 'playing' && (
             <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ background: 'var(--sim-bg)', border: '1px solid var(--sim-border)', padding: '0.5rem 1rem', borderRadius: '8px', color: 'var(--text-on-dark)', fontSize: '0.9rem' }}>
                  Trauma Tisular: <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>{(100 - (finalMetrics?.perfection ?? 100)).toFixed(0)}</span>
                </div>
             </div>
          )}
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: backgroundImage ? `url(${backgroundImage}) center/cover no-repeat` : undefined }}>
          {backgroundImage && <div style={{ position: 'absolute', inset: 0, background: `rgba(15, 23, 42, ${overlayOpacity ?? 0.9})`, zIndex: 0 }} />}
          
          <div style={{ position: 'relative', zIndex: 1, height: '100%', width: '100%', overflow: 'auto' }}>
            
            {phase === 'pre' && (
              <PreOpBriefing onComplete={handlePreOpComplete} gameTitle={title} />
            )}

            {/* Always mount children but hide them if not playing to preserve state if needed, 
                OR conditionally render. For canvas games, conditional render is usually better to reset state. 
                But if we want to preload... let's conditional render for "Clean Slate" on start. */}
            {phase === 'playing' && (
              <div style={{ height: '100%' }}>
                {children}
              </div>
            )}

            {phase === 'post' && patient && finalMetrics && (
              <PostOpReport 
                onClose={() => {}} // Navigate handled inside PostOpReport
                report={{
                  patient: patient,
                  instrumentsUsed: selectedInstruments,
                  duration: finalMetrics.timeMs,
                  complications: finalMetrics.perfection < 80 ? ['Daño Tisular Leve'] : [],
                  score: finalMetrics.perfection,
                  telemetry: telemetry,
                  signedBy: 'Dr. User'
                }}
              />
            )}

          </div>
        </div>
      </div>
    </GameSessionContext.Provider>
  )
}
