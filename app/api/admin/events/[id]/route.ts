import { NextResponse } from 'next/server'
import {
  deleteEventRecordLive,
  getEventByIdAdminLive,
  updateEventRecordLive,
} from '@/lib/server/repositories/events-live'
import { clearSyncedEventArtifactsFromAthletes } from '@/lib/server/event-athlete-sync'
import {
  validateEventPayload,
  validateTournamentPayload,
} from '@/lib/server/validation'
import {
  revalidateEventSitePaths,
  revalidateTournamentSitePaths,
} from '@/lib/server/revalidation'
import { looseObjectSchema } from '@/src/server/api/validators/admin-general.validator'
import { NotFoundError } from '@/src/server/lib/errors'
import { withRoute } from '@/src/server/lib/route'

export const PUT = withRoute(
  {
    auth: { type: 'admin', roles: ['admin', 'instructor'] },
    bodySchema: looseObjectSchema,
    rateLimit: { tier: 'write' },
  },
  async ({ body, params }) => {
    const { id } = params
    const existing = await getEventByIdAdminLive(id)
    if (!existing) {
      throw new NotFoundError('Event')
    }

    const payload =
      existing.type === 'tournament'
        ? validateTournamentPayload({ ...existing, ...body, id })
        : validateEventPayload({ ...existing, ...body, id })
    
    const updated = await updateEventRecordLive(id, payload)
    if (!updated) {
      throw new NotFoundError('Event')
    }

    if (
      existing &&
      Object.prototype.hasOwnProperty.call(body, 'isResultsPublished') &&
      body.isResultsPublished === false
    ) {
      await clearSyncedEventArtifactsFromAthletes(existing.id)
    }

    if (updated.type === 'tournament') {
      revalidateTournamentSitePaths(updated)
    } else {
      revalidateEventSitePaths(updated)
    }

    return NextResponse.json({ success: true, event: updated })
  }
)

export const DELETE = withRoute(
  { auth: { type: 'admin', roles: ['admin', 'instructor'] }, rateLimit: { tier: 'write' } },
  async ({ params }) => {
    const { id } = params
    const existing = await getEventByIdAdminLive(id)

    const deleted = await deleteEventRecordLive(id)
    if (!deleted) {
      throw new NotFoundError('Event')
    }

    if (existing) {
      await clearSyncedEventArtifactsFromAthletes(existing.id)
    }

    if (existing?.type === 'tournament') {
      revalidateTournamentSitePaths(existing || { id })
    } else {
      revalidateEventSitePaths(existing || { id })
    }

    return NextResponse.json({ success: true })
  }
)

export const PATCH = PUT
