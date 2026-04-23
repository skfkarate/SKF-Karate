import { NextResponse } from 'next/server'
import { createTournamentLive } from '@/lib/server/repositories/tournaments-live'
import { createErrorResponse, readJsonBody } from '@/lib/server/api'
import { validateTournamentPayload } from '@/lib/server/validation'
import { getAuthorizedApiSession } from '@/lib/server/auth/session'
import {
  clearSyncedEventArtifactsFromAthletes,
  syncTournamentResultsToAthletes,
} from '@/lib/server/event-athlete-sync'
import { revalidateTournamentSitePaths } from '@/lib/server/revalidation'

export async function POST(request: Request) {
  try {
    const session = await getAuthorizedApiSession('admin')
    if (!session) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const payload = await readJsonBody(request)
    const tournament = await createTournamentLive(validateTournamentPayload(payload))

    if (tournament.isPublished) {
      await syncTournamentResultsToAthletes({
        ...tournament,
        type: 'tournament',
      })
    } else {
      await clearSyncedEventArtifactsFromAthletes(tournament.id)
    }

    revalidateTournamentSitePaths(tournament)

    return NextResponse.json({ tournament }, { status: 201 })
  } catch (error) {
    return createErrorResponse(error, 'Unable to save the tournament.')
  }
}
