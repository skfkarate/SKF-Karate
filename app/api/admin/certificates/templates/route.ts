import { NextResponse } from 'next/server'
import { supabaseAdmin, isSupabaseReady } from '@/lib/server/supabase'
import {
  certificateTemplateQuerySchema,
  certificateTemplateSaveSchema,
} from '@/src/server/api/validators/admin-certificates.validator'
import { withRoute } from '@/src/server/lib/route'

export const GET = withRoute(
  {
    auth: { type: 'admin', roles: ['admin'] },
    querySchema: certificateTemplateQuerySchema,
    rateLimit: { tier: 'authed' },
  },
  async ({ query: params }) => {
    if (!isSupabaseReady()) return NextResponse.json({ error: 'DB Unavailable' }, { status: 503 })

    let dbQuery = supabaseAdmin.from('certificate_templates').select('*')
    if (params.programId) dbQuery = dbQuery.eq('program_id', params.programId)

    const { data: templates, error } = await dbQuery

    if (error) throw error

    return NextResponse.json({ templates })
  }
)

export const POST = withRoute(
  {
    auth: { type: 'admin', roles: ['admin'] },
    bodySchema: certificateTemplateSaveSchema,
    rateLimit: { tier: 'write' },
  },
  async ({ body }) => {
    if (!isSupabaseReady()) return NextResponse.json({ error: 'DB Unavailable' }, { status: 503 })

    // Check if template exists for exact prog+belt
    let existingTemplateQuery = supabaseAdmin
      .from('certificate_templates')
      .select('id')
      .eq('program_id', body.programId)
    existingTemplateQuery = body.beltLevel
      ? existingTemplateQuery.eq('belt_level', body.beltLevel)
      : existingTemplateQuery.is('belt_level', null)

    const { data: existing } = await existingTemplateQuery.maybeSingle()

    let result
    if (existing) {
      result = await supabaseAdmin
        .from('certificate_templates')
        .update({
          template_image_url: body.templateImageUrl,
          fields: body.fields,
          use_qr_code: body.useQrCode,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single()
    } else {
      result = await supabaseAdmin
        .from('certificate_templates')
        .insert([{
          program_id: body.programId,
          belt_level: body.beltLevel || null,
          template_image_url: body.templateImageUrl,
          fields: body.fields,
          use_qr_code: body.useQrCode,
        }])
        .select()
        .single()
    }

    if (result.error) throw result.error

    return NextResponse.json({ success: true, templateId: result.data.id })
  }
)
