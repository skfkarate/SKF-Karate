import { NextResponse } from 'next/server'
import { supabaseAdmin, isSupabaseReady } from '@/lib/server/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/server/auth/options'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const programId = searchParams.get('programId')

    if (!isSupabaseReady()) return NextResponse.json({ templates: [] })

    let query = supabaseAdmin.from('certificate_templates').select('*')
    if (programId) query = query.eq('program_id', programId)

    const { data: templates, error } = await query

    if (error) throw error

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('[API] Failed to fetch templates:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { programId, beltLevel, templateImageUrl, fields, useQrCode } = body

    if (!programId || !templateImageUrl) {
      return NextResponse.json({ error: 'Missing required configuration fields' }, { status: 400 })
    }

    if (!isSupabaseReady()) return NextResponse.json({ error: 'DB Unavailable' }, { status: 503 })

    // Check if template exists for exact prog+belt
    const { data: existing } = await supabaseAdmin
      .from('certificate_templates')
      .select('id')
      .eq('program_id', programId)
      // Allow undefined/null for non-belt exams
      .or(beltLevel ? `belt_level.eq.${beltLevel}` : 'belt_level.is.null')
      .single()

    let result
    if (existing) {
      result = await supabaseAdmin
        .from('certificate_templates')
        .update({ template_image_url: templateImageUrl, fields, use_qr_code: useQrCode, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single()
    } else {
      result = await supabaseAdmin
        .from('certificate_templates')
        .insert([{ program_id: programId, belt_level: beltLevel || null, template_image_url: templateImageUrl, fields, use_qr_code: useQrCode }])
        .select()
        .single()
    }

    if (result.error) throw result.error

    return NextResponse.json({ success: true, templateId: result.data.id })
  } catch (error) {
    console.error('[API] Failed to save template:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
