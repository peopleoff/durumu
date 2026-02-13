import type { BeamType, GamePhase, GameScore } from '~/utils/types'

export function useGameState() {
  const phase = useState<GamePhase>('game-phase', () => 'menu')
  const assignedBeam = useState<BeamType | null>('assigned-beam', () => null)
  const score = useState<GameScore | null>('game-score', () => null)

  function assignRandomBeam() {
    const beams: BeamType[] = ['red', 'blue', 'yellow']
    assignedBeam.value = beams[Math.floor(Math.random() * beams.length)]
  }

  function selectBeam(beam: BeamType) {
    assignedBeam.value = beam
  }

  function startInstructions() {
    phase.value = 'instructions'
  }

  function startCountdown() {
    phase.value = 'countdown'
  }

  function startPlaying() {
    phase.value = 'playing'
  }

  function showResults(gameScore: GameScore) {
    score.value = gameScore
    phase.value = 'results'
  }

  function returnToMenu() {
    phase.value = 'menu'
    assignedBeam.value = null
    score.value = null
  }

  return {
    phase,
    assignedBeam,
    score,
    assignRandomBeam,
    selectBeam,
    startInstructions,
    startCountdown,
    startPlaying,
    showResults,
    returnToMenu,
  }
}
