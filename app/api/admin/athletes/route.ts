import { NextResponse } from 'next/server'
import { createAthleteLive } from '@/lib/server/repositories/athletes-live'
import { validateAthletePayload } from '@/lib/server/validation'
import { revalidateAthleteSitePaths } from '@/lib/server/revalidation'
import { looseObjectSchema } from '@/src/server/api/validators/admin-general.validator'
import { withRoute } from '@/src/server/lib/route'

export const POST = withRoute(
  {
    auth: { type: 'admin', roles: ['admin'] },
    bodySchema: looseObjectSchema,
    rateLimit: { tier: 'write' },
  },
  async ({ body }) => {
    const athlete = await createAthleteLive(validateAthletePayload(body))

    revalidateAthleteSitePaths(athlete.registrationNumber)

    return NextResponse.json({ athlete }, { status: 201 })
  }
)
