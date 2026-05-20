import { NextResponse } from 'next/server'

import { buildAdminAthleteRecord, buildAthletePayloadFromAdminForm } from '@/lib/admin/athlete-records'
import { createAthleteLive, getAllAthletesLive } from '@/lib/server/repositories/athletes-live'
import { revalidateAthleteSitePaths } from '@/lib/server/revalidation'
import { isSupabaseReady, supabaseAdmin } from '@/lib/server/supabase'
import { validateAthletePayload } from '@/lib/server/validation'
import { createStudentSchema } from '@/lib/validators'
import { logger } from '@/src/server/lib/logger'
import { withRoute } from '@/src/server/lib/route'
import { FeeOperationsService } from '@/src/server/services/fee-operations.service'

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
  async ({ adminSession, body: formValues, requestId }) => {
    const athlete = await createAthleteLive(
      validateAthletePayload(buildAthletePayloadFromAdminForm(formValues))
    )

    revalidateAthleteSitePaths(athlete.skfId)

    const { error: authError } = await supabaseAdmin.from('auth_sessions').upsert(
      {
        skf_id: athlete.skfId,
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
        skfId: athlete.skfId,
        error: authError,
      })
    }

    if (isSupabaseReady()) {
      try {
        await FeeOperationsService.syncStudent(adminSession!, athlete.skfId, new Date().getFullYear())
      } catch (syncError) {
        logger.error('admin.students.fee_sync_failed', {
          requestId,
          skfId: athlete.skfId,
          error: syncError,
        })
      }
    }

    return NextResponse.json(
      {
        success: true,
        skfId: athlete.skfId,
        athlete,
      },
      { status: 201 }
    )
  }
)
