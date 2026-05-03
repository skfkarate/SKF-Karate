import { describe, expect, it } from 'vitest'

import {
  validateAthletePayload,
  validateEventPayload,
  validateTournamentPayload,
} from '@/lib/server/validation'

describe('validateEventPayload', () => {
  it('auto-generates a slug and keeps optional standalone fields empty', () => {
    const result = validateEventPayload({
      name: 'Summer Camp 2026',
      type: 'camp',
      date: '2026-05-01',
    })

    expect(result.slug).toBe('summer-camp-2026')
    expect(result.shortName).toBe('Summer Camp 2026')
    expect(result.venue).toBe('')
    expect(result.city).toBe('')
    expect(result.description).toBe('')
    expect(result.state).toBe('Karnataka')
  })

  it('accepts event date ranges that cross into the next month', () => {
    const result = validateEventPayload({
      name: 'May to June Camp',
      type: 'camp',
      date: '2026-05-31',
      endDate: '2026-06-01',
    })

    expect(result.date).toBe('2026-05-31')
    expect(result.endDate).toBe('2026-06-01')
  })

  it('accepts custom event types and preserves attendance-style results metadata', () => {
    const result = validateEventPayload({
      name: 'Elite Training Camp',
      slug: '',
      type: 'training-camp',
      date: '2026-06-10',
      hostingBranch: 'Rajajinagar',
      isResultsPublished: true,
      showInJourney: true,
      participants: [
        {
          id: 'p_1',
          athleteId: 'a_1',
          athleteName: 'Asha Kumar',
          skfId: 'SKF24RJ001',
          branchName: 'Rajajinagar',
          belt: 'Brown',
        },
      ],
      results: [
        {
          id: 'r_1',
          participantId: 'p_1',
          athleteId: 'a_1',
          athleteName: 'Asha Kumar',
          skfId: 'SKF24RJ001',
          result: 'completed',
          daysAttended: '3',
          notes: 'Top performer',
        },
      ],
    })

    expect(result.type).toBe('training-camp')
    expect(result.slug).toBe('elite-training-camp')
    expect(result.hostingBranch).toBe('Rajajinagar')
    expect(result.isResultsPublished).toBe(true)
    expect(result.showInJourney).toBe(true)
    expect(result.results[0]).toEqual(
      expect.objectContaining({
        participantId: 'p_1',
        result: 'completed',
        daysAttended: 3,
        notes: 'Top performer',
      })
    )
  })

  it('rejects invalid event date ranges', () => {
    expect(() =>
      validateEventPayload({
        name: 'State Seminar',
        type: 'seminar',
        date: '2026-08-20',
        endDate: '2026-08-19',
      })
    ).toThrow('End date cannot be earlier than start date.')
  })

  it('rejects invalid tournament result values inside event payloads', () => {
    expect(() =>
      validateEventPayload({
        name: 'District Open',
        type: 'tournament',
        date: '2026-09-15',
        level: 'district',
        results: [
          {
            athleteName: 'Rohan',
            skfId: 'SKF24RJ002',
            result: 'winner',
            category: 'kata-individual',
            ageGroup: 'sub-junior',
          },
        ],
      })
    ).toThrow('Result 1 is invalid.')
  })
})

describe('validateTournamentPayload', () => {
  it('accepts tournament date ranges that cross into the next month', () => {
    const result = validateTournamentPayload({
      name: 'May Open 2026',
      shortName: 'May Open',
      date: '2026-05-31',
      endDate: '2026-06-01',
      venue: 'SKF Arena',
      city: 'Bengaluru',
      state: 'Karnataka',
      description: 'Two-day tournament',
      totalParticipants: 10,
      skfParticipants: 5,
    })

    expect(result.date).toBe('2026-05-31')
    expect(result.endDate).toBe('2026-06-01')
  })

  it('auto-generates slug for tournaments while enforcing participant totals', () => {
    const result = validateTournamentPayload({
      name: 'National Championship 2026',
      shortName: 'Nationals 2026',
      date: '2026-11-01',
      venue: 'Kanteerava Indoor Stadium',
      city: 'Bengaluru',
      state: 'Karnataka',
      description: 'National level championship',
      totalParticipants: 500,
      skfParticipants: 42,
      winners: [
        {
          athleteName: 'Asha Kumar',
          skfId: 'SKF24RJ001',
          branchName: 'Rajajinagar',
          belt: 'Brown Belt',
          medal: 'gold',
          category: 'kata-individual',
          ageGroup: 'junior',
          difficultyLevel: 4,
          wins: 3,
        },
      ],
    })

    expect(result.slug).toBe('national-championship-2026')
    expect(result.totalParticipants).toBe(500)
    expect(result.skfParticipants).toBe(42)
    expect(result.winners[0]).toEqual(
      expect.objectContaining({
        difficultyLevel: 4,
        wins: 3,
      })
    )
  })
})

describe('validateAthletePayload', () => {
  it('preserves profile-linked tournament metadata in athlete achievements', () => {
    const result = validateAthletePayload({
      firstName: 'Asha',
      lastName: 'Kumar',
      dateOfBirth: '2012-05-09',
      gender: 'female',
      branchName: 'M P Sports Club',
      currentBelt: 'brown',
      joinDate: '2026-01-10',
      status: 'active',
      monthlyFee: 0,
      achievements: [
        {
          id: 'ach_tour_1',
          type: 'tournament-gold',
          date: '2026-04-02',
          title: 'Gold Medal - State Open',
          pointsAwarded: 120,
          tournamentName: 'State Open',
          tournamentLevel: 'state',
          eventCategory: 'kumite-individual',
          ageGroup: 'junior',
          weightCategory: '-45kg',
          competitionResult: 'gold',
          difficultyLevel: 5,
          wins: 4,
          position: 1,
          sourceEventId: 'tour_1',
          sourceEventType: 'tournament',
          sourceEventLevel: 'state',
        },
      ],
    })

    expect(result.achievements[0]).toEqual(
      expect.objectContaining({
        type: 'tournament-gold',
        difficultyLevel: 5,
        wins: 4,
        position: '1',
        sourceEventId: 'tour_1',
      })
    )
  })
})
