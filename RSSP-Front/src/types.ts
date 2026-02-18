export type GameId =
  | 'line-precision'
  | 'reflex'
  | 'tumor-ablation'
  | 'suture'
  | 'steady-hand'

export interface TelemetryPoint {
  x: number
  y: number
  nx?: number
  ny?: number
  timestamp: number
  velocity: number
}

export interface PatientProfile {
  name: string
  age: number
  gender: 'M' | 'F'
  condition: string
  vitals: {
    bp: string
    hr: number
    temp: number
  }
}

export type InstrumentType = 'scalpel' | 'forceps' | 'suture' | 'suction' | 'camera' | 'clamp' | 'ultrasound'

export interface Instrument {
  id: string
  name: string
  type: InstrumentType
  description: string
}

export interface SurgicalReport {
  patient: PatientProfile
  instrumentsUsed: Instrument[]
  duration: number
  complications: string[]
  score: number
  telemetry: TelemetryPoint[]
  signedBy: string
}

export interface GameResult {
  gameId: GameId
  perfection: number
  timeMs: number
  difficulty?: Difficulty
  routeAdherence?: number
  extra?: Record<string, number>
  at: string
  telemetry?: TelemetryPoint[]
}

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface GameInfo {
  id: GameId
  title: string
  description: string
  path: string
  image?: string
  requiredRank?: UserRank
}

export type UserRank = 'Estudiante' | 'Residente' | 'Cirujano Jefe'

export interface UserProgress {
  rank: UserRank
  completedGames: GameId[]
  careerModeEnabled: boolean
}
