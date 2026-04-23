import { describe, expect, it } from 'vitest'

import {
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

  it('accepts custom event types and preserves attendance-style results metadata', () => {
    const result = validateEventPayload({
      name: 'Elite Training Camp',
      slug: '',
      type: 'training-camp',
      date: '2026-06-10',
      hostingBranch: 'Rajajinagar',
      isResultsPublished: true,
      participants: [
        {
          id: 'p_1',
          athleteId: 'a_1',
          athleteName: 'Asha Kumar',
          registrationNumber: 'SKF-001',
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
          registrationNumber: 'SKF-001',
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
            registrationNumber: 'SKF-002',
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
          registrationNumber: 'SKF-001',
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
