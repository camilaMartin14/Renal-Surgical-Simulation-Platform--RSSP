import { useState, useEffect } from 'react'
import { PatientProfile, Instrument } from '../types'
import { INSTRUMENTS } from '../data/instruments'
import { User, Activity, FileText, CheckCircle, AlertCircle } from 'lucide-react'

interface PreOpBriefingProps {
  onComplete: (selectedInstruments: Instrument[], patient: PatientProfile) => void
  gameTitle: string
}

const CONDITIONS = [
  'Carcinoma de Células Renales (T1a)',
  'Estenosis de Arteria Renal',
  'Trauma Renal Grado III',
  'Litiasis Coraliforme Compleja',
  'Quiste Renal Bosniak III'
]

export default function PreOpBriefing({ onComplete, gameTitle }: PreOpBriefingProps) {
  const [patient, setPatient] = useState<PatientProfile | null>(null)
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    // Generate random patient
    setPatient({
      name: ['Carlos R.', 'Ana M.', 'Jorge L.', 'Sofia P.', 'Miguel A.'][Math.floor(Math.random() * 5)],
      age: 35 + Math.floor(Math.random() * 40),
      gender: Math.random() > 0.5 ? 'M' : 'F',
      condition: CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)],
      vitals: {
        bp: `${110 + Math.floor(Math.random() * 30)}/${70 + Math.floor(Math.random() * 20)}`,
        hr: 60 + Math.floor(Math.random() * 40),
        temp: 36.5 + Math.random()
      }
    })
  }, [])

  const toggleInstrument = (id: string) => {
    setSelectedInstruments(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
    setError('')
  }

  const handleStart = () => {
    if (selectedInstruments.length < 3) {
      setError('Selecciona al menos 3 instrumentos para proceder.')
      return
    }
    if (patient) {
      onComplete(INSTRUMENTS.filter(i => selectedInstruments.includes(i.id)), patient)
    }
  }

  if (!patient) return <div>Cargando expediente...</div>

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '2rem auto', 
      background: 'var(--bg-card)', 
      borderRadius: '16px', 
      padding: '2rem',
      border: '1px solid var(--border)',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>Ficha Pre-Operatoria</h2>
        <p style={{ color: 'var(--text-muted)' }}>{gameTitle}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Patient Card */}
        <div style={{ background: 'var(--bg-sidebar)', padding: '1.5rem', borderRadius: '12px', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <User size={24} className="text-blue-400" />
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Datos del Paciente</h3>
          </div>
          <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.95rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ opacity: 0.7 }}>Nombre:</span>
              <span style={{ fontWeight: 600 }}>{patient.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ opacity: 0.7 }}>Edad/Sexo:</span>
              <span style={{ fontWeight: 600 }}>{patient.age} años / {patient.gender}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ opacity: 0.7 }}>Diagnóstico:</span>
              <span style={{ fontWeight: 600, color: '#fca5a5' }}>{patient.condition}</span>
            </div>
          </div>
        </div>

        {/* Vitals Card */}
        <div style={{ background: 'var(--bg-sidebar)', padding: '1.5rem', borderRadius: '12px', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <Activity size={24} className="text-green-400" />
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Signos Vitales</h3>
          </div>
          <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.95rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ opacity: 0.7 }}>Presión Arterial:</span>
              <span style={{ fontWeight: 600 }}>{patient.vitals.bp} mmHg</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ opacity: 0.7 }}>Frecuencia Cardíaca:</span>
              <span style={{ fontWeight: 600 }}>{patient.vitals.hr} lpm</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ opacity: 0.7 }}>Temperatura:</span>
              <span style={{ fontWeight: 600 }}>{patient.vitals.temp.toFixed(1)} °C</span>
            </div>
          </div>
        </div>
      </div>

      {/* Instrument Selection */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <FileText size={20} color="var(--text)" />
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text)' }}>Preparación de Mesa Quirúrgica</h3>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Selecciona los instrumentos necesarios para el procedimiento (Mínimo 3):
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {INSTRUMENTS.map(inst => {
            const isSelected = selectedInstruments.includes(inst.id)
            return (
              <div 
                key={inst.id}
                onClick={() => toggleInstrument(inst.id)}
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                  background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-card)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '0.25rem' }}>{inst.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{inst.type}</div>
              </div>
            )
          })}
        </div>
      </div>

      {error && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          color: 'var(--danger)', 
          background: 'rgba(239, 68, 68, 0.1)', 
          padding: '0.75rem', 
          borderRadius: '8px',
          marginBottom: '1.5rem'
        }}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <button
        onClick={handleStart}
        style={{
          width: '100%',
          padding: '1rem',
          background: 'var(--accent)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 600,
          fontSize: '1rem',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        <CheckCircle size={20} />
        Confirmar e Iniciar Procedimiento
      </button>
    </div>
  )
}
