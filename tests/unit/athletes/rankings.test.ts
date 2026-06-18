import { describe, expect, it } from 'vitest'

import { calculateResultPoints } from '@/lib/utils/points'
import {
  buildCompetitionResultsFromAthletes,
  getRankedAthletes,
} from '@/lib/utils/rankings'

describe('ranking calculations', () => {
  it('reads tournament difficulty and fights won from athlete achievements', () => {
    const results = buildCompetitionResultsFromAthletes([
      {
        id: 'ath_1',
        skfId: 'SKF24RJ001',
        firstName: 'Asha',
        lastName: 'Kumar',
        dateOfBirth: '2010-01-10',
        gender: 'female',
        achievements: [
          {
            id: 'ach_1',
            type: 'tournament-gold',
            date: '2026-05-01',
            tournamentLevel: 'state',
            eventCategory: 'kata-individual',
            ageGroup: 'junior',
            difficultyLevel: 4,
            wins: 3,
          },
        ],
      },
    ] as any)

    expect(results[0]).toEqual(
      expect.objectContaining({
        difficultyLevel: 4,
        wins: 3,
      })
    )
  })

  it('ranks athletes higher when tournament difficulty and wins are stronger', () => {
    const athletes = [
      {
        id: 'ath_1',
        skfId: 'SKF24RJ001',
        firstName: 'Asha',
        lastName: 'Kumar',
        branchName: 'Rajajinagar',
        currentBelt: 'brown',
        status: 'active',
        dateOfBirth: '2010-01-10',
        gender: 'female',
      },
      {
        id: 'ath_2',
        skfId: 'SKF24ML002',
        firstName: 'Diya',
        lastName: 'Nair',
        branchName: 'Malleshwaram',
        currentBelt: 'brown',
        status: 'active',
        dateOfBirth: '2010-02-14',
        gender: 'female',
      },
    ]

    const results = [
      {
        athleteId: 'ath_1',
        date: '2026-05-01',
        level: 'state',
        result: 'gold',
        category: 'kata-individual',
        ageGroup: 'junior',
        discipline: 'kata',
        gender: 'female',
        weightCategory: null,
        wins: 1,
        difficultyLevel: 2,
      },
      {
        athleteId: 'ath_2',
        date: '2026-05-01',
        level: 'state',
        result: 'gold',
        category: 'kata-individual',
        ageGroup: 'junior',
        discipline: 'kata',
        gender: 'female',
        weightCategory: null,
        wins: 4,
        difficultyLevel: 5,
      },
    ]

    const ranked = getRankedAthletes(athletes as any, results as any, {
      currentDate: new Date('2026-05-10'),
    })

    expect(ranked[0].athleteId).toBe('ath_2')
    expect(ranked[0].fightWinCount).toBe(4)
    expect(ranked[0].totalPoints).toBeGreaterThan(ranked[1].totalPoints)
  })

  it('does not decay ranking points over time', () => {
    const points = calculateResultPoints(
      {
        date: '2020-01-01',
        level: 'state',
        result: 'gold',
        wins: 2,
        difficultyLevel: 3,
      },
      new Date('2026-05-10')
    )

    expect(points.decayFactor).toBe(1)
    expect(points.finalPoints).toBe(points.rawPoints)
    expect(points.activePoints).toBe(points.rawPoints)
  })
})
