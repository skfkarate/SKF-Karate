import { NextResponse } from 'next/server'
import { supabaseAdmin, isSupabaseReady } from '@/lib/server/supabase'
import { getAthleteByRegistrationNumberLive } from '@/lib/server/repositories/athletes-live'
import { enrollmentCreateSchema } from '@/src/server/api/validators/admin-certificates.validator'
import { NotFoundError } from '@/src/server/lib/errors'
import { logger } from '@/src/server/lib/logger'
import { withRoute } from '@/src/server/lib/route'

export const GET = withRoute(
  { auth: { type: 'admin', roles: ['admin'] }, rateLimit: { tier: 'authed' } },
  async ({ requestId }) => {
    if (!isSupabaseReady()) {
      return NextResponse.json({ error: 'Database missing' }, { status: 503 })
    }

    // 2. Fetch all enrollments joined with programs
    const { data: records, error } = await supabaseAdmin
      .from('enrollments')
      .select(`
        id,
        skf_id,
        status,
        updated_at,
        programs ( id, name, type )
      `)
      .order('updated_at', { ascending: false })

    if (error) throw error

    // 3. Map SKF IDs to Real Names via Google Sheets (in parallel for speed)
    const enrichedEnrollments = await Promise.all(
      records.map(async (rec) => {
        let studentName = 'Unknown Athlete'
        let belt = 'Unknown Belt'
        let branch = 'Unknown Branch'
        
        try {
          const athlete = await getAthleteByRegistrationNumberLive(rec.skf_id)
          if (athlete) {
            studentName = [athlete.firstName, athlete.lastName].filter(Boolean).join(' ').trim() || studentName
            belt = athlete.currentBelt || 'white'
            branch = athlete.branchName || 'Unknown'
          }
        } catch (error) {
          logger.warn('admin.enrollments.athlete_lookup_failed', {
            requestId,
            skfId: rec.skf_id,
            error,
          })
        }

        return {
          id: rec.id,
          skfId: rec.skf_id,
          studentName,
          belt,
          branch,
          programId: (Array.isArray(rec.programs) ? rec.programs[0] : rec.programs)?.id,
          programName: (Array.isArray(rec.programs) ? rec.programs[0] : rec.programs)?.name || 'Unknown Program',
          status: rec.status,
          certUnlocked: rec.status === 'completed',
          date: new Date(rec.updated_at).toLocaleDateString()
        }
      })
    )

    return NextResponse.json({ enrollments: enrichedEnrollments })
  }
)

export const POST = withRoute(
  {
    auth: { type: 'admin', roles: ['admin'] },
    bodySchema: enrollmentCreateSchema,
    rateLimit: { tier: 'write' },
  },
  async ({ body }) => {
    const { skfId, programId, beltLevel, completionDate, issuerName } = body
    const athlete = await getAthleteByRegistrationNumberLive(skfId)
    if (!athlete) throw new NotFoundError('Athlete')

    const { data: program, error: programError } = await supabaseAdmin
      .from('programs')
      .select('id')
      .eq('id', programId)
      .single()

    if (programError) throw programError
    if (!program) throw new NotFoundError('Program')

    const { data, error } = await supabaseAdmin
      .from('enrollments')
      .insert([{ 
        skf_id: skfId, 
        program_id: programId, 
        belt_level: beltLevel || null, 
        completion_date: completionDate || null, 
        issuer_name: issuerName || null,
        status: 'enrolled',
        certificate_unlocked: false
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, enrollmentId: data.id })
  }
)
