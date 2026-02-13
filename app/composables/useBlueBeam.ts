import type { FogAdd, BeamCone } from '~/utils/types'
import { GAME_CONFIGS } from '~/utils/constants'
import { isPositionInCone, generateSpreadPositions } from '~/utils/geometry'

export function useBlueBeam() {
  const fogs = ref<FogAdd[]>([])
  const cone = ref<BeamCone>({
    type: 'blue',
    angle: 0,
    width: GAME_CONFIGS.blue.coneWidth,
    radius: 1,
  })
  const azureReveals = ref(0)
  const damageFlash = ref(0)
  const showingHints = ref(false)
  let hintTimer = 0
  const HINT_INTERVAL = 8
  const HINT_DURATION = 1.5

  function initialize() {
    const positions = generateSpreadPositions(3, 0.3, 0.85)
    fogs.value = positions.map((pos, i) => ({
      id: `azure-${i}`,
      type: 'azure' as const,
      position: pos,
      revealed: false,
      health: 100,
      maxHealth: 100,
      killed: false,
      revealedAt: null,
    }))
    azureReveals.value = 0
    damageFlash.value = 0
    showingHints.value = false
    hintTimer = 0
  }

  function update(dt: number, coneAngle: number, elapsed: number) {
    cone.value.angle = coneAngle

    // Decay damage flash
    if (damageFlash.value > 0) {
      damageFlash.value = Math.max(0, damageFlash.value - dt * 2)
    }

    // Flash hint system
    hintTimer += dt
    if (hintTimer >= HINT_INTERVAL) {
      showingHints.value = true
      if (hintTimer >= HINT_INTERVAL + HINT_DURATION) {
        showingHints.value = false
        hintTimer = 0
      }
    }

    const halfWidth = cone.value.width / 2

    for (const fog of fogs.value) {
      const inCone = isPositionInCone(
        fog.position,
        cone.value.angle,
        halfWidth,
        cone.value.radius,
      )

      if (inCone && !fog.revealed) {
        fog.revealed = true
        fog.revealedAt = elapsed
        azureReveals.value++
        damageFlash.value = 1
      }
      else if (!inCone && fog.revealed) {
        fog.revealed = false
      }
    }
  }

  function getScoreData(elapsed: number) {
    return {
      beam: 'blue' as const,
      totalTime: elapsed,
      azureReveals: azureReveals.value,
    }
  }

  return { fogs, cone, azureReveals, damageFlash, showingHints, initialize, update, getScoreData }
}
