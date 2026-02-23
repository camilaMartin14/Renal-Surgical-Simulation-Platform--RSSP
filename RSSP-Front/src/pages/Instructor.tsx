import { useEffect, useMemo, useState } from 'react'
import { getAllResults } from '../domain/resultsStore'
import type { GameResult } from '../types'
import { Activity } from 'lucide-react'
import TelemetryHeatmap from '../components/TelemetryHeatmap'

export default function Instructor() {
  const [latest, setLatest] = useState<GameResult | null>(null)
  const [refreshMs, setRefreshMs] = useState(5000)

  useEffect(() => {
    const tick = async () => {
      // Load from local results
      const list = getAllResults().slice().sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      setLatest(list[0] ?? null)
    }
    
    tick()
    const id = window.setInterval(tick, refreshMs)
    return () => window.clearInterval(id)
  }, [refreshMs])

  const summary = useMemo(() => {
    if (!latest) return null
    return {
      when: new Date(latest.at).toLocaleString(),
      game: latest.gameId.replace('-', ' '),
      perfection: latest.perfection,
      timeSec: (latest.timeMs / 1000).toFixed(1),
      errors: latest.extra?.errors ?? 0,
      difficulty: latest.difficulty ?? 'medium',
      telemetryPoints: latest.telemetry?.length ?? 0,
    }
  }, [latest])

  return (
    <div className="results-shell">
      <div className="card" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={20} style={{ color: 'var(--accent)' }} />
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Panel Docente</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Actualización</span>
          <select
            value={refreshMs}
            onChange={(e) => setRefreshMs(Number(e.target.value))}
            style={{ padding: '0.35rem 0.75rem', borderRadius: '999px', border: '1px solid var(--border)', fontSize: '0.85rem' }}
          >
            <option value={2000}>2s</option>
            <option value={5000}>5s</option>
            <option value={10000}>10s</option>
          </select>
        </div>
      </div>

      <div className="results-analysis-grid">
        <div className="card" style={{ background: 'var(--sim-bg-dark)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ margin: 0, color: 'var(--text-on-dark)' }}>Telemetría (última sesión)</h3>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-on-dark)', opacity: 0.7 }}>
                {summary ? `${summary.game} — ${summary.when}` : 'Aún no hay sesiones'}
              </p>
            </div>
            {summary && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: summary.perfection >= 80 ? '#22c55e' : '#f59e0b' }}>
                  {summary.perfection}%
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Precisión</div>
              </div>
            )}
          </div>
          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '1rem', display: 'flex', justifyContent: 'center' }}>
            {latest ? (
              <TelemetryHeatmap data={latest.telemetry || []} width={600} height={400} />
            ) : (
              <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                Aún no hay datos
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>Resumen</h3>
          {summary ? (
            <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Juego</span>
                <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{summary.game}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Duración</span>
                <span style={{ fontWeight: 600 }}>{summary.timeSec}s</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Dificultad</span>
                <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{summary.difficulty}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Errores</span>
                <span style={{ fontWeight: 600 }}>{summary.errors}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Puntos telemetría</span>
                <span style={{ fontWeight: 600 }}>{summary.telemetryPoints}</span>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No hay sesión disponible todavía.</p>
          )}
        </div>
      </div>
    </div>
  )
}
