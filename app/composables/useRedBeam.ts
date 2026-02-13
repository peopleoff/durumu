import type { FogAdd, BeamCone, PolarPosition } from '~/utils/types'
import { GAME_CONFIGS } from '~/utils/constants'
import { isPositionInCone, generateSpreadPositions } from '~/utils/geometry'

export function useRedBeam() {
  const fogs = ref<FogAdd[]>([])
  const cone = ref<BeamCone>({
    type: 'red',
    angle: 0,
    width: GAME_CONFIGS.red.coneWidth,
    radius: 1,
  })
  const crimsonBlooms = ref(0)
  const allFogsKilled = ref(false)
  const damageFlash = ref(0)

  function initialize() {
    const positions = generateSpreadPositions(3, 0.35, 0.8)
    fogs.value = positions.map((pos, i) => ({
      id: `crimson-${i}`,
      type: 'crimson' as const,
      position: pos,
      revealed: false,
      health: 100,
      maxHealth: 100,
      killed: false,
      revealedAt: null,
    }))
    crimsonBlooms.value = 0
    allFogsKilled.value = false
    damageFlash.value = 0
  }

  function update(dt: number, coneAngle: number, elapsed: number) {
    cone.value.angle = coneAngle

    // Decay damage flash
    if (damageFlash.value > 0) {
      damageFlash.value = Math.max(0, damageFlash.value - dt * 2)
    }

    const halfWidth = cone.value.width / 2

    for (const fog of fogs.value) {
      if (fog.killed) continue

      const inCone = isPositionInCone(
        fog.position,
        cone.value.angle,
        halfWidth,
        cone.value.radius,
      )

      if (inCone) {
        if (!fog.revealed) {
          fog.revealed = true
          fog.revealedAt = elapsed
        }
        // Drain health
        fog.health -= GAME_CONFIGS.red.fogHealthDrainRate * dt
        if (fog.health <= 0) {
          fog.health = 0
          fog.killed = true
        }
      }
      else if (fog.revealed && !fog.killed) {
        // Crimson Bloom! Beam moved off a revealed fog
        crimsonBlooms.value++
        damageFlash.value = 1
        // Fog re-hides but keeps its damage
        fog.revealed = false
        fog.revealedAt = null
      }
    }

    allFogsKilled.value = fogs.value.every(f => f.killed)
  }

  function getScoreData(elapsed: number) {
    return {
      beam: 'red' as const,
      totalTime: elapsed,
      fogsKilled: fogs.value.filter(f => f.killed).length,
      crimsonBlooms: crimsonBlooms.value,
    }
  }

  return { fogs, cone, crimsonBlooms, allFogsKilled, damageFlash, initialize, update, getScoreData }
}
