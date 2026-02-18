import { useState, useEffect } from 'react'
import { getAllResults } from '../store'
import { GameResult } from '../types'
import TelemetryHeatmap from '../components/TelemetryHeatmap'
import { Download, Activity, FileText } from 'lucide-react'

export default function Results() {
  const [results, setResults] = useState<GameResult[]>([])
  const [selectedResult, setSelectedResult] = useState<GameResult | null>(null)

  useEffect(() => {
    const list = getAllResults()
    // Sort by date desc
    list.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    setResults(list)
    if (list.length > 0) setSelectedResult(list[0])
  }, [])

  const averagePerfection = results.length > 0 
    ? Math.round(results.reduce((acc, r) => acc + r.perfection, 0) / results.length) 
    : 0

  const handleExport = () => {
    const csv = [
      'Fecha,Juego,Perfección,Tiempo(ms),PuntosTelemetria',
      ...results.map(r => `${r.at},${r.gameId},${r.perfection},${r.timeMs},${r.telemetry?.length || 0}`)
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rssp-results-${new Date().toISOString()}.csv`
    a.click()
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
           <h1 style={{ margin: 0, fontSize: '2rem' }}>Registros de Análisis de Datos</h1>
           <p style={{ margin: '0.5rem 0 0', color: 'var(--text-muted)' }}>Historial de sesiones y análisis de telemetría</p>
        </div>
        <button 
          onClick={handleExport}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--accent)', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
        >
          <Download size={18} /> Exportar CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Precisión Promedio Global</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text)' }}>{averagePerfection}%</div>
        </div>
        <div className="card">
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Sesiones Completadas</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text)' }}>{results.length}</div>
        </div>
        <div className="card">
           <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Última Actividad</h3>
           <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)' }}>
             {results.length > 0 ? new Date(results[0].at).toLocaleDateString() : '-'}
           </div>
        </div>
      </div>

      {/* Main Analysis Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', marginBottom: '2rem' }}>
         {/* Left: Heatmap */}
         <div className="card" style={{ background: '#0f172a', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
               <div>
                  <h3 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Activity size={20} className="text-accent" /> 
                    Análisis de Telemetría
                  </h3>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                    {selectedResult 
                      ? `Mapa de calor de movimiento - ${selectedResult.gameId} (${new Date(selectedResult.at).toLocaleTimeString()})`
                      : 'Seleccione una sesión para ver el mapa de calor'}
                  </p>
               </div>
               {selectedResult && (
                 <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: selectedResult.perfection >= 80 ? '#22c55e' : '#f59e0b' }}>
                      {selectedResult.perfection}%
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Precisión</div>
                 </div>
               )}
            </div>
            
            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '1rem', display: 'flex', justifyContent: 'center' }}>
               {selectedResult ? (
                 <TelemetryHeatmap 
                    data={selectedResult.telemetry || []} 
                    width={600} 
                    height={400} 
                  />
               ) : (
                 <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                    Seleccione un registro de la tabla
                 </div>
               )}
            </div>
            
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#94a3b8', justifyContent: 'center' }}>
               <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                 <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }}></span> Inicio
               </span>
               <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                 <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }}></span> Fin
               </span>
               <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                 <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(249, 115, 22, 1)' }}></span> Alta Densidad
               </span>
            </div>
         </div>

         {/* Right: Details */}
         <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card">
               <h3 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>Detalles de Sesión</h3>
               {selectedResult ? (
                 <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Juego:</span>
                      <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{selectedResult.gameId.replace('-', ' ')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Duración:</span>
                      <span style={{ fontWeight: 600 }}>{(selectedResult.timeMs / 1000).toFixed(1)}s</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Dificultad:</span>
                      <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{selectedResult.difficulty || 'Normal'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Puntos Telemetría:</span>
                      <span style={{ fontWeight: 600 }}>{selectedResult.telemetry?.length || 0}</span>
                    </div>
                 </div>
               ) : (
                 <p style={{ color: 'var(--text-muted)' }}>No hay sesión seleccionada</p>
               )}
            </div>
            
            <div className="card" style={{ flex: 1 }}>
               <h3 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>Retroalimentación IA</h3>
               <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                 {selectedResult 
                   ? selectedResult.perfection < 80 
                     ? "Se detectaron movimientos irregulares. Se recomienda mejorar la estabilidad en el eje vertical y reducir la velocidad en tramos curvos."
                     : "Excelente control motor. La velocidad fue consistente y la precisión se mantuvo dentro de los parámetros óptimos."
                   : "Seleccione una sesión para ver el análisis."
                 }
               </p>
            </div>
         </div>
      </div>

      {/* Logs Table */}
      <div className="card">
        <h3 style={{ margin: '0 0 1rem' }}>Historial Completo</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Fecha</th>
                <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Juego</th>
                <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Tiempo</th>
                <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Precisión</th>
                <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}></th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr 
                  key={i} 
                  style={{ 
                    borderBottom: '1px solid var(--border)', 
                    cursor: 'pointer',
                    background: selectedResult === r ? 'var(--bg-sidebar)' : 'transparent'
                  }}
                  onClick={() => setSelectedResult(r)}
                >
                  <td style={{ padding: '0.75rem' }}>{new Date(r.at).toLocaleString()}</td>
                  <td style={{ padding: '0.75rem', textTransform: 'capitalize' }}>{r.gameId.replace('-', ' ')}</td>
                  <td style={{ padding: '0.75rem' }}>{(r.timeMs / 1000).toFixed(1)}s</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ 
                      color: r.perfection >= 90 ? 'var(--success)' : r.perfection >= 70 ? 'var(--warning)' : 'var(--danger)',
                      fontWeight: 600
                    }}>
                      {r.perfection}%
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    <button style={{ background: 'transparent', color: 'var(--accent)', border: 'none', cursor: 'pointer' }}>
                      <FileText size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {results.length === 0 && (
                 <tr>
                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                       No hay registros disponibles. ¡Juega una simulación para comenzar!
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
