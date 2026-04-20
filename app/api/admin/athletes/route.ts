import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createAthlete } from '@/lib/server/repositories/athletes'
import { createErrorResponse, readJsonBody } from '@/lib/server/api'
import { validateAthletePayload } from '@/lib/server/validation'
import { getAuthorizedApiSession } from '@/lib/server/auth/session'

export async function POST(request) {
  try {
    const session = await getAuthorizedApiSession('admin')
    if (!session) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const payload = await readJsonBody(request)
    const athlete = createAthlete(validateAthletePayload(payload))

    revalidatePath('/admin/students')
    revalidatePath(`/admin/students/${athlete.id}/edit`)
    revalidatePath('/athlete')
    revalidatePath(`/athlete/${athlete.registrationNumber}`)

    return NextResponse.json({ athlete }, { status: 201 })
  } catch (error) {
    return createErrorResponse(error, 'Unable to save the athlete record.')
  }
}
