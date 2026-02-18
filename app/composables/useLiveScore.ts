import type { BeamType, ScoreEvent } from '~/utils/types'
import { SCORING, GAME_CONFIGS } from '~/utils/constants'

let eventIdCounter = 0

export function useLiveScore(props: {
  beam: BeamType
  elapsed: number
  fogsKilled?: number
  crimsonBlooms?: number
  azureReveals?: number
  amberBursts?: number
  amberFogsKilled?: number
  timeInCone?: number
  timeOutOfCone?: number
}) {
  const events = ref<ScoreEvent[]>([])

  // Track previous values for discrete event detection
  const prevFogsKilled = ref(0)
  const prevCrimsonBlooms = ref(0)
  const prevAzureReveals = ref(0)
  const prevAmberBursts = ref(0)

  function addEvent(text: string, points: number) {
    const event: ScoreEvent = {
      id: ++eventIdCounter,
      text,
      points,
      positive: points > 0,
      timestamp: Date.now(),
    }
    events.value.push(event)
    // Keep max 3 visible
    if (events.value.length > 3) {
      events.value.shift()
    }
    // Auto-remove after 1.5s
    setTimeout(() => {
      events.value = events.value.filter(e => e.id !== event.id)
    }, 1500)
  }

  const points = computed(() => {
    switch (props.beam) {
      case 'red': {
        const kills = props.fogsKilled ?? 0
        const blooms = props.crimsonBlooms ?? 0
        return Math.max(0, kills * SCORING.red.fogKill + blooms * SCORING.red.crimsonBloom)
      }
      case 'blue': {
        const reveals = props.azureReveals ?? 0
        return Math.max(0, SCORING.blue.startingPoints + reveals * SCORING.blue.azureReveal)
      }
      case 'yellow': {
        const inCone = props.timeInCone ?? 0
        const outCone = props.timeOutOfCone ?? 0
        const bursts = props.amberBursts ?? 0
        const fogKills = props.amberFogsKilled ?? 0
        return Math.max(0, Math.round(
          inCone * SCORING.yellow.inConePerSec
          + outCone * SCORING.yellow.outConePerSec
          + bursts * SCORING.yellow.amberBurst
          + fogKills * SCORING.yellow.amberFogKill,
        ))
      }
      default:
        return 0
    }
  })

  const projectedGrade = computed<'S' | 'A' | 'B' | 'C' | 'F'>(() => {
    switch (props.beam) {
      case 'red': {
        const killed = props.fogsKilled ?? 0
        const blooms = props.crimsonBlooms ?? 0
        if (killed === 3 && blooms === 0) {
          return props.elapsed < 30 ? 'S' : props.elapsed < 45 ? 'A' : 'B'
        }
        if (killed === 3) return blooms <= 2 ? 'C' : 'F'
        // Mid-game projection: on track if no blooms
        if (blooms === 0 && killed > 0) return 'A'
        if (blooms === 0) return 'B'
        return blooms <= 2 ? 'C' : 'F'
      }
      case 'blue': {
        const reveals = props.azureReveals ?? 0
        if (reveals === 0) return 'S'
        if (reveals === 1) return 'A'
        if (reveals <= 3) return 'B'
        if (reveals <= 5) return 'C'
        return 'F'
      }
      case 'yellow': {
        const inCone = props.timeInCone ?? 0
        const outCone = props.timeOutOfCone ?? 0
        const total = inCone + outCone
        const pct = total > 0 ? inCone / total : 1
        const bursts = props.amberBursts ?? 0
        const fogKills = props.amberFogsKilled ?? 0
        if (bursts > 0) return 'F'
        if (pct >= 0.95 && fogKills === 0) return 'S'
        if (pct >= 0.95) return 'A'
        if (pct >= 0.85 && fogKills === 0) return 'A'
        if (pct >= 0.85) return 'B'
        if (pct >= 0.70) return 'B'
        if (pct >= 0.50) return 'C'
        return 'F'
      }
      default:
        return 'F'
    }
  })

  // Watch for discrete events
  watch(() => props.fogsKilled ?? 0, (val) => {
    if (val > prevFogsKilled.value) {
      addEvent('FOG KILL!', SCORING.red.fogKill)
    }
    prevFogsKilled.value = val
  })

  watch(() => props.crimsonBlooms ?? 0, (val) => {
    if (val > prevCrimsonBlooms.value) {
      addEvent('BLOOM! PEG SAW THAT', SCORING.red.crimsonBloom)
    }
    prevCrimsonBlooms.value = val
  })

  watch(() => props.azureReveals ?? 0, (val) => {
    if (val > prevAzureReveals.value) {
      addEvent('REVEALED! PEG IS TYPING...', SCORING.blue.azureReveal)
    }
    prevAzureReveals.value = val
  })

  watch(() => props.amberBursts ?? 0, (val) => {
    if (val > prevAmberBursts.value) {
      addEvent('WIPE! PEG HAS LEFT', SCORING.yellow.amberBurst)
    }
    prevAmberBursts.value = val
  })

  const prevAmberFogsKilled = ref(0)
  watch(() => props.amberFogsKilled ?? 0, (val) => {
    if (val > prevAmberFogsKilled.value) {
      addEvent('FOG KILLED!', SCORING.yellow.amberFogKill)
    }
    prevAmberFogsKilled.value = val
  })

  return {
    points,
    projectedGrade,
    events,
  }
}
