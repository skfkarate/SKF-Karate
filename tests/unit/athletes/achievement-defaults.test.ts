import { describe, expect, it } from 'vitest'

import { buildRestoredAthleteProfileData } from '@/app/_components/athlete/profile/athleteProfileData'
import { ensureInitialWhiteBeltAchievement } from '@/lib/utils/athlete-achievements'

describe('athlete achievement defaults', () => {
  it('creates a DB-backed white-belt enrollment entry on the athlete join date', () => {
    const achievements = ensureInitialWhiteBeltAchievement(
      [
        {
          id: 'tour_1',
          type: 'tournament-gold',
          date: '2026-04-02',
          title: 'Gold Medal - State Open',
        },
        {
          id: 'camp_1',
          type: 'camp-completed',
          date: '2026-03-15',
          title: 'Completed Summer Camp',
        },
      ],
      {
        joinDate: '2026-01-10',
        branchName: 'M P Sports Club',
      }
    )

    expect(achievements[0]).toEqual(
      expect.objectContaining({
        type: 'enrollment',
        date: '2026-01-10',
        beltEarned: 'white',
        grade: 'Enrollment',
      })
    )
    expect(achievements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'tour_1', type: 'tournament-gold' }),
        expect.objectContaining({ id: 'camp_1', type: 'camp-completed' }),
      ])
    )
  })

  it('keeps legacy enrollment rows aligned with join date and white belt', () => {
    const achievements = ensureInitialWhiteBeltAchievement(
      [
        {
          id: 'legacy_enrollment',
          type: 'enrollment',
          date: '2026-01-01',
          title: 'Joined SKF Karate',
          pointsAwarded: 0,
        },
      ],
      {
        joinDate: '2026-02-05',
        branchName: 'Herohalli',
      }
    )

    expect(achievements).toHaveLength(1)
    expect(achievements[0]).toEqual(
      expect.objectContaining({
        id: 'legacy_enrollment',
        date: '2026-02-05',
        beltEarned: 'white',
        pointsAwarded: 0,
      })
    )
  })

  it('renders legacy enrollment achievements as white belt instead of current belt', () => {
    const profile = buildRestoredAthleteProfileData(
      {
        skfId: 'SKF26MP001',
        firstName: 'Asha',
        lastName: 'Kumar',
        gender: 'female',
        dateOfBirth: '2012-05-09',
        branchName: 'M P Sports Club',
        currentBelt: 'brown',
        status: 'active',
        joinDate: '2026-01-10',
        achievements: [
          {
            id: 'legacy_enrollment',
            type: 'enrollment',
            date: '2026-01-10',
            title: 'Joined SKF Karate',
          },
        ],
      },
      null
    )

    expect(profile.beltExaminations[0]).toEqual(
      expect.objectContaining({
        date: '2026-01-10',
        belt: 'White Belt',
        grade: 'Enrollment',
      })
    )
  })

  it('links upcoming event assignments to the profile by normalized SKF ID', () => {
    const profile = buildRestoredAthleteProfileData(
      {
        skfId: 'SKF26MP001',
        firstName: 'Asha',
        lastName: 'Kumar',
        gender: 'female',
        dateOfBirth: '2012-05-09',
        branchName: 'M P Sports Club',
        currentBelt: 'white',
        status: 'active',
        joinDate: '2026-01-10',
        achievements: [],
      },
      null,
      [
        {
          id: 'evt_1',
          name: 'State Training Camp',
          date: '2099-01-10',
          participants: [{ skfId: 'skf26mp001' }],
        },
      ]
    )

    expect(profile.nextEvents).toEqual([
      expect.objectContaining({
        id: 'evt_1',
        name: 'State Training Camp',
      }),
    ])
  })
})
