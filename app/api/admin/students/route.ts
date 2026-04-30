import { NextResponse } from 'next/server'

import { buildAdminAthleteRecord, buildAthletePayloadFromAdminForm } from '@/lib/admin/athlete-records'
import { createAthleteLive, getAllAthletesLive } from '@/lib/server/repositories/athletes-live'
import { revalidateAthleteSitePaths } from '@/lib/server/revalidation'
import { supabaseAdmin } from '@/lib/server/supabase'
import { validateAthletePayload } from '@/lib/server/validation'
import { createStudentSchema } from '@/lib/validators'
import { logger } from '@/src/server/lib/logger'
import { withRoute } from '@/src/server/lib/route'

export const GET = withRoute(
  { auth: { type: 'admin', roles: ['admin', 'instructor'] }, rateLimit: { tier: 'authed' } },
  async () => {
    const athletes = await getAllAthletesLive()
    return NextResponse.json({ students: athletes.map(buildAdminAthleteRecord) })
  }
)

export const POST = withRoute(
  {
    auth: { type: 'admin', roles: ['admin', 'instructor'] },
    bodySchema: createStudentSchema,
    rateLimit: { tier: 'write' },
  },
  async ({ body: formValues, requestId }) => {
    const athlete = await createAthleteLive(
      validateAthletePayload(buildAthletePayloadFromAdminForm(formValues))
    )

    revalidateAthleteSitePaths(athlete.registrationNumber)

    const { error: authError } = await supabaseAdmin.from('auth_sessions').upsert(
      {
        skf_id: athlete.registrationNumber,
        pin_hash: '',
        failed_attempts: 0,
        locked_until: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'skf_id' }
    )

    if (authError) {
      logger.error('admin.students.auth_session_upsert_failed', {
        requestId,
        skfId: athlete.registrationNumber,
        error: authError,
      })
    }

    return NextResponse.json(
      {
        success: true,
        skfId: athlete.registrationNumber,
        registrationNumber: athlete.registrationNumber,
        athlete,
      },
      { status: 201 }
    )
  }
)
