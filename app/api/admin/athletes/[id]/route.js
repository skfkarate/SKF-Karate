import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getAthleteById, updateAthlete } from '@/lib/data/athletes'
import { createErrorResponse, readJsonBody } from '@/lib/server/api'
import { validateAthletePayload } from '@/lib/server/validation'
import { getAuthorizedApiSession } from '@/lib/server/auth/session'

export async function PATCH(request, { params }) {
  try {
    const session = await getAuthorizedApiSession('admin')
    if (!session) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const existingAthlete = getAthleteById(id)

    if (!existingAthlete) {
      return NextResponse.json({ error: 'Athlete not found' }, { status: 404 })
    }

    const payload = await readJsonBody(request)
    const athlete = updateAthlete(id, validateAthletePayload({ ...existingAthlete, ...payload }))

    revalidatePath('/admin/students')
    revalidatePath(`/admin/students/${id}/edit`)
    revalidatePath('/athlete')
    revalidatePath(`/athlete/${athlete.registrationNumber}`)

    return NextResponse.json({ athlete })
  } catch (error) {
    return createErrorResponse(error, 'Unable to update the athlete record.')
  }
}
