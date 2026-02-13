import type { BeamType } from './types'

export const ARENA = {
  PADDING: 40,
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
    description: 'Find and eliminate Crimson Fogs',
  },
  blue: {
    solid: '#2080ff',
    cone: 'rgba(32, 128, 255, 0.22)',
    coneEdge: 'rgba(32, 128, 255, 0.5)',
    fog: '#4488ff',
    fogGlow: 'rgba(68, 136, 255, 0.4)',
    name: 'Blue Rays',
    description: 'Avoid revealing Azure Fogs',
  },
  yellow: {
    solid: '#ffcc00',
    cone: 'rgba(255, 204, 0, 0.22)',
    coneEdge: 'rgba(255, 204, 0, 0.5)',
    fog: '#ffdd44',
    fogGlow: 'rgba(255, 221, 68, 0.4)',
    name: 'Bright Light',
    description: 'Follow the moving cone',
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
    phaseDuration: 60,
    coneWidth: Math.PI / 4.5,
    fogCount: 3,
    fogHealthDrainRate: 25,
    yellowConeSpeed: 0,
  },
  blue: {
    phaseDuration: 45,
    coneWidth: Math.PI / 4,
    fogCount: 3,
    fogHealthDrainRate: 0,
    yellowConeSpeed: 0,
  },
  yellow: {
    phaseDuration: 45,
    coneWidth: Math.PI / 3.5,
    fogCount: 0,
    fogHealthDrainRate: 0,
    yellowConeSpeed: 0.5,
  },
}
