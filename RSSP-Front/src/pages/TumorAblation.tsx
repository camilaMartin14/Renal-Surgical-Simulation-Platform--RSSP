import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import GameFrame from '../components/GameFrame'
import { useGameSession } from '../context/GameSessionContext'
import DifficultySelector from '../components/DifficultySelector'
import ErrorFlash from '../components/ErrorFlash'
import type { Difficulty } from '../types'
import { Activity, AlertTriangle, FileText, User, Target, Play } from 'lucide-react'

// --- Tipos y Datos de Casos Clínicos ---

interface ClinicalCase {
  id: string
  patientName: string
  age: number
  gender: 'Masculino' | 'Femenino'
  diagnosis: string
  tumorSize: string
  location: string
  objective: string
  history: string
  comorbidities: string
}

const CLINICAL_CASES: ClinicalCase[] = [
  {
    id: 'case-001',
    patientName: 'Roberto Méndez',
    age: 54,
    gender: 'Masculino',
    diagnosis: 'Carcinoma de células renales (Estadio T1a)',
    tumorSize: '3.2 cm',
    location: 'Polo inferior del riñón derecho',
    objective: 'Ablación completa con margen de seguridad de 2mm. Evitar daño al sistema colector.',
    history: 'Paciente asintomático, hallazgo incidental en ecografía abdominal por chequeo rutinario.',
    comorbidities: 'Hipertensión arterial controlada, Ex-fumador.'
  },
  {
    id: 'case-002',
    patientName: 'Elena Torres',
    age: 62,
    gender: 'Femenino',
    diagnosis: 'Angiomiolipoma renal sintomático',
    tumorSize: '2.8 cm',
    location: 'Cara lateral, riñón izquierdo',
    objective: 'Ablación focal preservando parénquima sano. Riesgo moderado de sangrado.',
    history: 'Presenta dolor lumbar leve intermitente. TAC confirma lesión grasa sin calcificaciones.',
    comorbidities: 'Diabetes Mellitus Tipo 2, Obesidad grado I.'
  },
  {
    id: 'case-003',
    patientName: 'Carlos Ruiz',
    age: 47,
    gender: 'Masculino',
    diagnosis: 'Oncocitoma renal (sospecha)',
    tumorSize: '3.5 cm',
    location: 'Polo superior, riñón derecho',
    objective: 'Ablación térmica precisa. Monitorizar proximidad a glándula suprarrenal.',
    history: 'Hematuria microscópica detectada en análisis laboral. Biopsia no concluyente, se decide tratamiento.',
    comorbidities: 'Sin antecedentes patológicos relevantes.'
  },
  {
    id: 'case-004',
    patientName: 'Ana Garcés',
    age: 71,
    gender: 'Femenino',
    diagnosis: 'Carcinoma papilar renal',
    tumorSize: '2.5 cm',
    location: 'Mesorenal posterior',
    objective: 'Ablación exhaustiva. Acceso complejo, requiere rotación cuidadosa de cámara.',
    history: 'Paciente monorrena funcional (riñón contralateral atrófico). Prioridad absoluta: preservación de función renal.',
    comorbidities: 'Insuficiencia renal crónica estadio 3a.'
  },
  {
    id: 'case-005',
    patientName: 'Jorge Vega',
    age: 58,
    gender: 'Masculino',
    diagnosis: 'Masa renal sólida indeterminada',
    tumorSize: '1.9 cm',
    location: 'Polo inferior, exofítico',
    objective: 'Ablación rápida y limpia. Minimizar tiempo de isquemia si fuera necesaria.',
    history: 'Seguimiento por quistes renales simples (Bosniak I), aparición de nueva lesión sólida.',
    comorbidities: 'Hipercolesterolemia, Sedentarismo.'
  }
]

function getParams(d: Difficulty) {
  return d === 'easy' ? { count: 5, radius: 0.45 } : d === 'medium' ? { count: 8, radius: 0.4 } : { count: 12, radius: 0.32 }
}

const KIDNEY_CURVE = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, -2.2, 0),
  new THREE.Vector3(1.2, -1.0, 0),
  new THREE.Vector3(1.0, 1.0, 0),
  new THREE.Vector3(0, 2.2, 0),
  new THREE.Vector3(-0.5, 1.0, 0),
  new THREE.Vector3(-0.5, -1.0, 0)
], true)

