import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { deleteTournament, getTournamentById, updateTournament } from '@/lib/data/tournaments'
import { createErrorResponse, readJsonBody } from '@/lib/server/api'
import { validateTournamentPayload } from '@/lib/server/validation'
import { getAuthorizedApiSession } from '@/lib/server/auth/session'

function revalidateTournamentPaths(tournament, id) {
  revalidatePath('/admin/results')
  revalidatePath('/results')
  revalidatePath('/')
  revalidatePath(`/admin/results/${id}/edit`)
  if (tournament?.slug) {
    revalidatePath(`/results/${tournament.slug}`)
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getAuthorizedApiSession('admin')
    if (!session) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const existingTournament = getTournamentById(id)

    if (!existingTournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    const payload = await readJsonBody(request)
    const tournament = updateTournament(
      id,
      validateTournamentPayload({ ...existingTournament, ...payload })
    )

    revalidateTournamentPaths(tournament, id)
    return NextResponse.json({ tournament })
  } catch (error) {
    return createErrorResponse(error, 'Unable to update the tournament.')
  }
}

export async function DELETE(_request, { params }) {
  try {
    const session = await getAuthorizedApiSession('admin')
    if (!session) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const deleted = deleteTournament(id)

    if (!deleted) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    revalidatePath('/admin/results')
    revalidatePath('/results')
    revalidatePath('/')

    return NextResponse.json({ success: true })
  } catch (error) {
    return createErrorResponse(error, 'Unable to delete the tournament.')
  }
}
