import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import GameFrame from '../components/GameFrame'
import { useGameSession } from '../context/GameSessionContext'
import DifficultySelector from '../components/DifficultySelector'
import ErrorFlash from '../components/ErrorFlash'
import type { Difficulty } from '../types'

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
  const [hitCount, setHitCount] = useState(0)
  const [errorFlash, setErrorFlash] = useState(false)
  const [structureErrors, setStructureErrors] = useState(0)
  
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
        setHitCount(newSet.size)
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

  const start = () => {
    setPositions(generateTumorPositionsOnKidney(COUNT, RADIUS))
    setStarted(true)
    setHitCount(0)
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <DifficultySelector value={difficulty} onChange={setDifficulty} disabled={started} />
        <span className="metric">Tiempo: {(timeMs / 1000).toFixed(2)} s</span>
        <span className="metric">Tumores: {hitCount} / {COUNT}</span>
        {structureErrors > 0 && (
          <span className="metric" style={{ color: 'var(--danger)' }}>Errores estructura: {structureErrors}</span>
        )}
      </div>

      <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', textAlign: 'center' }}>
        <strong>Cámara:</strong> rota la vista. <strong>Láser:</strong> apunta con el cursor sobre los tumores para quemarlos; si tocas el riñón = error crítico.
      </p>

      {!started && (
        <button onClick={start} className="btn-primary" style={{ marginBottom: '1rem' }}>
          Comenzar
        </button>
      )}

      {started && (
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
              cursor: 'pointer'
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
              cursor: 'pointer'
            }}
          >
            Láser (quemar)
          </button>
        </div>
      )}

      <ErrorFlash
        trigger={errorFlash}
        onClear={() => setErrorFlash(false)}
        message="Contacto no deseado con el riñón: daño tisular."
        className="canvas-wrap"
        style={{ width: '100%', maxWidth: 700, height: 450 }}
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
