import { beforeEach, describe, expect, it, vi } from 'vitest'

const athleteRepositoryMocks = vi.hoisted(() => ({
  getAllAthletesLive: vi.fn(),
  getAthleteBySkfIdLive: vi.fn(),
}))

const analyticsMocks = vi.hoisted(() => ({
  recordSiteAnalyticsEvent: vi.fn(),
}))

vi.mock('@/lib/server/repositories/athletes-live', () => ({
  getAllAthletesLive: athleteRepositoryMocks.getAllAthletesLive,
  getAthleteBySkfIdLive: athleteRepositoryMocks.getAthleteBySkfIdLive,
}))

vi.mock('@/lib/server/site-analytics', () => ({
  recordSiteAnalyticsEvent: analyticsMocks.recordSiteAnalyticsEvent,
}))

import { verifyJWT } from '@/lib/server/auth/portal'
import { PortalAuthService } from '@/src/server/services/portal-auth.service'

type AthleteFixture = {
  skfId: string
  firstName: string
  lastName?: string
  phone?: string
  email?: string
  status?: string
  branchName?: string
  batch?: string
  currentBelt?: string
  photoUrl?: string
}

function athlete(overrides: AthleteFixture) {
  return {
    id: overrides.skfId.toLowerCase(),
    skfId: overrides.skfId,
    firstName: overrides.firstName,
    lastName: overrides.lastName || '',
    phone: overrides.phone || '',
    email: overrides.email || '',
    status: overrides.status || 'active',
    branchName: overrides.branchName || 'M P Sports Club',
    batch: overrides.batch || '5:00 PM - 6:30 PM',
    currentBelt: overrides.currentBelt || 'white',
    photoUrl: overrides.photoUrl || '',
  }
}

describe('portal profile auto-discovery switcher', () => {
  beforeEach(() => {
    const athletes = [
      athlete({
        skfId: 'SKF26MP001',
        firstName: 'Asha',
        lastName: 'Kumar',
        phone: '9876543210',
        email: 'parent@example.com',
      }),
      athlete({
        skfId: 'SKF26MP002',
        firstName: 'Mira',
        lastName: 'Kumar',
        phone: '+91 98765 43210',
        email: '',
        currentBelt: 'yellow',
      }),
      athlete({
        skfId: 'SKF26HE001',
        firstName: 'Rohan',
        lastName: 'Kumar',
        phone: '',
        email: 'PARENT@example.com',
        branchName: 'Herohalli',
      }),
      athlete({
        skfId: 'SKF26MP003',
        firstName: 'Inactive',
        phone: '9876543210',
        status: 'inactive',
      }),
      athlete({
        skfId: 'SKF26MP004',
        firstName: 'Other',
        phone: '9000000000',
        email: 'other@example.com',
      }),
    ]

    athleteRepositoryMocks.getAllAthletesLive.mockResolvedValue(athletes)
    athleteRepositoryMocks.getAthleteBySkfIdLive.mockImplementation(async (skfId: string) => {
      return athletes.find((item) => item.skfId === skfId) || null
    })
    analyticsMocks.recordSiteAnalyticsEvent.mockResolvedValue(undefined)
  })

  it('auto-discovers active family profiles from normalized guardian phone', async () => {
    const siblings = await PortalAuthService.getSiblings('SKF26MP001', null)

    expect(siblings.map((sibling) => sibling.skfId)).toEqual(['SKF26MP002'])
    expect(siblings[0]).toEqual(
      expect.objectContaining({
        skfId: 'SKF26MP002',
        name: 'Mira Kumar',
        currentBelt: 'yellow',
      })
    )
  })

  it('does not authorize profile discovery through email alone', async () => {
    const siblings = await PortalAuthService.getSiblings('SKF26MP001', null)

    expect(siblings.map((sibling) => sibling.skfId)).not.toContain('SKF26HE001')
  })

  it('switches only to an auto-discovered profile and signs the new portal session', async () => {
    const result = await PortalAuthService.switchProfile('SKF26MP002', 'SKF26MP001', null, {
      referrer: '/portal/events',
      userAgent: 'vitest',
      ipAddress: '127.0.0.1',
    })

    const token = result.cookie.match(/skf_portal_token=([^;]+)/)?.[1]
    const session = token ? verifyJWT(token) : null

    expect(session).toEqual(
      expect.objectContaining({
        skfId: 'SKF26MP002',
        role: 'student',
        name: 'Mira',
        parentPhone: '+91 98765 43210',
      })
    )
    expect(analyticsMocks.recordSiteAnalyticsEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'portal_login_success',
        path: '/api/auth/portal/switch',
        skfId: 'SKF26MP002',
        metadata: { switch_from: 'SKF26MP001' },
      })
    )
  })

  it('rejects switching to a profile outside the discovered family group', async () => {
    await expect(
      PortalAuthService.switchProfile('SKF26MP004', 'SKF26MP001', null, {
        referrer: '/portal/events',
        userAgent: 'vitest',
        ipAddress: '127.0.0.1',
      })
    ).rejects.toThrow('Unauthorized to switch to this profile.')

    expect(analyticsMocks.recordSiteAnalyticsEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'portal_login_failed',
        path: '/api/auth/portal/switch',
        metadata: expect.objectContaining({
          reason: 'unauthorized-sibling-switch',
          target: 'SKF26MP004',
        }),
      })
    )
  })
})
