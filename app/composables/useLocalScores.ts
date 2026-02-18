import type { BeamType, GameScore } from '~/utils/types'

export interface BestScore {
  grade: 'S' | 'A' | 'B' | 'C' | 'F'
  totalTime: number
  fogsKilled?: number
  azureReveals?: number
  coneUptime?: number
}

type BestScores = Partial<Record<BeamType, BestScore>>

const STORAGE_KEY = 'durumu-best-scores'
const GRADE_RANK: Record<string, number> = { F: 0, C: 1, B: 2, A: 3, S: 4 }

function load(): BestScores {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function save(scores: BestScores) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores))
}

export function useLocalScores() {
  const bestScores = useState<BestScores>('best-scores', () => load())

  function getBest(beam: BeamType): BestScore | undefined {
    return bestScores.value[beam]
  }

  function saveBest(gameScore: GameScore): boolean {
    const current = bestScores.value[gameScore.beam]
    const incoming: BestScore = {
      grade: gameScore.grade,
      totalTime: gameScore.totalTime,
    }

    if (gameScore.beam === 'red') incoming.fogsKilled = gameScore.fogsKilled
    if (gameScore.beam === 'blue') incoming.azureReveals = gameScore.azureReveals
    if (gameScore.beam === 'yellow') {
      const total = gameScore.timeInCone + gameScore.timeOutOfCone
      incoming.coneUptime = total > 0 ? Math.round((gameScore.timeInCone / total) * 100) : 0
    }

    if (current) {
      const newRank = GRADE_RANK[incoming.grade] ?? 0
      const oldRank = GRADE_RANK[current.grade] ?? 0
      if (newRank < oldRank || (newRank === oldRank && incoming.totalTime >= current.totalTime)) {
        return false
      }
    }

    bestScores.value = { ...bestScores.value, [gameScore.beam]: incoming }
    save(bestScores.value)
    return true
  }

  return { bestScores, getBest, saveBest }
}
