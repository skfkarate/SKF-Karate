import { NextResponse } from 'next/server'
import { getEventByIdAdminLive, updateEventRecordLive } from '@/lib/server/repositories/events-live'
import {
  syncStandaloneEventResultsToAthletes,
  syncTournamentResultsToAthletes,
} from '@/lib/server/event-athlete-sync'
import {
  revalidateEventSitePaths,
  revalidateTournamentSitePaths,
} from '@/lib/server/revalidation'
import { NotFoundError, ValidationError } from '@/src/server/lib/errors'
import { withRoute } from '@/src/server/lib/route'

export const POST = withRoute(
  { auth: { type: 'admin', roles: ['admin', 'instructor'] }, rateLimit: { tier: 'write' } },
  async ({ params }) => {
    const { id } = params
    
    const event = await getEventByIdAdminLive(id)
    if (!event) {
      throw new NotFoundError('Event')
    }

    if (!event.results || event.results.length === 0) {
      throw new ValidationError({ results: ['No results recorded to publish.'] })
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
  }
)