function generateTumorPositionsOnKidney(count: number, tumorRadius: number): [number, number, number][] {
  const positions: [number, number, number][] = []
  const tubeRadius = 1.2

  for (let i = 0; i < count; i++) {
    const t = Math.random()
    const pointOnCurve = KIDNEY_CURVE.getPointAt(t)
    const tangent = KIDNEY_CURVE.getTangentAt(t)
    
    let up = new THREE.Vector3(0, 1, 0)
    if (Math.abs(tangent.y) > 0.9) up = new THREE.Vector3(1, 0, 0)
    
    const normal = new THREE.Vector3().crossVectors(tangent, up).normalize()
    const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize()
    
    const angle = Math.random() * Math.PI * 2
    
    const surfaceNormal = new THREE.Vector3()
      .addScaledVector(normal, Math.cos(angle))
      .addScaledVector(binormal, Math.sin(angle))
      .normalize()
      
    const pos = new THREE.Vector3().copy(pointOnCurve)
      .addScaledVector(surfaceNormal, tubeRadius + tumorRadius * 0.8)

    positions.push([pos.x, pos.y, pos.z])
  }
  return positions
}

type Mode = 'camera' | 'laser'

function Structure({ innerRef }: { innerRef: React.RefObject<THREE.Mesh | null> }) {
  const geometry = useMemo(() => new THREE.TubeGeometry(KIDNEY_CURVE, 64, 1.2, 32, true), [])
  
  return (
    <mesh
      ref={(el) => {
        (innerRef as React.MutableRefObject<THREE.Mesh | null>).current = el
        if (el) el.userData.isStructure = true
      }}
      geometry={geometry}
    >
      <meshStandardMaterial 
        color="#7f1d1d"
        roughness={0.4}
        metalness={0.1}
      />
    </mesh>
  )
}

function LaserRaycaster({
  mode,
  structureRef,
  tumorRefs,
  hit,
  onBurn,
  onStructureHit,
}: {
  mode: Mode
  structureRef: React.RefObject<THREE.Mesh | null>
  tumorRefs: React.MutableRefObject<(THREE.Mesh | null)[]>
  hit: Set<number>
  onBurn: (i: number) => void
  onStructureHit: () => void
}) {
  const { camera, pointer } = useThree()
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const mouse = useMemo(() => new THREE.Vector2(), [])
  const lastHitTumor = useRef<number | null>(null)
  const lastHitStructure = useRef(false)

  useFrame(() => {
    if (mode !== 'laser') {
      lastHitTumor.current = null
      lastHitStructure.current = false
      return
    }
    mouse.set(pointer.x, pointer.y)
    raycaster.setFromCamera(mouse, camera)
    const allObjects: THREE.Object3D[] = []
    if (structureRef.current) allObjects.push(structureRef.current)
    tumorRefs.current.forEach((m, idx) => {
      if (m && !hit.has(idx)) allObjects.push(m)
    })
    const hits = raycaster.intersectObjects(allObjects, false)
    const first = hits[0]
    if (!first) {
      lastHitTumor.current = null
      lastHitStructure.current = false
      return
    }
    const obj = first.object as THREE.Mesh & { userData: { tumorIndex?: number; isStructure?: boolean } }
    if (obj.userData.tumorIndex !== undefined) {
      const i = obj.userData.tumorIndex
      lastHitStructure.current = false
      if (lastHitTumor.current !== i) {
        lastHitTumor.current = i
        onBurn(i)
      }
      return
    }
    lastHitTumor.current = null
    if (obj.userData.isStructure) {
      if (!lastHitStructure.current) {
        lastHitStructure.current = true
        onStructureHit()
      }
    } else {
      lastHitStructure.current = false
    }
  })

  return null
}

