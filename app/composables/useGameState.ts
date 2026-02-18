import type { BeamType, GamePhase, GameScore } from '~/utils/types'

export function useGameState() {
  const phase = useState<GamePhase>('game-phase', () => 'menu')
  const assignedBeam = useState<BeamType | null>('assigned-beam', () => null)
  const score = useState<GameScore | null>('game-score', () => null)
  const selectedAvatar = useState<string | null>('selected-avatar', () => null)

  function assignRandomBeam() {
    const beams: BeamType[] = ['red', 'blue', 'yellow']
    assignedBeam.value = beams[Math.floor(Math.random() * beams.length)]!
  }

  function selectBeam(beam: BeamType) {
    assignedBeam.value = beam
  }

  function startInstructions() {
    phase.value = 'instructions'
  }

  function startPlaying() {
    phase.value = 'playing'
  }

  function showResults(gameScore: GameScore) {
    score.value = gameScore
    phase.value = 'results'
    const { saveBest } = useLocalScores()
    saveBest(gameScore)
  }

  function selectAvatar(src: string) {
    selectedAvatar.value = src
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
    selectedAvatar,
    assignRandomBeam,
    selectBeam,
    selectAvatar,
    startInstructions,
    startPlaying,
    showResults,
    returnToMenu,
  }
}
