import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createTournament } from '@/lib/data/tournaments'
import { createErrorResponse, readJsonBody } from '@/lib/server/api'
import { validateTournamentPayload } from '@/lib/server/validation'
import { getAuthorizedApiSession } from '@/lib/server/auth/session'

function revalidateTournamentPaths(tournament: any) {
  revalidatePath('/admin/results')
  revalidatePath('/results')
  revalidatePath('/')
  if (tournament?.id) {
    revalidatePath(`/admin/results/${tournament.id}/edit`)
  }
  if (tournament?.slug) {
    revalidatePath(`/results/${tournament.slug}`)
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthorizedApiSession('admin')
    if (!session) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const payload = await readJsonBody(request)
    const tournament = createTournament(validateTournamentPayload(payload))

    revalidateTournamentPaths(tournament)

    return NextResponse.json({ tournament }, { status: 201 })
  } catch (error) {
    return createErrorResponse(error, 'Unable to save the tournament.')
  }
}
