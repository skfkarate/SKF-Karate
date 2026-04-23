import { NextResponse } from 'next/server'
import {
  deleteTournamentLive,
  getTournamentByIdLive,
  updateTournamentLive,
} from '@/lib/server/repositories/tournaments-live'
import { createErrorResponse, readJsonBody } from '@/lib/server/api'
import { validateTournamentPayload } from '@/lib/server/validation'
import { getAuthorizedApiSession } from '@/lib/server/auth/session'
import {
  clearSyncedEventArtifactsFromAthletes,
  syncTournamentResultsToAthletes,
} from '@/lib/server/event-athlete-sync'
import { revalidateTournamentSitePaths } from '@/lib/server/revalidation'

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getAuthorizedApiSession('admin')
    if (!session) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const payload = await readJsonBody(request)
    // Add the ID from URL to payload for updating
    const updatePayload = { ...payload, id: params.id }
    
    const tournament = await updateTournamentLive(
      params.id,
      validateTournamentPayload(updatePayload)
    )

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found.' }, { status: 404 })
    }

    if (tournament.isPublished) {
      await syncTournamentResultsToAthletes({
        ...tournament,
        type: 'tournament',
      })
    } else {
      await clearSyncedEventArtifactsFromAthletes(tournament.id)
    }

    revalidateTournamentSitePaths(tournament)

    return NextResponse.json({ tournament })
  } catch (error) {
    return createErrorResponse(error, 'Unable to update the tournament.')
  }
}

export async function DELETE(_request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await getAuthorizedApiSession('admin')
    if (!session) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const existing = await getTournamentByIdLive(params.id)
    const deleted = await deleteTournamentLive(params.id)
    
    if (!deleted) {
      return NextResponse.json({ error: 'Tournament not found.' }, { status: 404 })
    }

    if (existing) {
      await clearSyncedEventArtifactsFromAthletes(existing.id)
    }

    revalidateTournamentSitePaths(existing || { id: params.id })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return createErrorResponse(error, 'Unable to delete the tournament.')
  }
}

export const PATCH = PUT
