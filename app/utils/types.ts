export type BeamType = 'red' | 'blue' | 'yellow'

export type GamePhase = 'menu' | 'instructions' | 'playing' | 'results'

export interface Point {
  x: number
  y: number
}

export interface PolarPosition {
  angle: number
  distance: number
}

export interface FogAdd {
  id: string
  type: 'crimson' | 'azure' | 'amber'
  position: PolarPosition
  revealed: boolean
  health: number
  maxHealth: number
  killed: boolean
  revealedAt: number | null
}

export interface BeamCone {
  type: BeamType
  angle: number
  width: number
  radius: number
}

export interface GameScore {
  beam: BeamType
  totalTime: number
  fogsKilled: number
  crimsonBlooms: number
  azureReveals: number
  amberBursts: number
  amberFogsKilled: number
  timeInCone: number
  timeOutOfCone: number
  grade: 'S' | 'A' | 'B' | 'C' | 'F'
  details: string[]
}

export interface ScoreEvent {
  id: number
  text: string
  points: number
  positive: boolean
  timestamp: number
}

export interface ArenaDimensions {
  center: Point
  radius: number
  canvasSize: number
}
