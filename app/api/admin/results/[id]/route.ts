import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { updateTournament, deleteTournament } from '@/lib/data/tournaments'
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
    
    const tournament = updateTournament(params.id, validateTournamentPayload(updatePayload))

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found.' }, { status: 404 })
    }

    revalidateTournamentPaths(tournament)

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

    const deleted = deleteTournament(params.id)
    
    if (!deleted) {
      return NextResponse.json({ error: 'Tournament not found.' }, { status: 404 })
    }

    revalidatePath('/admin/results')
    revalidatePath('/results')
    revalidatePath('/')

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return createErrorResponse(error, 'Unable to delete the tournament.')
  }
}
