import { NextResponse } from 'next/server'
import { createEventRecordLive, getAllEventsAdminLive } from '@/lib/server/repositories/events-live'
import {
  validateEventPayload,
  validateTournamentPayload,
} from '@/lib/server/validation'
import {
  revalidateEventSitePaths,
  revalidateTournamentSitePaths,
} from '@/lib/server/revalidation'
import { looseObjectSchema } from '@/src/server/api/validators/admin-general.validator'
import { withRoute } from '@/src/server/lib/route'

export const GET = withRoute(
  { auth: { type: 'admin', roles: ['admin', 'instructor'] }, rateLimit: { tier: 'authed' } },
  async () => {
    const events = await getAllEventsAdminLive()
    return NextResponse.json({ events })
  }
)

export const POST = withRoute(
  {
    auth: { type: 'admin', roles: ['admin', 'instructor'] },
    bodySchema: looseObjectSchema,
    rateLimit: { tier: 'write' },
  },
  async ({ body }) => {
    const payload =
      body?.type === 'tournament'
        ? { ...validateTournamentPayload(body), type: 'tournament' }
        : validateEventPayload(body)
    const newEvent = await createEventRecordLive(payload)

    if (newEvent.type === 'tournament') {
      revalidateTournamentSitePaths(newEvent)
    } else {
      revalidateEventSitePaths(newEvent)
    }

    return NextResponse.json({ success: true, event: newEvent }, { status: 201 })
  }
)
