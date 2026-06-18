import { beforeEach, describe, expect, it, vi } from 'vitest'

const athleteRepositoryMocks = vi.hoisted(() => ({
  getAllAthletesLive: vi.fn(),
  updateAthleteLive: vi.fn(),
}))

const revalidationMocks = vi.hoisted(() => ({
  revalidateAthleteSitePaths: vi.fn(),
}))

vi.mock('@/lib/server/repositories/athletes-live', () => ({
  getAllAthletesLive: athleteRepositoryMocks.getAllAthletesLive,
  updateAthleteLive: athleteRepositoryMocks.updateAthleteLive,
}))

vi.mock('@/lib/server/revalidation', () => ({
  revalidateAthleteSitePaths: revalidationMocks.revalidateAthleteSitePaths,
}))

import {
  clearSyncedEventArtifactsFromAthletes,
  syncStandaloneEventResultsToAthletes,
  syncTournamentResultsToAthletes,
} from '@/lib/server/event-athlete-sync'

describe('event-athlete-sync', () => {
  beforeEach(() => {
    athleteRepositoryMocks.getAllAthletesLive.mockReset()
    athleteRepositoryMocks.updateAthleteLive.mockReset()
    revalidationMocks.revalidateAthleteSitePaths.mockReset()
  })

  it('publishes grading outcomes into athlete achievements and updates the current belt', async () => {
    athleteRepositoryMocks.getAllAthletesLive.mockResolvedValue([
      {
        id: 'ath_1',
        skfId: 'SKF24RJ001',
        currentBelt: 'white',
        achievements: [
          {
            id: 'legacy_1',
            type: 'seminar-attended',
            title: 'Attended Summer Seminar',
            date: '2026-01-10',
            sourceEventId: 'evt_other',
          },
        ],
      },
    ])

    const summary = await syncStandaloneEventResultsToAthletes({
      id: 'evt_grade_1',
      slug: 'april-grading',
      name: 'April Grading',
      type: 'grading',
      level: '',
      date: '2026-04-15',
      venue: 'HQ',
      city: 'Bengaluru',
      hostingBranch: 'Rajajinagar',
      results: [
        {
          id: 'res_1',
          athleteId: 'ath_1',
          athleteName: 'Asha Kumar',
          skfId: 'SKF24RJ001',
          result: 'pass',
          beltAwarded: 'brown',
          examiner: 'Sensei Rao',
          doublePromotion: true,
          notes: 'Excellent performance',
          specialAward: 'Best Performer',
        },
      ],
    } as any)

    expect(summary).toEqual({ updatedAthletes: 1 })
    expect(athleteRepositoryMocks.updateAthleteLive).toHaveBeenCalledWith(
      'ath_1',
      expect.objectContaining({
        currentBelt: 'brown',
        achievements: expect.arrayContaining([
          expect.objectContaining({
            type: 'belt-grading',
            result: 'pass',
            beltEarned: 'brown',
            sourceEventId: 'evt_grade_1',
            examiner: 'Sensei Rao',
          }),
          expect.objectContaining({
            type: 'special-award',
            awardReason: 'Best Performer',
            sourceEventId: 'evt_grade_1',
          }),
        ]),
      })
    )
    expect(revalidationMocks.revalidateAthleteSitePaths).toHaveBeenCalledWith('SKF24RJ001')
  })

  it('replaces stale tournament achievements for the same source event instead of duplicating them', async () => {
    athleteRepositoryMocks.getAllAthletesLive.mockResolvedValue([
      {
        id: 'ath_2',
        skfId: 'SKF24RJ002',
        currentBelt: 'brown',
        achievements: [
          {
            id: 'old_tournament',
            type: 'tournament-silver',
            title: 'Silver Medal — Old Title',
            date: '2026-03-01',
            sourceEventId: 'tour_1',
          },
          {
            id: 'other_event',
            type: 'camp-completed',
            title: 'Completed Camp',
            date: '2026-02-10',
            sourceEventId: 'evt_other',
          },
        ],
      },
    ])

    await syncTournamentResultsToAthletes({
      id: 'tour_1',
      slug: 'district-open',
      name: 'District Open',
      type: 'tournament',
      level: 'district',
      date: '2026-03-01',
      venue: 'Indoor Hall',
      city: 'Bengaluru',
      winners: [
        {
          id: 'winner_1',
          athleteId: 'ath_2',
          athleteName: 'Rohan Das',
          skfId: 'SKF24RJ002',
          category: 'kata-individual',
          ageGroup: 'sub-junior',
          medal: 'gold',
        },
      ],
    } as any)

    const [, payload] = athleteRepositoryMocks.updateAthleteLive.mock.calls[0]
    const syncedAchievements = payload.achievements.filter(
      (achievement: Record<string, any>) => achievement.sourceEventId === 'tour_1'
    )

    expect(syncedAchievements).toHaveLength(1)
    expect(syncedAchievements[0]).toEqual(
      expect.objectContaining({
        type: 'tournament-gold',
        competitionResult: 'gold',
        sourceEventSlug: 'district-open',
      })
    )
    expect(payload.achievements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'other_event',
          sourceEventId: 'evt_other',
        }),
      ])
    )
  })

  it('clears only achievements that belong to the unpublished or deleted event source', async () => {
    athleteRepositoryMocks.getAllAthletesLive.mockResolvedValue([
      {
        id: 'ath_3',
        skfId: 'SKF24RJ003',
        currentBelt: 'green',
        achievements: [
          {
            id: 'source_match',
            type: 'seminar-attended',
            title: 'Attended Seminar',
            date: '2026-01-01',
            sourceEventId: 'evt_remove',
          },
          {
            id: 'source_keep',
            type: 'camp-completed',
            title: 'Completed Camp',
            date: '2026-01-15',
            sourceEventId: 'evt_keep',
          },
        ],
      },
    ])

    await clearSyncedEventArtifactsFromAthletes('evt_remove')

    expect(athleteRepositoryMocks.updateAthleteLive).toHaveBeenCalledWith(
      'ath_3',
      expect.objectContaining({
        currentBelt: 'green',
        achievements: [
          expect.objectContaining({
            id: 'source_keep',
            sourceEventId: 'evt_keep',
          }),
        ],
      })
    )
    expect(revalidationMocks.revalidateAthleteSitePaths).toHaveBeenCalledWith('SKF24RJ003')
  })

  it('publishes tournament participant results into athlete profiles with participation, difficulty, and win metadata', async () => {
    athleteRepositoryMocks.getAllAthletesLive.mockResolvedValue([
      {
        id: 'ath_4',
        skfId: 'SKF24RJ004',
        currentBelt: 'green',
        achievements: [],
      },
      {
        id: 'ath_5',
        skfId: 'SKF24RJ005',
        currentBelt: 'blue',
        achievements: [],
      },
    ])

    await syncTournamentResultsToAthletes({
      id: 'tour_event_1',
      slug: 'city-challenge',
      name: 'City Challenge',
      type: 'tournament',
      level: 'state',
      date: '2026-05-20',
      venue: 'Indoor Arena',
      city: 'Bengaluru',
      results: [
        {
          id: 'res_win',
          participantId: 'p_1',
          athleteId: 'ath_4',
          athleteName: 'Diya N',
          skfId: 'SKF24RJ004',
          result: 'gold',
          medal: 'gold',
          category: 'kumite-individual',
          ageGroup: 'junior',
          difficultyLevel: 5,
          wins: 4,
        },
        {
          id: 'res_participation',
          participantId: 'p_2',
          athleteId: 'ath_5',
          athleteName: 'Rohit P',
          skfId: 'SKF24RJ005',
          result: 'participation',
          category: 'kata-individual',
          ageGroup: 'junior',
          difficultyLevel: 2,
          wins: 1,
        },
      ],
    } as any)

    expect(athleteRepositoryMocks.updateAthleteLive).toHaveBeenCalledTimes(2)

    const firstCall = athleteRepositoryMocks.updateAthleteLive.mock.calls.find(
      ([athleteId]: unknown[]) => (athleteId as string) === 'ath_4'
    )
    const secondCall = athleteRepositoryMocks.updateAthleteLive.mock.calls.find(
      ([athleteId]: unknown[]) => (athleteId as string) === 'ath_5'
    )

    expect(firstCall?.[1]).toEqual(
      expect.objectContaining({
        achievements: expect.arrayContaining([
          expect.objectContaining({
            type: 'tournament-gold',
            wins: 4,
            difficultyLevel: 5,
            sourceEventId: 'tour_event_1',
          }),
        ]),
      })
    )
    expect(secondCall?.[1]).toEqual(
      expect.objectContaining({
        achievements: expect.arrayContaining([
          expect.objectContaining({
            type: 'tournament-participation',
            wins: 1,
            difficultyLevel: 2,
            sourceEventId: 'tour_event_1',
          }),
        ]),
      })
    )
  })
})
