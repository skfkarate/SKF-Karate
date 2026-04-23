import { NextResponse } from 'next/server'
import {
  deleteEventRecordLive,
  getEventByIdAdminLive,
  updateEventRecordLive,
} from '@/lib/server/repositories/events-live'
import { clearSyncedEventArtifactsFromAthletes } from '@/lib/server/event-athlete-sync'
import { getAuthorizedApiSession } from '@/lib/server/auth/session'
import {
  createErrorResponse,
  readJsonBody,
} from '@/lib/server/api'
import {
  validateEventPayload,
  validateTournamentPayload,
} from '@/lib/server/validation'
import {
  revalidateEventSitePaths,
  revalidateTournamentSitePaths,
} from '@/lib/server/revalidation'

export async function PUT(request: Request, context: { params: any }) {
  try {
    const session = await getAuthorizedApiSession(['admin', 'instructor'])
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await Promise.resolve(context.params)
    const { id } = params
    const existing = await getEventByIdAdminLive(id)
    if (!existing) {
       return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const body = await readJsonBody(request)
    const payload =
      existing.type === 'tournament'
        ? validateTournamentPayload({ ...existing, ...body, id })
        : validateEventPayload({ ...existing, ...body, id })
    
    const updated = await updateEventRecordLive(id, payload)
    if (!updated) {
       return NextResponse.json({ error: 'Event not found' }, { status: 404 })
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
  } catch (error) {
    return createErrorResponse(error, 'Unable to update the event.')
  }
}

export async function DELETE(request: Request, context: { params: any }) {
  try {
    const session = await getAuthorizedApiSession(['admin', 'instructor'])
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await Promise.resolve(context.params)
    const { id } = params
    const existing = await getEventByIdAdminLive(id)

    const deleted = await deleteEventRecordLive(id)
    if (!deleted) {
       return NextResponse.json({ error: 'Event not found' }, { status: 404 })
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
  } catch (error) {
    return createErrorResponse(error, 'Unable to delete the event.')
  }
}

export const PATCH = PUT
