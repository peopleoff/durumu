import type { BeamType } from './types'
import tank1 from '~/assets/images/tank-1.webp'
import tank2 from '~/assets/images/tank-2.png'
import healer1 from '~/assets/images/healer-1.webp'
import healer2 from '~/assets/images/healer-2.webp'
import dps1 from '~/assets/images/dps-1.webp'
import dps2 from '~/assets/images/dps-2.webp'
import dps3 from '~/assets/images/dps-3.webp'
import dps4 from '~/assets/images/dps-4.webp'
import dps5 from '~/assets/images/dps-5.webp'
import dps6 from '~/assets/images/dps-6.webp'

export const PLAYER = {
  SPEED: 250,
  MIN_DISTANCE: 0.05,
  INITIAL_DISTANCE: 0.6,
  INITIAL_ANGLE: 0,
} as const

export const ARENA = {
  PADDING: 10,
  BACKGROUND: '#0a0a12',
  PLATFORM_COLOR: '#141422',
  PLATFORM_EDGE: '#1e1e38',
  RING_COLOR: 'rgba(100, 100, 180, 0.08)',
  EYE_RADIUS: 24,
} as const

export const BEAM_COLORS = {
  red: {
    solid: '#ff2020',
    cone: 'rgba(255, 32, 32, 0.22)',
    coneEdge: 'rgba(255, 32, 32, 0.5)',
    fog: '#ff4444',
    fogGlow: 'rgba(255, 68, 68, 0.4)',
    name: 'Infrared Light',
    description: 'Find the fogs. Kill the fogs. Don\'t bloom.',
  },
  blue: {
    solid: '#2080ff',
    cone: 'rgba(32, 128, 255, 0.22)',
    coneEdge: 'rgba(32, 128, 255, 0.5)',
    fog: '#4488ff',
    fogGlow: 'rgba(68, 136, 255, 0.4)',
    name: 'Blue Rays',
    description: 'Just... don\'t touch it. Please.',
  },
  yellow: {
    solid: '#ffcc00',
    cone: 'rgba(255, 204, 0, 0.22)',
    coneEdge: 'rgba(255, 204, 0, 0.5)',
    fog: '#ffaa00',
    fogGlow: 'rgba(255, 170, 0, 0.4)',
    name: 'Bright Light',
    description: 'Stay in the cone. How hard is that?',
  },
} as const

export const GAME_CONFIGS: Record<BeamType, {
  phaseDuration: number
  coneWidth: number
  fogCount: number
  fogHealthDrainRate: number
  yellowConeSpeed: number
}> = {
  red: {
    phaseDuration: 30,
    coneWidth: Math.PI / 4.5,
    fogCount: 3,
    fogHealthDrainRate: 25,
    yellowConeSpeed: 0,
  },
  blue: {
    phaseDuration: 30,
    coneWidth: Math.PI / 4,
    fogCount: 1,
    fogHealthDrainRate: 0,
    yellowConeSpeed: 0,
  },
  yellow: {
    phaseDuration: 30,
    coneWidth: Math.PI / 3.5,
    fogCount: 2,
    fogHealthDrainRate: 0,
    yellowConeSpeed: 0.10,
  },
}

export const SCORING = {
  red: {
    fogKill: 3000,
    crimsonBloom: -1500,
  },
  blue: {
    startingPoints: 10000,
    azureReveal: -2000,
  },
  yellow: {
    inConePerSec: 200,
    outConePerSec: -100,
    amberBurst: -5000,
    amberFogKill: 1000,
  },
  FOG_KILL_RADIUS: 20,
} as const

export const WARMUP = {
  DURATION: 10,
  SKULL_APPEAR_TIME: 5,
} as const

export const AVATARS = [
  { id: 'tank-1', src: tank1 },
  { id: 'tank-2', src: tank2 },
  { id: 'healer-1', src: healer1 },
  { id: 'healer-2', src: healer2 },
  { id: 'dps-1', src: dps1 },
  { id: 'dps-2', src: dps2 },
  { id: 'dps-3', src: dps3 },
  { id: 'dps-4', src: dps4 },
  { id: 'dps-5', src: dps5 },
  { id: 'dps-6', src: dps6 },
] as const

export const TIMER_THRESHOLDS = {
  warningPercent: 0.30,
  criticalPercent: 0.15,
  pulseSeconds: 10,
  shakeSeconds: 5,
} as const
