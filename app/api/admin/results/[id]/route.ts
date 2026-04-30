import { NextResponse } from 'next/server'
import {
  deleteTournamentLive,
  getTournamentByIdLive,
  updateTournamentLive,
} from '@/lib/server/repositories/tournaments-live'
import { validateTournamentPayload } from '@/lib/server/validation'
import {
  clearSyncedEventArtifactsFromAthletes,
  syncTournamentResultsToAthletes,
} from '@/lib/server/event-athlete-sync'
import { revalidateTournamentSitePaths } from '@/lib/server/revalidation'
import { looseObjectSchema } from '@/src/server/api/validators/admin-general.validator'
import { NotFoundError } from '@/src/server/lib/errors'
import { withRoute } from '@/src/server/lib/route'

export const PUT = withRoute(
  {
    auth: { type: 'admin', roles: ['admin'] },
    bodySchema: looseObjectSchema,
    rateLimit: { tier: 'write' },
  },
  async ({ body: payload, params }) => {
    // Add the ID from URL to payload for updating
    const updatePayload = { ...payload, id: params.id }
    
    const tournament = await updateTournamentLive(
      params.id,
      validateTournamentPayload(updatePayload)
    )

    if (!tournament) {
      throw new NotFoundError('Tournament')
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
  }
)

export const DELETE = withRoute(
  { auth: { type: 'admin', roles: ['admin'] }, rateLimit: { tier: 'write' } },
  async ({ params }) => {
    const existing = await getTournamentByIdLive(params.id)
    const deleted = await deleteTournamentLive(params.id)
    
    if (!deleted) {
      throw new NotFoundError('Tournament')
    }

    if (existing) {
      await clearSyncedEventArtifactsFromAthletes(existing.id)
    }

    revalidateTournamentSitePaths(existing || { id: params.id })

    return new NextResponse(null, { status: 204 })
  }
)

export const PATCH = PUT
