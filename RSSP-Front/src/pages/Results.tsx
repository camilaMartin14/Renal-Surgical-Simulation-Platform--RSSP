import { useEffect, useMemo, useState } from 'react'
import { getAllResults } from '../domain/resultsStore'
import { GameResult, GameId, Difficulty } from '../types'
import TelemetryHeatmap from '../components/TelemetryHeatmap'
import { Download, Activity, FileText, X, Filter, ChevronDown, ChevronUp, Search } from 'lucide-react'
import { GAMES } from '../games'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function Results() {
  const [results, setResults] = useState<GameResult[]>([])
  const [selectedResult, setSelectedResult] = useState<GameResult | null>(null)
  const [gameFilter, setGameFilter] = useState<'all' | GameId>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | Difficulty>('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'perfection'>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    // Load local results
    const localList = getAllResults()
    localList.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    setResults(localList)
  }, [])

  const filteredResults = useMemo(() => {
    const list = results.filter((r) => {
      if (gameFilter !== 'all' && r.gameId !== gameFilter) {
        return false
      }
      if (difficultyFilter !== 'all' && r.difficulty !== difficultyFilter) {
        return false
      }
      if (fromDate) {
        const d = new Date(fromDate)
        if (new Date(r.at) < d) return false
      }
      if (toDate) {
        const d = new Date(toDate)
        const end = new Date(d.getTime())
        end.setDate(end.getDate() + 1)
        if (new Date(r.at) >= end) return false
      }
      if (search.trim().length > 0) {
        const term = search.toLowerCase()
        const note = (r.note ?? '').toLowerCase()
        const email = (r.userEmail ?? '').toLowerCase()
        const diff = (r.difficulty ?? '').toLowerCase()
        const game = r.gameId.toLowerCase()
        const perfection = r.perfection.toString()
        if (![note, email, diff, game, perfection].some((s) => s.includes(term))) {
          return false
        }
      }
      return true
    })
    const sorted = list.slice().sort((a, b) => {
      if (sortBy === 'date') {
        const da = new Date(a.at).getTime()
        const db = new Date(b.at).getTime()
        return sortDir === 'asc' ? da - db : db - da
      } else {
        return sortDir === 'asc' ? a.perfection - b.perfection : b.perfection - a.perfection
      }
    })
    return sorted
  }, [results, gameFilter, difficultyFilter, fromDate, toDate, search, sortBy, sortDir])

  useEffect(() => {
    if (!selectedResult) return
    if (!filteredResults.includes(selectedResult)) {
      setSelectedResult(null)
    }
  }, [filteredResults, selectedResult])

  const averagePerfection = filteredResults.length > 0
    ? Math.round(filteredResults.reduce((acc, r) => acc + r.perfection, 0) / filteredResults.length)
    : 0

  const chartData = useMemo(
    () =>
      filteredResults
        .slice()
        .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
        .map((r) => ({
          at: r.at,
          dateLabel: new Date(r.at).toLocaleDateString(),
          perfection: r.perfection,
          game: r.gameId,
        })),
    [filteredResults]
  )

  const handleExport = () => {
    const csv = [
      'Fecha,Juego,Dificultad,Usuario,Perfección,Tiempo(ms),Errores,Nota,PuntosTelemetria',
      ...filteredResults.map(r => [
        r.at,
        r.gameId,
        r.difficulty ?? '',
        r.userEmail ?? '',
        r.perfection,
        r.timeMs,
        r.extra?.errors ?? '',
        (r.note ?? '').replace(/\r?\n/g, ' '),
        r.telemetry?.length || 0,
      ].join(',')),
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rssp-results-${new Date().toISOString()}.csv`
    a.click()
  }

  const handleExportPdf = () => {
    const doc = new jsPDF()

    // --- Header ---
    // Logo: Circle with Cross
    // Center: (20, 15), Radius: 6
    doc.setFillColor('#D6F1FF')
    doc.circle(20, 15, 6, 'F')
    
    doc.setDrawColor('#FF69B4')
    doc.setLineWidth(1.5)
    // Vertical line
    doc.line(20, 11, 20, 19)
    // Horizontal line
    doc.line(16, 15, 24, 15)

    // App Name
    doc.setFontSize(16)
    doc.setTextColor('#2F4858') // Navy
    doc.setFont('helvetica', 'bold')
    doc.text('RSSP', 30, 16)
    
    doc.setFontSize(10)
    doc.setTextColor('#8b9ca8') // Text Muted
    doc.setFont('helvetica', 'normal')
    doc.text('Plataforma de Simulación Quirúrgica', 30, 21)

    // Title
    doc.setFontSize(18)
    doc.setTextColor('#2F4858')
    doc.setFont('helvetica', 'bold')
    doc.text('Reporte de Sesiones', 14, 35)

    // --- Summary Section ---
    doc.setFillColor('#F5EFEB') // Beige bg
    doc.roundedRect(14, 40, 182, 25, 3, 3, 'F')

    doc.setFontSize(10)
    doc.setTextColor('#56697a')
    
    // Average Perfection
    doc.text('Precisión Promedio', 20, 48)
    doc.setFontSize(14)
    doc.setTextColor('#2F4858')
    doc.setFont('helvetica', 'bold')
    doc.text(`${averagePerfection}%`, 20, 58)

    // Sessions Count
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor('#56697a')
    doc.text('Sesiones', 80, 48)
    doc.setFontSize(14)
    doc.setTextColor('#2F4858')
    doc.setFont('helvetica', 'bold')
    doc.text(`${filteredResults.length}`, 80, 58)

    // Date Range (if filtered) or Last Activity
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor('#56697a')
    doc.text('Rango de Fechas', 140, 48)
    doc.setFontSize(12)
    doc.setTextColor('#2F4858')
    doc.setFont('helvetica', 'bold')
    
    let dateRangeText = 'Todo el historial'
    if (fromDate || toDate) {
        dateRangeText = `${fromDate || 'Inicio'} - ${toDate || 'Hoy'}`
    }
    doc.text(dateRangeText, 140, 58)

    // --- Filters Info ---
    let yPos = 75
    doc.setFontSize(9)
    doc.setTextColor('#56697a')
    doc.setFont('helvetica', 'normal')
    
    const filters = []
    if (gameFilter !== 'all') filters.push(`Escenario: ${GAMES.find(g => g.id === gameFilter)?.title || gameFilter}`)
    if (difficultyFilter !== 'all') filters.push(`Dificultad: ${difficultyFilter}`)
    if (search) filters.push(`Búsqueda: "${search}"`)
    
    if (filters.length > 0) {
        doc.text(`Filtros aplicados: ${filters.join(' | ')}`, 14, yPos)
        yPos += 10
    }

    // --- Table ---
    autoTable(doc, {
      startY: yPos,
      head: [['Fecha', 'Juego', 'Dificultad', 'Precisión', 'Tiempo (s)', 'Errores']],
      body: filteredResults.map(r => [
        new Date(r.at).toLocaleDateString() + ' ' + new Date(r.at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        GAMES.find(g => g.id === r.gameId)?.title || r.gameId,
        r.difficulty || '-',
        `${r.perfection}%`,
        (r.timeMs / 1000).toFixed(1),
        r.extra?.errors || '-'
      ]),
      styles: {
        font: 'helvetica',
        fontSize: 9,
        textColor: '#2F4858',
      },
      headStyles: {
        fillColor: '#2F4858', // Navy
        textColor: '#ffffff',
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: '#F5EFEB', // Beige
      },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 25 },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 25, halign: 'right' },
        5: { cellWidth: 20, halign: 'center' },
      }
    })

    // Footer
    const pageCount = doc.getNumberOfPages()
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor('#8b9ca8')
        doc.text(`Generado el ${new Date().toLocaleDateString()}`, 14, doc.internal.pageSize.height - 10)
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10)
    }

    doc.save(`rssp-reporte-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const resetFilters = () => {
    setGameFilter('all')
    setDifficultyFilter('all')
    setFromDate('')
    setToDate('')
    setSearch('')
    setSortBy('date')
    setSortDir('desc')
    setSelectedResult(null)
  }

  return (
    <div className="results-shell">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
           <h1 style={{ margin: 0, fontSize: '2rem' }}>Resultados y Sesiones</h1>
           <p style={{ margin: '0.5rem 0 0', color: 'var(--text-muted)' }}>Explora tus sesiones, filtra y exporta datos.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={handleExport}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', color: 'var(--accent)', padding: '0.5rem 1rem', borderRadius: '999px', border: '1px solid var(--accent)', cursor: 'pointer' }}
          >
            <Download size={18} /> CSV
          </button>
          <button 
            onClick={handleExportPdf}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--accent)', color: 'white', padding: '0.5rem 1rem', borderRadius: '999px', border: 'none', cursor: 'pointer' }}
          >
            <FileText size={18} /> PDF
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1rem', marginBottom: '1.5rem', transition: 'all 0.3s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
              <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Buscar por dificultad, juego o precisión..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ 
                  padding: '0.5rem 0.75rem 0.5rem 2.25rem', 
                  borderRadius: '999px', 
                  border: '1px solid var(--border)', 
                  fontSize: '0.9rem',
                  width: '100%',
                  background: 'var(--bg-elevated)'
                }}
              />
            </div>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                background: showFilters ? 'var(--bg-soft)' : 'transparent', 
                border: '1px solid var(--border)', 
                padding: '0.5rem 1rem', 
                borderRadius: '999px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                color: 'var(--text)'
              }}
            >
              <Filter size={16} />
              Filtros
              {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            
            {(gameFilter !== 'all' || difficultyFilter !== 'all' || fromDate || toDate) && (
              <button
                onClick={resetFilters}
                className="secondary"
                style={{ padding: '0.35rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer' }}
              >
                Limpiar todo
              </button>
            )}
          </div>
        </div>

        {showFilters && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Escenario</label>
              <select
                value={gameFilter}
                onChange={(e) => setGameFilter(e.target.value as 'all' | GameId)}
                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.9rem', width: '100%' }}
              >
                <option value="all">Todos los escenarios</option>
                {GAMES.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dificultad</label>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value as 'all' | Difficulty)}
                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.9rem', width: '100%' }}
              >
                <option value="all">Cualquier dificultad</option>
                <option value="easy">Fácil</option>
                <option value="medium">Media</option>
                <option value="hard">Difícil</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fecha</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem', flex: 1 }}
                />
                <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>-</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem', flex: 1 }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ordenar por</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'perfection')}
                  style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.9rem', flex: 1 }}
                >
                  <option value="date">Fecha</option>
                  <option value="perfection">Precisión</option>
                </select>
                <select
                  value={sortDir}
                  onChange={(e) => setSortDir(e.target.value as 'asc' | 'desc')}
                  style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.9rem', width: 80 }}
                >
                  <option value="desc">Desc</option>
                  <option value="asc">Asc</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="results-summary-grid">
        <div className="card">
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Precisión Promedio Global</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text)' }}>{averagePerfection}%</div>
        </div>
        <div className="card">
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Sesiones Completadas</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text)' }}>{filteredResults.length}</div>
        </div>
        <div className="card">
           <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Última Actividad</h3>
           <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)' }}>
             {filteredResults.length > 0 ? new Date(filteredResults[0].at).toLocaleDateString() : '-'}
           </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1rem', marginBottom: '2rem' }}>
        <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Evolución de precisión en el tiempo</h3>
        <div style={{ height: 240 }}>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="dateLabel" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value: any) => [`${value}%`, 'Precisión']}
                  labelFormatter={(label) => `Fecha: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="perfection"
                  stroke="var(--navy)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No hay datos suficientes para mostrar la evolución.
            </div>
          )}
        </div>
      </div>


      <div className="card">
        <h3 style={{ margin: '0 0 1rem' }}>Historial Completo</h3>
        <div className="results-table-wrapper">
          <table className="results-table">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Fecha</th>
                <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Juego</th>
                <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Dificultad</th>
                <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Tiempo</th>
                <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Precisión</th>
                <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((r, i) => (
                <tr 
                  key={i} 
                  style={{ 
                    borderBottom: '1px solid var(--border)', 
                    cursor: 'pointer',
                    background: selectedResult === r ? 'var(--bg-soft)' : 'transparent'
                  }}
                  onClick={() => setSelectedResult(r)}
                >
                  <td style={{ padding: '0.75rem' }}>{new Date(r.at).toLocaleString()}</td>
                  <td style={{ padding: '0.75rem', textTransform: 'capitalize' }}>{r.gameId.replace('-', ' ')}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ 
                      borderRadius: '999px',
                      padding: '0.2rem 0.5rem',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-soft)',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      textTransform: 'capitalize'
                    }}>
                      {r.difficulty || 'normal'}
                    </span>
                  </td>
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
              {filteredResults.length === 0 && (
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

      <div className={`drawer-backdrop ${selectedResult ? 'is-open' : ''}`} onClick={() => setSelectedResult(null)}>
        <div className="drawer-panel" onClick={e => e.stopPropagation()}>
          <div className="drawer-header">
            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Detalle de Sesión</h3>
            <button onClick={() => setSelectedResult(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', margin: '-0.5rem' }}>
              <X size={24} color="var(--text-muted)" />
            </button>
          </div>
          <div className="drawer-content">
            {selectedResult && (
              <>
                <div className="card" style={{ background: 'var(--sim-bg-dark)', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ margin: 0, color: 'var(--text-on-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                      <Activity size={18} className="text-accent" /> 
                      Telemetría
                    </h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-on-dark)', opacity: 0.7 }}>
                      {new Date(selectedResult.at).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                     <TelemetryHeatmap 
                       data={selectedResult.telemetry || []} 
                       width={500} 
                       height={300} 
                     />
                  </div>
                  
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-on-dark)', opacity: 0.7, justifyContent: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }}></span> Inicio
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }}></span> Fin
                    </span>
                  </div>
                </div>

                <div className="card" style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>Métricas</h4>
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Precisión</span>
                      <span style={{ fontWeight: 700, color: selectedResult.perfection >= 80 ? 'var(--success)' : 'var(--warning)' }}>{selectedResult.perfection}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Tiempo Total</span>
                      <span style={{ fontWeight: 600 }}>{(selectedResult.timeMs / 1000).toFixed(1)}s</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Errores</span>
                      <span style={{ fontWeight: 600 }}>{selectedResult.extra?.errors ?? 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Dificultad</span>
                      <span style={{ textTransform: 'capitalize' }}>{selectedResult.difficulty || 'Normal'}</span>
                    </div>
                    {selectedResult.note && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem' }}>Nota:</span>
                        <div style={{ background: 'var(--bg-soft)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.9rem' }}>
                          {selectedResult.note}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card" style={{ background: 'linear-gradient(to bottom right, var(--bg-card), var(--bg-soft))' }}>
                  <h4 style={{ margin: '0 0 0.75rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, background: 'var(--accent)', borderRadius: '4px', color: 'white', fontSize: '0.75rem', fontWeight: 700 }}>IA</span>
                    Análisis Automático
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-subtle)', lineHeight: 1.6, margin: 0 }}>
                    {selectedResult.feedbackSummary
                      ? selectedResult.feedbackSummary
                      : selectedResult.perfection < 80
                        ? 'Se detectaron movimientos irregulares. Se recomienda mejorar la estabilidad en el eje vertical.'
                        : 'Excelente control motor. La velocidad fue consistente.'
                    }
                  </p>
                  {selectedResult.recommendedNextStep && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
                      <strong style={{ color: 'var(--text)' }}>Siguiente paso:</strong> {selectedResult.recommendedNextStep}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
