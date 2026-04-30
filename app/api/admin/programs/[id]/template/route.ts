import { NextResponse } from 'next/server'
import { supabaseAdmin, isSupabaseReady } from '@/lib/server/supabase'
import { programTemplateSaveSchema } from '@/src/server/api/validators/admin-certificates.validator'
import { withRoute } from '@/src/server/lib/route'

export const GET = withRoute(
  { auth: { type: 'admin', roles: ['admin'] }, rateLimit: { tier: 'authed' } },
  async ({ params }) => {
    const { id: programId } = params

    if (!isSupabaseReady()) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
    }

    const { data: template, error } = await supabaseAdmin
      .from('certificate_templates')
      .select('*')
      .eq('program_id', programId)
      .single()

    // If no template is found, that's fine, it just hasn't been created yet.
    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return NextResponse.json({ template })
  }
)

export const POST = withRoute(
  {
    auth: { type: 'admin', roles: ['admin'] },
    bodySchema: programTemplateSaveSchema,
    rateLimit: { tier: 'write' },
  },
  async ({ body, params }) => {
    const { id: programId } = params
    const { 
      background_url, 
      text_configs,
      width_px,
      height_px
    } = body

    if (!isSupabaseReady()) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
    }

    // Upsert the template configuration for this program
    const { data: template, error } = await supabaseAdmin
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
  }
)
