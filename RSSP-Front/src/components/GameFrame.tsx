import React, { useState, useRef, useEffect } from 'react'
import { GameId, PatientProfile, Instrument, TelemetryPoint, GameResult, Difficulty } from '../types'
import { INSTRUMENTS } from '../data/instruments'
import { addResult } from '../domain/resultsStore'
import PostOpReport from './PostOpReport'
import { GameSessionContext, EndGameMetrics } from '../context/GameSessionContext'

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
  const [phase, setPhase] = useState<'pre' | 'playing' | 'post'>('playing')
  const [patient, setPatient] = useState<PatientProfile | null>({
    name: 'Paciente Simulado',
    age: 45,
    gender: 'M',
    condition: 'Entrenamiento Estándar',
    vitals: {
      bp: '120/80',
      hr: 75,
      temp: 36.5
    }
  })
  const [selectedInstruments, setSelectedInstruments] = useState<Instrument[]>([
    INSTRUMENTS[0],
    INSTRUMENTS[2],
    INSTRUMENTS[4]
  ])
  const [telemetry, setTelemetry] = useState<TelemetryPoint[]>([])
  const [finalMetrics, setFinalMetrics] = useState<any>(null)
  const [lastResultAt, setLastResultAt] = useState<string | null>(null)
  
  // Refs for telemetry throttling
  const lastTelemetryTime = useRef(Date.now())
  const lastPos = useRef({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Handlers
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
    const at = new Date().toISOString()
    setLastResultAt(at)
    setPhase('post')
    const result: GameResult = {
      gameId,
      perfection: metrics.perfection,
      timeMs: metrics.timeMs,
      difficulty: metrics.difficulty,
      routeAdherence: metrics.routeAdherence,
      extra: metrics.extra,
      at,
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
          background: 'radial-gradient(circle at top, rgba(200, 217, 230, 0.12), transparent 55%), linear-gradient(135deg, var(--sim-bg-dark), var(--sim-bg))', 
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
          padding: '1rem 1.75rem', 
          borderBottom: '1px solid var(--sim-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--sim-bg)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h2 style={{ margin: 0, color: 'var(--text-on-dark)', fontSize: '1.25rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{title}</h2>
            {phase === 'playing' && (
              <span style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--success)', fontSize: '0.75rem', padding: '0.25rem 0.55rem', borderRadius: '999px', border: '1px solid rgba(34,197,94,0.5)' }}>
                EN PROGRESO
              </span>
            )}
            {phase === 'post' && (
              <span style={{ background: 'rgba(200, 217, 230, 0.15)', color: 'var(--sky-blue)', fontSize: '0.75rem', padding: '0.25rem 0.55rem', borderRadius: '999px', border: '1px solid var(--sky-blue)' }}>
                SIMULACIÓN FINALIZADA
              </span>
            )}
          </div>
          
          {phase === 'playing' && (
             <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ background: 'var(--sim-bg-dark)', border: '1px solid var(--sim-border)', padding: '0.45rem 0.9rem', borderRadius: '999px', color: 'var(--text-on-dark)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  Trauma Tisular: <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>{(100 - (finalMetrics?.perfection ?? 100)).toFixed(0)}</span>
                </div>
             </div>
          )}
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: backgroundImage ? `url(${backgroundImage}) center/cover no-repeat` : undefined }}>
          {backgroundImage && <div style={{ position: 'absolute', inset: 0, background: `rgba(22, 36, 46, ${overlayOpacity ?? 0.9})`, zIndex: 0 }} />}
          
          <div style={{ position: 'relative', zIndex: 1, height: '100%', width: '100%', overflow: 'auto' }}>
            
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
                  signedBy: 'Dr. User',
                  gameId,
                  at: lastResultAt ?? new Date().toISOString(),
                  difficulty: finalMetrics.difficulty
                }}
              />
            )}

          </div>
        </div>
      </div>
    </GameSessionContext.Provider>
  )
}
