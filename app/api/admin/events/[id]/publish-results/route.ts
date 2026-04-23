import { NextResponse } from 'next/server'
import { getEventByIdAdminLive, updateEventRecordLive } from '@/lib/server/repositories/events-live'
import { getAuthorizedApiSession } from '@/lib/server/auth/session'
import { createErrorResponse } from '@/lib/server/api'
import {
  syncStandaloneEventResultsToAthletes,
  syncTournamentResultsToAthletes,
} from '@/lib/server/event-athlete-sync'
import {
  revalidateEventSitePaths,
  revalidateTournamentSitePaths,
} from '@/lib/server/revalidation'

export async function POST(request: Request, context: { params: any }) {
  try {
    const session = await getAuthorizedApiSession(['admin', 'instructor'])
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await Promise.resolve(context.params)
    const { id } = params
    
    const event = await getEventByIdAdminLive(id)
    if (!event) {
       return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (!event.results || event.results.length === 0) {
      return NextResponse.json({ error: 'No results recorded to publish.' }, { status: 400 })
    }

    const syncSummary =
      event.type === 'tournament'
        ? await syncTournamentResultsToAthletes(event)
        : await syncStandaloneEventResultsToAthletes(event)

    // Mark Event Results as Published
    const updatedEvent = await updateEventRecordLive(id, {
      resultsAppliedAt: new Date().toISOString(),
      isResultsPublished: true
    })

    if (event.type === 'tournament') {
      revalidateTournamentSitePaths(updatedEvent || { id, slug: event.slug })
    } else {
      revalidateEventSitePaths(updatedEvent || { id, slug: event.slug, type: event.type })
    }

    return NextResponse.json({ success: true, event: updatedEvent, syncSummary })
  } catch (error) {
    return createErrorResponse(error, 'Unable to publish event results.')
  }
}
