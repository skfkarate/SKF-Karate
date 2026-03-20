import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { createAthlete } from '@/lib/data/athletes'
import { createErrorResponse, readJsonBody } from '@/lib/server/api'
import { validateAthletePayload } from '@/lib/server/validation'

function isAdmin(session) {
  return session?.user?.role === 'admin'
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!isAdmin(session)) {
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
