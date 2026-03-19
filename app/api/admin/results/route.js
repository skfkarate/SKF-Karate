import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { createTournament } from '@/lib/data/tournaments'
import { createErrorResponse, readJsonBody } from '@/lib/server/api'
import { validateTournamentPayload } from '@/lib/server/validation'

function isAdmin(session) {
  return session?.user?.role === 'admin'
}

function revalidateTournamentPaths(tournament) {
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

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!isAdmin(session)) {
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
