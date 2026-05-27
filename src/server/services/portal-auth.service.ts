import { createJWT, buildPortalCookie } from '@/lib/server/auth/portal'
import { isEligiblePortalAthlete } from '@/lib/server/auth/portal-athlete'
import { getAthleteBySkfIdLive, getAllAthletesLive } from '@/lib/server/repositories/athletes-live'
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

function normalizeProfilePhone(value?: string | null) {
  const digits = String(value || '').replace(/\D/g, '')
  if (!digits) return ''

  if (digits.length > 10) {
    return digits.slice(-10)
  }

  return digits
}

function athleteDisplayName(athlete: { firstName?: string | null; lastName?: string | null; skfId?: string | null }) {
  return [athlete.firstName, athlete.lastName].filter(Boolean).join(' ').trim() || athlete.skfId || 'SKF Athlete'
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

    if (!isEligiblePortalAthlete(athlete)) {
      await recordSiteAnalyticsEvent({
        eventType: 'portal_login_failed',
        path: '/portal/login',
        pageTitle: 'Athlete Portal Login',
        referrer: requestMeta.referrer,
        skfId: normalizedId,
        metadata: { reason: 'inactive-athlete', status: athlete.status || null },
        userAgent: requestMeta.userAgent,
        ipAddress: requestMeta.ipAddress,
      })

      throw new AuthenticationError('Portal access is not active for this athlete. Please contact your Branch Sensei.')
    }

    const token = createJWT({
      skfId: athlete.skfId || normalizedId,
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

  static async getSiblings(currentSkfId: string, parentPhone: string | null) {
    const allAthletes = await getAllAthletesLive()
    const currentNormalized = currentSkfId.trim().toUpperCase()
    const currentAthlete = allAthletes.find((athlete) => {
      return String(athlete.skfId || '').trim().toUpperCase() === currentNormalized
    })

    const discoveryPhones = new Set(
      [parentPhone, currentAthlete?.phone]
        .map((value) => normalizeProfilePhone(value))
        .filter(Boolean)
    )

    if (discoveryPhones.size === 0) {
      return []
    }

    return allAthletes
      .filter((athlete) => {
        const skfId = String(athlete.skfId || '').trim().toUpperCase()
        if (!skfId || skfId === currentNormalized || !isEligiblePortalAthlete(athlete)) {
          return false
        }

        const phone = normalizeProfilePhone(athlete.phone)

        return Boolean(phone && discoveryPhones.has(phone))
      })
      .sort((a, b) => athleteDisplayName(a).localeCompare(athleteDisplayName(b)))
      .map((athlete) => ({
        skfId: athlete.skfId,
        name: athleteDisplayName(athlete),
        firstName: athlete.firstName,
        lastName: athlete.lastName,
        currentBelt: athlete.currentBelt,
        photoUrl: athlete.photoUrl,
        branchName: athlete.branchName,
      }))
  }

  static async switchProfile(
    targetSkfId: string,
    currentSkfId: string,
    parentPhone: string | null,
    requestMeta: {
      referrer: string | null
      userAgent: string | null
      ipAddress: string | null
    }
  ) {
    const normalizedTarget = targetSkfId.trim().toUpperCase()
    const siblings = await this.getSiblings(currentSkfId, parentPhone)
    
    const isAuthorized = siblings.some(s => s.skfId.trim().toUpperCase() === normalizedTarget)
    if (!isAuthorized) {
      await recordSiteAnalyticsEvent({
        eventType: 'portal_login_failed',
        path: '/api/auth/portal/switch',
        pageTitle: 'Profile Switch',
        referrer: requestMeta.referrer,
        metadata: { reason: 'unauthorized-sibling-switch', target: normalizedTarget },
        userAgent: requestMeta.userAgent,
        ipAddress: requestMeta.ipAddress,
      })
      throw new AuthenticationError('Unauthorized to switch to this profile.')
    }

    const targetAthlete = await getAthleteBySkfIdLive(normalizedTarget)
    if (!isEligiblePortalAthlete(targetAthlete)) {
      throw new AuthenticationError('Athlete not found.')
    }

    const token = createJWT({
      skfId: targetAthlete.skfId || normalizedTarget,
      role: 'student',
      branch: targetAthlete.branchName || null,
      batch: targetAthlete.batch || null,
      belt: targetAthlete.currentBelt || null,
      name: targetAthlete.firstName || '',
      parentPhone: targetAthlete.phone || null,
    })

    await recordSiteAnalyticsEvent({
      eventType: 'portal_login_success',
      path: '/api/auth/portal/switch',
      pageTitle: 'Profile Switch',
      referrer: requestMeta.referrer,
      skfId: normalizedTarget,
      metadata: { switch_from: currentSkfId },
      userAgent: requestMeta.userAgent,
      ipAddress: requestMeta.ipAddress,
    })

    return {
      cookie: buildPortalCookie(token),
    }
  }
}
