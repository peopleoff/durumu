import type { GameScore, BeamType } from '~/utils/types'

export function useScoring() {
  function calculateScore(partial: {
    beam: BeamType
    totalTime: number
    fogsKilled?: number
    crimsonBlooms?: number
    azureReveals?: number
    timeInCone?: number
    timeOutOfCone?: number
  }): GameScore {
    const details: string[] = []
    let grade: GameScore['grade'] = 'F'

    switch (partial.beam) {
      case 'red': {
        const killed = partial.fogsKilled ?? 0
        const blooms = partial.crimsonBlooms ?? 0

        if (killed === 3 && blooms === 0) {
          if (partial.totalTime < 30) {
            grade = 'S'
            details.push('Lightning fast! All Crimson Fogs eliminated with perfect beam control.')
          }
          else if (partial.totalTime < 45) {
            grade = 'A'
            details.push('Excellent work! All Crimson Fogs eliminated, no Crimson Blooms.')
          }
          else {
            grade = 'B'
            details.push('All Crimson Fogs eliminated with perfect beam control.')
          }
        }
        else if (killed === 3) {
          grade = blooms <= 2 ? 'C' : 'F'
          details.push(`All fogs killed but ${blooms} Crimson Bloom${blooms > 1 ? 's' : ''} occurred.`)
          details.push('Keep the beam steady on revealed fogs!')
        }
        else {
          grade = 'F'
          details.push(`Only ${killed}/3 Crimson Fogs eliminated. Phase failed.`)
          if (blooms > 0) details.push(`${blooms} Crimson Bloom${blooms > 1 ? 's' : ''} -- beam drifted off revealed fogs.`)
        }
        break
      }

      case 'blue': {
        const reveals = partial.azureReveals ?? 0

        if (reveals === 0) {
          grade = 'S'
          details.push('Perfect! No Azure Fogs revealed. The raid is safe.')
        }
        else if (reveals === 1) {
          grade = 'B'
          details.push('One Azure Fog briefly revealed. Increased raid damage.')
        }
        else if (reveals === 2) {
          grade = 'C'
          details.push(`${reveals} Azure Fogs revealed. Significant raid damage.`)
        }
        else {
          grade = 'F'
          details.push(`${reveals} Azure Fogs revealed. The raid took lethal damage.`)
        }
        break
      }

      case 'yellow': {
        const inCone = partial.timeInCone ?? 0
        const outCone = partial.timeOutOfCone ?? 0
        const total = inCone + outCone
        const pct = total > 0 ? inCone / total : 0

        details.push(`Time in cone: ${Math.round(pct * 100)}%`)

        if (pct >= 0.95) {
          grade = 'S'
          details.push('Outstanding cone tracking! Near-perfect soak uptime.')
        }
        else if (pct >= 0.85) {
          grade = 'A'
          details.push('Great tracking. Only brief moments outside the cone.')
        }
        else if (pct >= 0.70) {
          grade = 'B'
          details.push('Decent tracking but lost the cone a few times.')
        }
        else if (pct >= 0.50) {
          grade = 'C'
          details.push('Struggled to keep up with the cone movement.')
        }
        else {
          grade = 'F'
          details.push('Spent most of the time outside the cone. The raid took heavy damage.')
        }
        break
      }
    }

    return {
      beam: partial.beam,
      totalTime: partial.totalTime,
      fogsKilled: partial.fogsKilled ?? 0,
      crimsonBlooms: partial.crimsonBlooms ?? 0,
      azureReveals: partial.azureReveals ?? 0,
      timeInCone: partial.timeInCone ?? 0,
      timeOutOfCone: partial.timeOutOfCone ?? 0,
      grade,
      details,
    }
  }

  return { calculateScore }
}
