import { NextResponse } from 'next/server'
import { getAthleteByIdLive, updateAthleteLive } from '@/lib/server/repositories/athletes-live'
import { validateAthletePayload } from '@/lib/server/validation'
import { revalidateAthleteSitePaths } from '@/lib/server/revalidation'
import { looseObjectSchema } from '@/src/server/api/validators/admin-general.validator'
import { NotFoundError } from '@/src/server/lib/errors'
import { withRoute } from '@/src/server/lib/route'

export const PATCH = withRoute(
  {
    auth: { type: 'admin', roles: ['admin'] },
    bodySchema: looseObjectSchema,
    rateLimit: { tier: 'write' },
  },
  async ({ body, params }) => {
    const { id } = params
    const existingAthlete = await getAthleteByIdLive(id)

    if (!existingAthlete) {
      throw new NotFoundError('Athlete')
    }

    const athlete = await updateAthleteLive(
      id,
      validateAthletePayload({ ...existingAthlete, ...body })
    )

    revalidateAthleteSitePaths(athlete.skfId)

    return NextResponse.json({ athlete })
  }
)