function TumorAblationGame() {
  const { endGame, trackMovement } = useGameSession()
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const { count: COUNT, radius: RADIUS } = getParams(difficulty)
  const [mode, setMode] = useState<Mode>('camera')
  const [started, setStarted] = useState(false)
  const [timeMs, setTimeMs] = useState(0)
  const [errorFlash, setErrorFlash] = useState(false)
  const [structureErrors, setStructureErrors] = useState(0)
  
  // Clinical Case State
  const [currentCase, setCurrentCase] = useState<ClinicalCase | null>(null)
  
  useEffect(() => {
    // Select random case on mount
    const randomIndex = Math.floor(Math.random() * CLINICAL_CASES.length)
    setCurrentCase(CLINICAL_CASES[randomIndex])
  }, [])
  
  const startRef = useRef(0)
  const intervalRef = useRef<number>(0)
  const structureRef = useRef<THREE.Mesh | null>(null)
  const tumorRefs = useRef<(THREE.Mesh | null)[]>([])
  const structureErrorsRef = useRef(0)

  const [positions, setPositions] = useState<[number, number, number][]>([])
  const [hit, setHit] = useState<Set<number>>(new Set())

  useEffect(() => {
    tumorRefs.current = new Array(COUNT).fill(null)
  }, [COUNT])

  const handleBurn = useCallback(
    (i: number) => {
      setHit((h) => {
        const newSet = new Set(h)
        if (newSet.has(i)) return newSet
        newSet.add(i)
        return newSet
      })
    },
    []
  )

  useEffect(() => {
    if (!started) return
    
    if (hit.size >= COUNT) {
      clearInterval(intervalRef.current)
      const t = Date.now() - startRef.current
      // Ensure we don't set time multiple times or end game multiple times if effect re-runs
      // But hit.size increasing happens once per game usually.
      
      // Use a flag or check if already ended? 
      // endGame will unmount this component or navigate away, so it should be fine.
      
      setTimeMs(t)
      const errs = structureErrorsRef.current
      
      let perf = 100 - (t / 1000) * 1 - errs * 15
      if (perf < 0) perf = 0
      if (perf > 100) perf = 100
      
      endGame({ 
         perfection: Math.round(perf), 
         timeMs: t, 
         score: Math.round(perf * 10),
         difficulty,
         extra: {
           errors: errs,
           tumors: COUNT
         }
      })
    }
  }, [hit, COUNT, started, endGame, difficulty])

  const handleStructureHit = useCallback(() => {
    setErrorFlash(true)
    setStructureErrors((e) => {
      const next = e + 1
      structureErrorsRef.current = next
      return next
    })
  }, [])

  const handleFinish = useCallback(() => {
    if (!started) return
    clearInterval(intervalRef.current)
    const t = Date.now() - startRef.current
    setTimeMs(t)
    const errs = structureErrorsRef.current
    const burned = hit.size
    const remaining = COUNT - burned
    
    // Penalize for remaining tumors
    let perf = 100 - (t / 1000) * 1 - errs * 15 - remaining * 15
    if (perf < 0) perf = 0
    if (perf > 100) perf = 100
    
    endGame({ 
       perfection: Math.round(perf), 
       timeMs: t, 
       score: Math.round(perf * 10),
       difficulty,
       extra: {
         errors: errs,
         tumors: burned,
         total: COUNT
       }
    })
  }, [started, hit, COUNT, difficulty, endGame])

  const start = () => {
    setPositions(generateTumorPositionsOnKidney(COUNT, RADIUS))
    setStarted(true)
    setHit(new Set())
    setStructureErrors(0)
    structureErrorsRef.current = 0
    setTimeMs(0)
    setMode('camera')
    startRef.current = Date.now()
    intervalRef.current = window.setInterval(() => setTimeMs(Date.now() - startRef.current), 100)
  }

  // Telemetry
  const handlePointerMove = (e: React.PointerEvent) => {
     if (started) {
       trackMovement(e.clientX, e.clientY)
     }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%' }}>
      
      {!started && currentCase ? (
        <div style={{ 
          background: 'var(--bg-card)', 
          border: '1px solid var(--border)', 
          borderRadius: '8px', 
          padding: '2rem',
          maxWidth: '800px',
          width: '100%',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--navy)' }}>
              <FileText size={24} />
              Historial Clínico: {currentCase.id}
            </h2>
            <div style={{ 
              background: 'var(--bg-soft)', 
              color: 'var(--accent)', 
              padding: '0.25rem 0.75rem', 
              borderRadius: '999px', 
              fontSize: '0.875rem', 
              fontWeight: 600 
            }}>
              CONFIDENCIAL
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-subtle)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                <User size={16} />
                Datos del Paciente
              </div>
              <div style={{ background: 'var(--bg)', padding: '1rem', borderRadius: '6px' }}>
                <div style={{ marginBottom: '0.5rem' }}><strong>Nombre:</strong> {currentCase.patientName}</div>
                <div style={{ marginBottom: '0.5rem' }}><strong>Edad:</strong> {currentCase.age} años</div>
                <div style={{ marginBottom: '0.5rem' }}><strong>Sexo:</strong> {currentCase.gender}</div>
                <div><strong>Comorbilidades:</strong> {currentCase.comorbidities}</div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-subtle)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                <Activity size={16} />
                Diagnóstico
              </div>
              <div style={{ background: 'var(--bg)', padding: '1rem', borderRadius: '6px' }}>
                <div style={{ marginBottom: '0.5rem' }}><strong>Patología:</strong> {currentCase.diagnosis}</div>
                <div style={{ marginBottom: '0.5rem' }}><strong>Tamaño Tumor:</strong> {currentCase.tumorSize}</div>
                <div><strong>Ubicación:</strong> {currentCase.location}</div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-subtle)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              <FileText size={16} />
              Historia Médica
            </div>
            <p style={{ lineHeight: 1.6, color: 'var(--text)' }}>
              {currentCase.history}
            </p>
          </div>

          <div style={{ 
            background: 'rgba(239, 68, 68, 0.05)', 
            border: '1px solid rgba(239, 68, 68, 0.2)', 
            borderRadius: '6px', 
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--danger)', fontWeight: 600 }}>
              <Target size={20} />
              OBJETIVO QUIRÚRGICO
            </div>
            <p style={{ margin: 0, color: 'var(--text)' }}>
              {currentCase.objective}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <span style={{ fontSize: '0.9rem', color: 'var(--text-subtle)' }}>Dificultad de simulación:</span>
               <DifficultySelector value={difficulty} onChange={setDifficulty} disabled={started} />
            </div>
            
            <button 
              onClick={start} 
              className="btn-primary" 
              style={{ 
                fontSize: '1.1rem', 
                padding: '0.75rem 2rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                marginTop: '1rem'
              }}
            >
              <Play size={20} fill="currentColor" />
              Proceder a Quirófano
            </button>
          </div>

        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ 
              background: 'var(--bg-card)', 
              padding: '0.25rem 0.75rem', 
              borderRadius: '4px', 
              fontSize: '0.9rem', 
              border: '1px solid var(--border)',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center'
            }}>
              <User size={14} />
              {currentCase?.patientName}
            </div>
            <span className="metric" style={{ fontVariantNumeric: 'tabular-nums' }}>Tiempo: {(timeMs / 1000).toFixed(2)} s</span>
            <span className="metric">Tumores: {hit.size} / {COUNT}</span>
            {structureErrors > 0 && (
              <span className="metric" style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <AlertTriangle size={14} />
                Errores: {structureErrors}
              </span>
            )}
          </div>

          <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
            <strong>Cámara:</strong> rota la vista. <strong>Láser:</strong> apunta y quema. Objetivo: {currentCase?.objective.substring(0, 50)}...
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setMode('camera')}
              style={{
                background: mode === 'camera' ? 'var(--accent)' : 'var(--bg-card)',
                color: mode === 'camera' ? 'var(--navy)' : 'var(--text)',
                border: `1px solid ${mode === 'camera' ? 'var(--accent)' : 'var(--border)'}`,
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              Cámara (rotar)
            </button>
            <button
              type="button"
              onClick={() => setMode('laser')}
              style={{
                background: mode === 'laser' ? 'var(--danger)' : 'var(--bg-card)',
                color: mode === 'laser' ? '#fff' : 'var(--text)',
                border: `1px solid ${mode === 'laser' ? 'var(--danger)' : 'var(--border)'}`,
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              Láser (quemar)
            </button>
            <button
              type="button"
              onClick={handleFinish}
              style={{
                background: 'var(--bg-elevated)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer',
                marginLeft: 'auto'
              }}
            >
              Finalizar Procedimiento
            </button>
          </div>

          <ErrorFlash
            trigger={errorFlash}
            onClear={() => setErrorFlash(false)}
            message="¡ADVERTENCIA! Daño a tejido renal sano detectado."
            className="canvas-wrap"
            style={{ width: '100%', maxWidth: 700, height: 450, borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-strong)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          >
            <div style={{ width: '100%', maxWidth: 700, height: 450 }} onPointerMove={handlePointerMove}>
              <Canvas camera={{ position: [4, 2, 6], fov: 50 }}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 5, 5]} intensity={1} />
                <OrbitControls enabled={mode === 'camera'} />
                <Structure innerRef={structureRef} />
                {started &&
                  positions.map((pos, i) => {
                    if (hit.has(i)) return null
                    return (
                      <mesh
                        key={i}
                        position={pos}
                        ref={(el) => {
                          if (el) {
                            tumorRefs.current[i] = el
                            el.userData.tumorIndex = i
                          }
                        }}
                      >
                        <sphereGeometry args={[RADIUS, 24, 24]} />
                        <meshStandardMaterial color="#c2410c" emissive="#7f1d1d" />
                      </mesh>
                    )
                  })}
                {started && (
                  <LaserRaycaster
                    mode={mode}
                    structureRef={structureRef}
                    tumorRefs={tumorRefs}
                    hit={hit}
                    onBurn={handleBurn}
                    onStructureHit={handleStructureHit}
                  />
                )}
              </Canvas>
            </div>
          </ErrorFlash>
        </>
      )}
    </div>
  )
}

export default function TumorAblation() {
  return (
    <GameFrame title="Ablación de Tumor Renal" gameId="tumor-ablation">
      <TumorAblationGame />
    </GameFrame>
  )
}
