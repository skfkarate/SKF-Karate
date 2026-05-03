import { createJWT, buildPortalCookie } from '@/lib/server/auth/portal'
import { getAthleteBySkfIdLive } from '@/lib/server/repositories/athletes-live'
import { recordSiteAnalyticsEvent } from '@/lib/server/site-analytics'
import type { PortalAuthInput } from '@/src/server/api/validators/portal.validator'
import { AuthenticationError, ValidationError } from '@/src/server/lib/errors'

function normaliseDob(input: string) {
  const parts = input.split(/[-/\s.]+/).filter(Boolean)

  if (parts.length !== 3) {
    throw new ValidationError({ dob: ['Invalid date format. Use DD/MM/YYYY or DD-MM-YYYY.'] })
  }

  const [day, month, year] = parts
  return `${year}-${month?.padStart(2, '0')}-${day?.padStart(2, '0')}`
}

export class PortalAuthService {
  static async authenticate(
    input: PortalAuthInput,
    requestMeta: {
      referrer: string | null
      userAgent: string | null
      ipAddress: string | null
    }
  ) {
    const normalizedId = input.skfId.trim().toUpperCase()
    const normalizedDob = normaliseDob(input.dob)

    const athlete = await getAthleteBySkfIdLive(normalizedId)

    if (!athlete) {
      await recordSiteAnalyticsEvent({
        eventType: 'portal_login_failed',
        path: '/portal/login',
        pageTitle: 'Athlete Portal Login',
        referrer: requestMeta.referrer,
        metadata: { reason: 'invalid-credentials' },
        userAgent: requestMeta.userAgent,
        ipAddress: requestMeta.ipAddress,
      })
      throw new AuthenticationError('Invalid SKF ID or date of birth.')
    }

    if (athlete.dateOfBirth !== normalizedDob) {
      await recordSiteAnalyticsEvent({
        eventType: 'portal_login_failed',
        path: '/portal/login',
        pageTitle: 'Athlete Portal Login',
        referrer: requestMeta.referrer,
        metadata: { reason: 'invalid-credentials' },
        userAgent: requestMeta.userAgent,
        ipAddress: requestMeta.ipAddress,
      })

      throw new AuthenticationError('Invalid SKF ID or date of birth.')
    }

    const token = createJWT({
      skfId: normalizedId,
      role: 'student',
      branch: athlete.branchName || null,
      batch: athlete.batch || null,
      belt: athlete.currentBelt || null,
      name: athlete.firstName || '',
      parentPhone: athlete.phone || null,
    })

    await recordSiteAnalyticsEvent({
      eventType: 'portal_login_success',
      path: '/portal/login',
      pageTitle: 'Athlete Portal Login',
      referrer: requestMeta.referrer,
      skfId: normalizedId,
      metadata: {
        branch: athlete.branchName || null,
        batch: athlete.batch || null,
        belt: athlete.currentBelt || null,
      },
      userAgent: requestMeta.userAgent,
      ipAddress: requestMeta.ipAddress,
    })

    return {
      cookie: buildPortalCookie(token),
    }
  }
}
