import type { FogAdd, BeamCone, PolarPosition, Point, ArenaDimensions } from '~/utils/types'
import { GAME_CONFIGS, SCORING } from '~/utils/constants'
import { isPositionInCone, generateSpreadPositions, polarToCartesian, distance } from '~/utils/geometry'

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
  const raidWipe = ref(false)

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
    raidWipe.value = false
  }

  function update(dt: number, coneAngle: number, elapsed: number) {
    if (raidWipe.value) return
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
      }
      else if (fog.revealed && !fog.killed) {
        // Crimson Bloom! Beam moved off a revealed fog — raid wipe
        crimsonBlooms.value++
        damageFlash.value = 1
        raidWipe.value = true
        return
      }
    }

    allFogsKilled.value = fogs.value.every(f => f.killed)
  }

  /** Process click/tap events to kill revealed fogs (3 clicks to kill). */
  function handleClicks(clicks: Point[], dims: ArenaDimensions) {
    const killRadius = SCORING.FOG_KILL_RADIUS
    const damagePerClick = 34

    for (const click of clicks) {
      for (const fog of fogs.value) {
        if (fog.killed || !fog.revealed) continue

        const fogPos = polarToCartesian(dims.center, fog.position, dims.radius)
        const dist = distance(click, fogPos)

        if (dist <= killRadius) {
          fog.health -= damagePerClick
          if (fog.health <= 0) {
            fog.health = 0
            fog.killed = true
          }
          break // One click hits one fog
        }
      }
    }
  }

  function getScoreData(elapsed: number) {
    return {
      beam: 'red' as const,
      totalTime: elapsed,
      fogsKilled: fogs.value.filter(f => f.killed).length,
      crimsonBlooms: crimsonBlooms.value,
    }
  }

  return { fogs, cone, crimsonBlooms, allFogsKilled, damageFlash, raidWipe, initialize, update, handleClicks, getScoreData }
}
