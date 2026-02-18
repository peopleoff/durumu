import type { GameScore, BeamType } from '~/utils/types'

export function useScoring() {
  function calculateScore(partial: {
    beam: BeamType
    totalTime: number
    fogsKilled?: number
    crimsonBlooms?: number
    azureReveals?: number
    amberBursts?: number
    amberFogsKilled?: number
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
            details.push('Peg stares at the logs. \'...Fine. That was acceptable.\' He sounds almost confused. This is the highest praise you will ever receive.')
          }
          else if (partial.totalTime < 45) {
            grade = 'A'
            details.push('Peg gives the smallest possible nod. \'Fogs are dead, nobody wiped. Don\'t let it go to your head.\'')
          }
          else {
            grade = 'B'
            details.push('\'You got them all. Eventually.\' Peg checks his watch. \'I\'ve seen faster from pugs.\'')
          }
        }
        else if (killed === 3) {
          grade = blooms <= 2 ? 'C' : 'F'
          details.push(`'You bloomed. On a practice tool.' Peg's disappointment is audible. 'Do you understand what blooms do to melee?'`)
        }
        else {
          grade = 'F'
          details.push(`Peg has muted his mic. You can still somehow hear the sigh. '${killed}/3 fogs in 50 seconds. We're going to be here all night.'`)
        }
        break
      }

      case 'blue': {
        const reveals = partial.azureReveals ?? 0

        if (reveals === 0) {
          grade = 'S'
          details.push('Peg says nothing. You check Discord — he\'s still there. No news is good news. This is the dream.')
        }
        else if (reveals === 1) {
          grade = 'A'
          details.push('\'One reveal. ONE.\' Peg is pinching the bridge of his nose. \'Do you know what Icy Grasp does to the melee stack?\'')
        }
        else if (reveals <= 3) {
          grade = 'B'
          details.push(`'${reveals} reveals.' Peg's mic picks up a long, defeated exhale. 'We've gone over this. Multiple times.'`)
        }
        else if (reveals <= 5) {
          grade = 'C'
          details.push('You can hear Peg typing something in officer chat. It\'s probably about you. It\'s probably not good.')
        }
        else {
          grade = 'F'
          details.push('Peg\'s has gone very quiet. This is somehow worse than yelling.')
        }
        break
      }

      case 'yellow': {
        const inCone = partial.timeInCone ?? 0
        const outCone = partial.timeOutOfCone ?? 0
        const total = inCone + outCone
        const pct = total > 0 ? inCone / total : 0
        const bursts = partial.amberBursts ?? 0
        const killed = partial.amberFogsKilled ?? 0

        details.push(`Cone uptime: ${Math.round(pct * 100)}%`)

        // Burst of Amber = raid wipe (fog escaped cone alive)
        if (bursts > 0) {
          grade = 'F'
          details.push('\'Burst of Amber. Raid wipe.\' Peg mutes his mic. You imagine the sound on the other end.')
          if (killed > 0) {
            details.push(`You got ${killed} fog${killed > 1 ? 's' : ''} but one escaped. Peg is reconsidering your raid spot.`)
          }
          details.push('Position away from fog spawns, or click to kill them before the cone passes!')
          break
        }

        // No wipe — grade based on cone uptime and fog reveals
        if (killed > 0) {
          details.push(`Amber Fogs killed: ${killed}`)
        }

        if (pct >= 0.95 && killed === 0) {
          grade = 'S'
          details.push('Peg checks the logs twice, certain something glitched. \'...Acceptable.\' You can tell it physically hurt him to say.')
        }
        else if (pct >= 0.95 && killed > 0) {
          grade = 'A'
          details.push('Peg\'s eyebrow twitches — almost impressed. \'Cone tracking was decent. I\'ve seen worse.\' This is high praise.')
        }
        else if (pct >= 0.85 && killed === 0) {
          grade = 'A'
          details.push('Peg\'s eyebrow twitches — almost impressed. \'Cone tracking was decent. I\'ve seen worse.\' This is high praise.')
        }
        else if (pct >= 0.85) {
          grade = 'B'
          details.push('\'You left the cone more than I\'d like.\' Which is to say, at all. Peg would like you in the cone 100% of the time.')
        }
        else if (pct >= 0.70) {
          grade = killed === 0 ? 'B' : 'C'
          details.push('\'You left the cone more than I\'d like.\' Which is to say, at all. Peg would like you in the cone 100% of the time.')
        }
        else if (pct >= 0.50) {
          grade = 'C'
          details.push('\'Were you even looking at your screen?\' Peg genuinely wants to know.')
        }
        else {
          grade = 'F'
          details.push('\'You spent more time outside the cone than in it.\' Peg stares into the middle distance. He\'s questioning his leadership.')
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
      amberBursts: partial.amberBursts ?? 0,
      amberFogsKilled: partial.amberFogsKilled ?? 0,
      timeInCone: partial.timeInCone ?? 0,
      timeOutOfCone: partial.timeOutOfCone ?? 0,
      grade,
      details,
    }
  }

  return { calculateScore }
}
