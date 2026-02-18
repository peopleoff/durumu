import type { BeamCone, FogAdd, PolarPosition, Point, ArenaDimensions } from '~/utils/types'
import { GAME_CONFIGS, SCORING } from '~/utils/constants'
import { isPositionInCone, normalizeAngle, randomBetween, generateSpreadPositions, polarToCartesian, distance } from '~/utils/geometry'

export function useYellowBeam() {
  const cone = ref<BeamCone>({
    type: 'yellow',
    angle: 0,
    width: GAME_CONFIGS.yellow.coneWidth,
    radius: 1,
  })
  const fogs = ref<FogAdd[]>([])
  const playerInCone = ref(false)
  const timeInCone = ref(0)
  const timeOutOfCone = ref(0)
  const amberBursts = ref(0)
  const amberFogsKilled = ref(0)
  const damageFlash = ref(0)
  const raidWipe = ref(false)

  let coneSpeed = GAME_CONFIGS.yellow.yellowConeSpeed
  let speedChangeTimer = 0
  let nextSpeedChange = 5 + Math.random() * 5

  function initialize(playerAngle?: number) {
    cone.value.angle = playerAngle ?? Math.random() * Math.PI * 2
    coneSpeed = GAME_CONFIGS.yellow.yellowConeSpeed
    timeInCone.value = 0
    timeOutOfCone.value = 0
    amberBursts.value = 0
    amberFogsKilled.value = 0
    damageFlash.value = 0
    playerInCone.value = false
    raidWipe.value = false
    speedChangeTimer = 0
    nextSpeedChange = 5 + Math.random() * 5

    // Spawn 2 Amber Fogs (Heroic)
    const positions = generateSpreadPositions(2, 0.35, 0.8)
    fogs.value = positions.map((pos, i) => ({
      id: `amber-${i}`,
      type: 'amber' as const,
      position: pos,
      revealed: false,
      health: 100,
      maxHealth: 100,
      killed: false,
      revealedAt: null,
    }))
  }

  function update(dt: number, playerPolar: PolarPosition, elapsed: number) {
    if (raidWipe.value) return

    // Auto-rotate cone
    cone.value.angle = normalizeAngle(cone.value.angle + coneSpeed * dt)

    // Decay damage flash
    if (damageFlash.value > 0) {
      damageFlash.value = Math.max(0, damageFlash.value - dt * 3)
    }

    // Check if player is inside cone
    const isInside = isPositionInCone(
      playerPolar,
      cone.value.angle,
      cone.value.width / 2,
      cone.value.radius,
    )
    playerInCone.value = isInside

    if (isInside) {
      timeInCone.value += dt
    }
    else {
      timeOutOfCone.value += dt
      damageFlash.value = Math.min(damageFlash.value + dt * 0.5, 0.6)
    }

    // Check fog interactions with cone
    const halfWidth = cone.value.width / 2
    for (const fog of fogs.value) {
      if (fog.killed) continue

      const fogInCone = isPositionInCone(
        fog.position,
        cone.value.angle,
        halfWidth,
        cone.value.radius,
      )

      if (fogInCone && !fog.revealed) {
        // Cone sweeps over hidden fog — reveal it (but no penalty yet)
        fog.revealed = true
        fog.revealedAt = elapsed
      }
      else if (!fogInCone && fog.revealed && !fog.killed) {
        // Fog leaves cone alive — Burst of Amber! (raid wipe)
        amberBursts.value++
        damageFlash.value = 1
        raidWipe.value = true
        return
      }
      // If fogInCone && fog.revealed && !fog.killed — fog is still in cone, player can click to kill
    }
  }

  /** Process click/tap events to kill revealed fogs in-cone. */
  function handleClicks(clicks: Point[], dims: ArenaDimensions) {
    if (raidWipe.value) return
    const killRadius = SCORING.FOG_KILL_RADIUS

    for (const click of clicks) {
      for (const fog of fogs.value) {
        if (fog.killed || !fog.revealed) continue

        const fogPos = polarToCartesian(dims.center, fog.position, dims.radius)
        const dist = distance(click, fogPos)

        if (dist <= killRadius) {
          fog.killed = true
          fog.health = 0
          amberFogsKilled.value++
          break // One click kills one fog
        }
      }
    }
  }

  function getScoreData(elapsed: number) {
    return {
      beam: 'yellow' as const,
      totalTime: elapsed,
      timeInCone: timeInCone.value,
      timeOutOfCone: timeOutOfCone.value,
      amberBursts: amberBursts.value,
      amberFogsKilled: amberFogsKilled.value,
    }
  }

  return { cone, fogs, playerInCone, timeInCone, timeOutOfCone, amberBursts, amberFogsKilled, damageFlash, raidWipe, initialize, update, handleClicks, getScoreData }
}
