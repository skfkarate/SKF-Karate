import { NextRequest, NextResponse } from 'next/server'
import { getAthleteByIdLive, updateAthleteLive } from '@/lib/server/repositories/athletes-live'
import { createErrorResponse, readJsonBody } from '@/lib/server/api'
import { validateAthletePayload } from '@/lib/server/validation'
import { getAuthorizedApiSession } from '@/lib/server/auth/session'
import { revalidateAthleteSitePaths } from '@/lib/server/revalidation'

export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  try {
    const session = await getAuthorizedApiSession('admin')
    if (!session) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = params
    const existingAthlete = await getAthleteByIdLive(id)

    if (!existingAthlete) {
      return NextResponse.json({ error: 'Athlete not found' }, { status: 404 })
    }

    const payload = await readJsonBody(request)
    const athlete = await updateAthleteLive(
      id,
      validateAthletePayload({ ...existingAthlete, ...payload })
    )

    revalidateAthleteSitePaths(athlete.registrationNumber)

    return NextResponse.json({ athlete })
  } catch (error) {
    return createErrorResponse(error, 'Unable to update the athlete record.')
  }
}
