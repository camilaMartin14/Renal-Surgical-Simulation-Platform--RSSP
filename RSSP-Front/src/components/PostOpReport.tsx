import { useMemo, useState } from 'react'
import { SurgicalReport } from '../types'
import { CheckCircle, AlertTriangle, Activity, Share2, Download } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { updateResult } from '../domain/resultsStore'

interface PostOpReportProps {
  report: SurgicalReport
  onClose: () => void
}

export default function PostOpReport({ report, onClose }: PostOpReportProps) {
  const navigate = useNavigate()
  const [signed, setSigned] = useState(false)
  const [note, setNote] = useState('')

  const qualitative = useMemo(() => {
    const timeSec = report.duration / 1000
    const score = report.score

    let summary: string
    let nextStep: string

    if (score >= 90) {
      summary = 'Excelente precisión y control del instrumento.'
    } else if (score >= 75) {
      summary = 'Buena base técnica, con margen para afinar precisión y consistencia.'
    } else {
      summary = 'La precisión estuvo por debajo del objetivo. Es importante reducir errores críticos.'
    }

    if (timeSec > 90 && score >= 75) {
      summary += ' El tiempo fue algo elevado; puedes priorizar la fluidez sin perder precisión.'
    } else if (timeSec < 60 && score < 75) {
      summary += ' El tiempo fue bueno, pero la precisión sugiere que se sacrificó control por velocidad.'
    }

    let performanceMessage: string
    if (score >= 95) performanceMessage = 'Ejecución Maestra'
    else if (score >= 85) performanceMessage = 'Excelente Desempeño'
    else if (score >= 70) performanceMessage = 'Buen Desempeño'
    else performanceMessage = 'Requiere Práctica'

    switch (report.gameId) {
      case 'line-precision':
        nextStep =
          score >= 80
            ? 'Prueba aumentar la dificultad o pasar al escenario Steady Hand en modo básico.'
            : 'Repite Line Precision enfocándote en seguir la ruta sin atajos bruscos.'
        break
      case 'steady-hand':
        nextStep =
          score >= 80
            ? 'Incrementa la dificultad o combina este ejercicio con Tumor Ablation en modo fácil.'
            : 'Repite el ejercicio manteniendo el cursor dentro de la zona incluso a costa de ir más lento.'
        break
      case 'reflex':
        nextStep =
          score >= 80
            ? 'Pasa al modo difícil (blink) y busca mantener tiempos de reacción bajos.'
            : 'Repite Reflex priorizando hacer clic solo cuando estés seguro, aunque tomes más tiempo.'
        break
      case 'suture':
        nextStep =
          score >= 80
            ? 'Prueba el escenario de Sutura con mayor complejidad o en combinación con Line Precision.'
            : 'Practica la secuencia correcta de puntos, intentando reducir el número de errores por orden.'
        break
      case 'tumor-ablation':
        nextStep =
          score >= 80
            ? 'Incrementa la velocidad del procedimiento manteniendo intactas las estructuras sanas.'
            : 'Repite el escenario priorizando evitar contacto con el riñón, aunque tardes más en ablar cada tumor.'
        break
      default:
        nextStep = 'Repite el escenario en la misma dificultad antes de progresar al siguiente nivel.'
    }

    return { summary, nextStep, performanceMessage }
  }, [report])

  const handleSign = () => {
    setSigned(true)
    updateResult(report.at, {
      note: note.trim() || undefined,
      feedbackSummary: qualitative.summary,
      recommendedNextStep: qualitative.nextStep,
    })
    setTimeout(() => {
      onClose()
      navigate('/results')
    }, 1500)
  }

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '2rem auto', 
      background: 'var(--bg-card)', 
      borderRadius: '16px', 
      padding: '2rem',
      border: '1px solid var(--border)',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '2px solid var(--border)', paddingBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)', margin: 0 }}>INFORME QUIRÚRGICO</h2>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>PROTOCOLO POST-OPERATORIO INMEDIATO</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--navy)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Resumen del Procedimiento</h3>
          <div style={{ display: 'grid', gap: '1rem', fontSize: '0.95rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Paciente:</span>
              <span style={{ fontWeight: 600 }}>{report.patient.name} ({report.patient.age}a)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Tiempo Quirúrgico:</span>
              <span style={{ fontWeight: 600 }}>{(report.duration / 1000).toFixed(1)} segundos</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Complicaciones:</span>
              <span style={{ fontWeight: 600, color: report.complications.length ? 'var(--danger)' : 'var(--success)' }}>
                {report.complications.length > 0 ? report.complications.join(', ') : 'Ninguna'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Puntaje de Precisión:</span>
              <span style={{ fontWeight: 700, fontSize: '1.1rem', color: report.score >= 80 ? 'var(--success)' : 'var(--warning)' }}>
                {report.score.toFixed(1)}%
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Desempeño General:</span>
              <span style={{ fontWeight: 600, color: 'var(--navy)' }}>
                {qualitative.performanceMessage}
              </span>
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-sidebar)', padding: '1rem', borderRadius: '8px', color: 'white' }}>
           <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <Activity size={18} /> Telemetría
           </h3>
           <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
             <p>Se ha registrado el patrón de movimiento.</p>
             <p>Puntos de dato: {report.telemetry.length}</p>
             <p style={{ marginTop: '1rem', fontStyle: 'italic', opacity: 0.7 }}>Disponible para análisis detallado en la sección Resultados.</p>
           </div>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--navy)', marginBottom: '0.5rem' }}>Autoevaluación del operador</h3>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="¿Qué crees que podrías mejorar para la próxima vez?"
          rows={5}
          style={{
            width: '100%',
            resize: 'vertical',
            padding: '0.75rem',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            fontSize: '0.9rem',
            fontFamily: 'inherit',
            background: 'var(--bg-elevated)',
            color: 'var(--text)',
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Firma Digital: <span style={{ fontFamily: 'monospace', background: 'var(--bg-sidebar)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>{signed ? `SIGNED_${Date.now().toString(36).toUpperCase()}` : 'PENDIENTE'}</span>
        </div>
        
        <button
          onClick={handleSign}
          disabled={signed}
          style={{
            padding: '0.75rem 2rem',
            background: signed ? 'var(--success)' : 'var(--accent)',
            color: signed ? 'white' : 'var(--navy)',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: signed ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s'
          }}
        >
          {signed ? (
            <>
              <CheckCircle size={20} />
              Validado
            </>
          ) : (
            <>
              Validar Informe
            </>
          )}
        </button>
      </div>
    </div>
  )
}
