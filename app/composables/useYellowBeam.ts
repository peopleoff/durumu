import type { BeamCone, PolarPosition } from '~/utils/types'
import { GAME_CONFIGS } from '~/utils/constants'
import { isPositionInCone, normalizeAngle, randomBetween } from '~/utils/geometry'

export function useYellowBeam() {
  const cone = ref<BeamCone>({
    type: 'yellow',
    angle: 0,
    width: GAME_CONFIGS.yellow.coneWidth,
    radius: 1,
  })
  const playerInCone = ref(false)
  const timeInCone = ref(0)
  const timeOutOfCone = ref(0)
  const damageFlash = ref(0)

  let coneSpeed = GAME_CONFIGS.yellow.yellowConeSpeed
  let coneDirection = 1
  let speedChangeTimer = 0
  let nextSpeedChange = 5 + Math.random() * 5

  function initialize() {
    cone.value.angle = Math.random() * Math.PI * 2
    coneDirection = Math.random() > 0.5 ? 1 : -1
    coneSpeed = GAME_CONFIGS.yellow.yellowConeSpeed
    timeInCone.value = 0
    timeOutOfCone.value = 0
    damageFlash.value = 0
    playerInCone.value = false
    speedChangeTimer = 0
    nextSpeedChange = 5 + Math.random() * 5
  }

  function update(dt: number, playerPolar: PolarPosition) {
    // Auto-rotate cone
    cone.value.angle = normalizeAngle(cone.value.angle + coneSpeed * coneDirection * dt)

    // Periodically change speed/direction
    speedChangeTimer += dt
    if (speedChangeTimer >= nextSpeedChange) {
      speedChangeTimer = 0
      nextSpeedChange = 4 + Math.random() * 6

      if (Math.random() < 0.3) {
        coneDirection *= -1
      }
      coneSpeed = randomBetween(0.25, 0.75)
    }

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
  }

  function getScoreData(elapsed: number) {
    return {
      beam: 'yellow' as const,
      totalTime: elapsed,
      timeInCone: timeInCone.value,
      timeOutOfCone: timeOutOfCone.value,
    }
  }

  return { cone, playerInCone, timeInCone, timeOutOfCone, damageFlash, initialize, update, getScoreData }
}
