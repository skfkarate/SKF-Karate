import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/server/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const skfId = searchParams.get('skfId')

    if (!skfId) return NextResponse.json({ error: 'Missing SKF ID' }, { status: 400 })

    const { data: enrollments, error } = await supabaseAdmin
      .from('enrollments')
      .select('id, skf_id, programs(name, type), belt_level, completion_date, issuer_name, certificate_unlocked')
      .eq('skf_id', skfId)
      // Standard public rule enforced explicitly below if needed, but since this powers public athletes:
      .eq('certificate_unlocked', true)
      .eq('status', 'completed')

    if (error) throw error

    return NextResponse.json({ 
      certificates: enrollments.map(e => ({
        id: e.id,
        enrollmentId: e.id,
        skfId: e.skf_id,
        programName: e.programs?.name || 'Program',
        programType: e.programs?.type || 'training',
        beltLevel: e.belt_level,
        completionDate: e.completion_date,
        issuerName: e.issuer_name,
        unlocked: e.certificate_unlocked
      }))
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
