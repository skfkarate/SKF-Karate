import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { isEligiblePortalAthlete } from '@/lib/server/auth/portal-athlete'
import { isPubliclyVisibleAthlete } from '@/lib/athletes/public-visibility'
import { getRankedAthletes } from '@/lib/utils/rankings'

const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const originalServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const { athletes } = vi.hoisted(() => ({
  athletes: [
    {
      id: 'ath_active',
      skfId: 'SKF24MP001',
      firstName: 'Active',
      lastName: 'Athlete',
      branchName: 'MP',
      currentBelt: 'brown',
      dateOfBirth: '2010-01-01',
      gender: 'male',
      joinDate: '2024-01-01',
      status: 'active',
      achievements: [],
      isPublic: true,
      isFeatured: false,
    },
    {
      id: 'ath_inactive',
      skfId: 'SKF24MP002',
      firstName: 'Discontinued',
      lastName: 'Athlete',
      branchName: 'MP',
      currentBelt: 'brown',
      dateOfBirth: '2010-02-01',
      gender: 'female',
      joinDate: '2024-01-01',
      status: 'inactive',
      achievements: [
        {
          type: 'tournament-gold',
          date: '2025-06-01',
          tournamentLevel: 'state',
          eventCategory: 'kata-individual',
          ageGroup: 'junior',
          difficultyLevel: 3,
          wins: 2,
        },
      ],
      isPublic: true,
      isFeatured: false,
    },
    {
      id: 'ath_featured_inactive',
      skfId: 'SKF24MP003',
      firstName: 'Featured',
      lastName: 'Alumnus',
      branchName: 'MP',
      currentBelt: 'black',
      dateOfBirth: '2005-03-01',
      gender: 'male',
      joinDate: '2024-01-01',
      status: 'inactive',
      achievements: [],
      isPublic: true,
      isFeatured: true,
    },
    {
      id: 'ath_private',
      skfId: 'SKF24MP004',
      firstName: 'Private',
      lastName: 'Athlete',
      branchName: 'MP',
      currentBelt: 'brown',
      dateOfBirth: '2010-04-01',
      gender: 'male',
      joinDate: '2024-01-01',
      status: 'inactive',
      achievements: [],
      isPublic: false,
      isFeatured: false,
    },
  ],
}))

vi.mock('@/lib/server/repositories/athletes', () => ({
  getAllAthletes: () => structuredClone(athletes),
  getAthleteById: (id: string) => athletes.find((athlete) => athlete.id === id) || null,
  getAthleteBySkfId: (skfId: string) => athletes.find((athlete) => athlete.skfId === skfId) || null,
  getAthleteRank: () => null,
}))

describe('public profile visibility is independent of portal access', () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
  })

  afterEach(() => {
    if (originalSupabaseUrl === undefined) {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
    } else {
      process.env.NEXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl
    }

    if (originalServiceRoleKey === undefined) {
      delete process.env.SUPABASE_SERVICE_ROLE_KEY
    } else {
      process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceRoleKey
    }
  })

  it('only the explicit isPublic switch hides a published profile', () => {
    expect(isPubliclyVisibleAthlete({ isPublic: true })).toBe(true)
    expect(isPubliclyVisibleAthlete({ isPublic: true, status: 'inactive' })).toBe(true)
    expect(isPubliclyVisibleAthlete({ isPublic: true, status: 'alumni' })).toBe(true)
    expect(isPubliclyVisibleAthlete({ isPublic: false })).toBe(false)
    expect(isPubliclyVisibleAthlete(null)).toBe(false)
  })

  it('keeps blocking discontinued students from the portal', () => {
    expect(isEligiblePortalAthlete({ skfId: 'SKF24MP002', status: 'inactive' })).toBe(false)
  })

  it('keeps discontinued students in public name search', async () => {
    const { searchAthletesByNameLive } = await import('@/lib/server/repositories/athletes-live')
    const results = await searchAthletesByNameLive('Discontinued')

    expect(results.map((result) => result.skfId)).toContain('SKF24MP002')
  })

  it('keeps discontinued students in featured results and ranking snapshots', async () => {
    const {
      getFeaturedAthleteSearchResultsLive,
      getFeaturedAthletesLive,
      getRankSnapshotsLive,
    } = await import('@/lib/server/repositories/athletes-live')

    expect((await getFeaturedAthletesLive()).map((athlete) => athlete.skfId)).toContain(
      'SKF24MP003'
    )
    expect(
      (await getFeaturedAthleteSearchResultsLive(10)).map((athlete) => athlete.skfId)
    ).toContain('SKF24MP003')
    expect((await getRankSnapshotsLive()).map((entry) => entry.athleteId)).toContain(
      'ath_inactive'
    )
  })

  it('no longer filters ranking snapshots by portal status', () => {
    const ranked = getRankedAthletes(athletes as never, [], {
      currentDate: new Date('2026-05-10'),
    })

    // Portal status no longer filters rankings; the isPublic privacy switch is
    // applied by the public pages that consume these snapshots.
    expect(ranked.map((entry) => entry.athleteId)).toContain('ath_inactive')
  })
})
