import { NextResponse } from 'next/server'

import {
  buildAthleteAdminFormDefaults,
  buildAthletePayloadFromAdminForm,
} from '@/lib/admin/athlete-records'
import { createErrorResponse, readJsonBody } from '@/lib/server/api'
import { getAuthorizedApiSession } from '@/lib/server/auth/session'
import {
  getAthleteByRegistrationNumberLive,
  updateAthleteLive,
} from '@/lib/server/repositories/athletes-live'
import { revalidateAthleteSitePaths } from '@/lib/server/revalidation'
import { validateAthletePayload } from '@/lib/server/validation'
import { editStudentSchema } from '@/lib/validators'
import { normaliseRegistrationNumber } from '@/lib/utils/registration'

export async function PUT(request: Request, props: { params: Promise<{ skfId: string }> }) {
  try {
    const session = await getAuthorizedApiSession(['admin', 'instructor'])
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { skfId } = await props.params
    const registrationNumber = normaliseRegistrationNumber(skfId)
    const existingAthlete = await getAthleteByRegistrationNumberLive(registrationNumber)

    if (!existingAthlete) {
      return NextResponse.json({ error: 'Athlete not found.' }, { status: 404 })
    }

    const requestBody = await readJsonBody(request)
    const partialFormValues = editStudentSchema.parse(requestBody)
    const mergedFormValues = {
      ...buildAthleteAdminFormDefaults(existingAthlete),
      ...partialFormValues,
      skfId: existingAthlete.registrationNumber,
      registrationNumber: existingAthlete.registrationNumber,
    }

    const athlete = await updateAthleteLive(
      existingAthlete.id,
      validateAthletePayload({
        ...existingAthlete,
        ...buildAthletePayloadFromAdminForm(mergedFormValues),
        achievements: existingAthlete.achievements || [],
        pointsHistory: existingAthlete.pointsHistory || [],
        pointsBalance: existingAthlete.pointsBalance || 0,
        pointsLifetime: existingAthlete.pointsLifetime || 0,
      })
    )

    if (!athlete) {
      return NextResponse.json({ error: 'Athlete not found.' }, { status: 404 })
    }

    revalidateAthleteSitePaths(existingAthlete.registrationNumber)
    revalidateAthleteSitePaths(athlete.registrationNumber)

    return NextResponse.json({ success: true, athlete })
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    return createErrorResponse(error, 'Unable to update the athlete profile.')
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ skfId: string }> }) {
  try {
    const session = await getAuthorizedApiSession(['admin', 'instructor'])
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { skfId } = await props.params
    const registrationNumber = normaliseRegistrationNumber(skfId)
    const existingAthlete = await getAthleteByRegistrationNumberLive(registrationNumber)

    if (!existingAthlete) {
      return NextResponse.json({ error: 'Athlete not found.' }, { status: 404 })
    }

    const body = await readJsonBody(request)
    if (!body?.confirm) {
      return NextResponse.json({ error: 'Confirmation required.' }, { status: 400 })
    }

    const athlete = await updateAthleteLive(existingAthlete.id, {
      ...existingAthlete,
      status: 'inactive',
    })

    if (!athlete) {
      return NextResponse.json({ error: 'Athlete not found.' }, { status: 404 })
    }

    revalidateAthleteSitePaths(athlete.registrationNumber)
    return NextResponse.json({ success: true, athlete })
  } catch (error) {
    return createErrorResponse(error, 'Unable to deactivate the athlete profile.')
  }
}
