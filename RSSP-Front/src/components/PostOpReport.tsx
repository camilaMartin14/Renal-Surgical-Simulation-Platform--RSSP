import { useState } from 'react'
import { SurgicalReport } from '../types'
import { CheckCircle, AlertTriangle, Activity, Share2, Download } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface PostOpReportProps {
  report: SurgicalReport
  onClose: () => void
}

export default function PostOpReport({ report, onClose }: PostOpReportProps) {
  const navigate = useNavigate()
  const [signed, setSigned] = useState(false)

  const handleSign = () => {
    setSigned(true)
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
          <h3 style={{ fontSize: '1.1rem', color: 'var(--accent)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Resumen del Procedimiento</h3>
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
        <h3 style={{ fontSize: '1.1rem', color: 'var(--accent)', marginBottom: '0.5rem' }}>Instrumental Utilizado</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {report.instrumentsUsed.map(i => (
            <span key={i.id} style={{ 
              background: 'var(--bg-sidebar)', 
              color: 'white', 
              padding: '0.25rem 0.75rem', 
              borderRadius: '12px',
              fontSize: '0.85rem'
            }}>
              {i.name}
            </span>
          ))}
        </div>
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
            color: 'white',
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
