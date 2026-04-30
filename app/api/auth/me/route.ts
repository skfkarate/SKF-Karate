import { NextResponse } from 'next/server'
import { getPortalSession } from '@/lib/server/auth/portal'
import { getAthleteByRegistrationNumberLive } from '@/lib/server/repositories/athletes-live'
import { logger } from '@/src/server/lib/logger'
import { withRoute } from '@/src/server/lib/route'

export const GET = withRoute(
  { rateLimit: { tier: 'public' }, cacheControl: 'private, no-store' },
  async ({ request, requestId }) => {
    try {
        const session = getPortalSession(request)
        if (!session || !session.skfId) {
            return NextResponse.json({ authenticated: false }, { status: 200 })
        }

        const athlete = await getAthleteByRegistrationNumberLive(session.skfId)

        if (!athlete) {
            return NextResponse.json({ authenticated: false }, { status: 200 })
        }

        return NextResponse.json({
            authenticated: true,
            user: {
                skfId: session.skfId,
                name: athlete.firstName + (athlete.lastName ? ` ${athlete.lastName}` : ''),
                phone: athlete.phone || '+91',
                branch: athlete.branchName || 'SKF HQ',
                belt: athlete.currentBelt || 'White'
            }
        })

    } catch (e: unknown) {
        logger.error('auth.me.failed', { requestId, error: e })
        return NextResponse.json({ authenticated: false }, { status: 200 })
    }
  }
)
