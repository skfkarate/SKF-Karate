import { NextResponse } from 'next/server'
import { createTournamentLive } from '@/lib/server/repositories/tournaments-live'
import { validateTournamentPayload } from '@/lib/server/validation'
import {
  clearSyncedEventArtifactsFromAthletes,
  syncTournamentResultsToAthletes,
} from '@/lib/server/event-athlete-sync'
import { revalidateTournamentSitePaths } from '@/lib/server/revalidation'
import { looseObjectSchema } from '@/src/server/api/validators/admin-general.validator'
import { withRoute } from '@/src/server/lib/route'

export const POST = withRoute(
  {
    auth: { type: 'admin', roles: ['admin'] },
    bodySchema: looseObjectSchema,
    rateLimit: { tier: 'write' },
  },
  async ({ body }) => {
    const tournament = await createTournamentLive(validateTournamentPayload(body))

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
  }
)
