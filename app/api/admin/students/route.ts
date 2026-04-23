import { NextResponse } from 'next/server'

import { buildAdminAthleteRecord, buildAthletePayloadFromAdminForm } from '@/lib/admin/athlete-records'
import { createErrorResponse, readJsonBody } from '@/lib/server/api'
import { getAuthorizedApiSession } from '@/lib/server/auth/session'
import { createAthleteLive, getAllAthletesLive } from '@/lib/server/repositories/athletes-live'
import { revalidateAthleteSitePaths } from '@/lib/server/revalidation'
import { supabaseAdmin } from '@/lib/server/supabase'
import { validateAthletePayload } from '@/lib/server/validation'
import { createStudentSchema } from '@/lib/validators'

export async function GET() {
  try {
    const session = await getAuthorizedApiSession(['admin', 'instructor'])
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const athletes = await getAllAthletesLive()
    return NextResponse.json({ students: athletes.map(buildAdminAthleteRecord) })
  } catch (error) {
    return createErrorResponse(error, 'Unable to fetch athlete profiles.')
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthorizedApiSession(['admin', 'instructor'])
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await readJsonBody(request)
    const formValues = createStudentSchema.parse(payload)
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
      console.error('Supabase auth session upsert failed:', authError)
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
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    return createErrorResponse(error, 'Unable to create the athlete profile.')
  }
}
