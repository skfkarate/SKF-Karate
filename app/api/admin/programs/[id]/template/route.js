import { NextResponse } from 'next/server'
import { supabase, isSupabaseReady } from '@/lib/server/supabase'

export async function GET(request, { params }) {
  try {
    const { id: programId } = params

    if (!isSupabaseReady()) {
      return NextResponse.json({ template: null, mock: true })
    }

    const { data: template, error } = await supabase
      .from('certificate_templates')
      .select('*')
      .eq('program_id', programId)
      .single()

    // If no template is found, that's fine, it just hasn't been created yet.
    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return NextResponse.json({ template })
  } catch (error) {
    console.error('[API] Failed to fetch template:', error)
    return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    const { id: programId } = params
    const body = await request.json()
    const { 
      background_url, 
      text_configs,
      width_px,
      height_px
    } = body

    if (!background_url || !text_configs) {
      return NextResponse.json({ error: 'Background URL and Text Configs are required' }, { status: 400 })
    }

    if (!isSupabaseReady()) {
      return NextResponse.json({ success: true, mock: true })
    }

    // Upsert the template configuration for this program
    const { data: template, error } = await supabase
      .from('certificate_templates')
      .upsert(
        {
          program_id: programId,
          background_url,
          text_configs, // JSONB structure
          width_px: width_px || 2000,
          height_px: height_px || 1414,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'program_id' }
      )
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, template })
  } catch (error) {
    console.error('[API] Failed to save template:', error)
    return NextResponse.json({ error: 'Failed to save template' }, { status: 500 })
  }
}
