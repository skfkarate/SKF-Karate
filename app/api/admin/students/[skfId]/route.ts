import { NextResponse } from 'next/server'

import {
  buildAthleteAdminFormDefaults,
  buildAthletePayloadFromAdminForm,
} from '@/lib/admin/athlete-records'
import {
  getAthleteBySkfIdLive,
  updateAthleteLive,
} from '@/lib/server/repositories/athletes-live'
import { revalidateAthleteSitePaths } from '@/lib/server/revalidation'
import { validateAthletePayload } from '@/lib/server/validation'
import { editStudentSchema } from '@/lib/validators'
import { normaliseSkfId } from '@/lib/utils/registration'
import { adminDeleteConfirmBodySchema } from '@/src/server/api/validators/admin-general.validator'
import { NotFoundError } from '@/src/server/lib/errors'
import { withRoute } from '@/src/server/lib/route'

export const PUT = withRoute(
  {
    auth: { type: 'admin', roles: ['admin', 'instructor'] },
    bodySchema: editStudentSchema,
    rateLimit: { tier: 'write' },
  },
  async ({ body: partialFormValues, params }) => {
    const { skfId: rawSkfId } = params
    const skfId = normaliseSkfId(rawSkfId)
    const existingAthlete = await getAthleteBySkfIdLive(skfId)

    if (!existingAthlete) {
      throw new NotFoundError('Athlete')
    }

    const mergedFormValues = {
      ...buildAthleteAdminFormDefaults(existingAthlete),
      ...partialFormValues,
      skfId: existingAthlete.skfId,
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
      throw new NotFoundError('Athlete')
    }

    revalidateAthleteSitePaths(existingAthlete.skfId)
    revalidateAthleteSitePaths(athlete.skfId)

    return NextResponse.json({ success: true, athlete })
  }
)

export const DELETE = withRoute(
  {
    auth: { type: 'admin', roles: ['admin', 'instructor'] },
    bodySchema: adminDeleteConfirmBodySchema,
    rateLimit: { tier: 'write' },
  },
  async ({ params }) => {
    const { skfId: rawSkfId } = params
    const skfId = normaliseSkfId(rawSkfId)
    const existingAthlete = await getAthleteBySkfIdLive(skfId)

    if (!existingAthlete) {
      throw new NotFoundError('Athlete')
    }

    const athlete = await updateAthleteLive(existingAthlete.id, {
      ...existingAthlete,
      status: 'inactive',
    })

    if (!athlete) {
      throw new NotFoundError('Athlete')
    }

    revalidateAthleteSitePaths(athlete.skfId)
    return NextResponse.json({ success: true, athlete })
  }
)
