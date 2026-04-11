import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/server/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const skfId = searchParams.get('skfId')

    if (!skfId) {
      return NextResponse.json({ error: 'Missing SKF ID' }, { status: 400 })
    }

    const { data: enrollments, error } = await supabaseAdmin
      .from('enrollments')
      .select('id, skf_id, programs(name, type), belt_level, completion_date, issuer_name, certificate_unlocked')
      .eq('skf_id', skfId)
      .eq('certificate_unlocked', true)
      .eq('status', 'completed')

    if (error) throw error

    return NextResponse.json({
      certificates: (enrollments || []).map((enrollment) => {
        const program = Array.isArray(enrollment.programs)
          ? enrollment.programs[0]
          : enrollment.programs

        return {
          id: enrollment.id,
          enrollmentId: enrollment.id,
          skfId: enrollment.skf_id,
          programName: program?.name || 'Program',
          programType: program?.type || 'training',
          beltLevel: enrollment.belt_level,
          completionDate: enrollment.completion_date,
          issuerName: enrollment.issuer_name,
          unlocked: enrollment.certificate_unlocked,
        }
      }),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
