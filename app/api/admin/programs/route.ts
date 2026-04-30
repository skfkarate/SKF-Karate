import { NextResponse } from 'next/server'

import { isSupabaseReady, supabaseAdmin } from '@/lib/server/supabase'
import { adminProgramCreateSchema } from '@/src/server/api/validators/programs.validator'
import { withRoute } from '@/src/server/lib/route'

function mapProgram(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    branch: row.branch,
    hasBeltSubtypes: Boolean(row.has_belt_subtypes),
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    certificateTemplates: row.certificate_templates || [],
  }
}

export const GET = withRoute(
  { auth: { type: 'admin', roles: ['admin'] }, rateLimit: { tier: 'authed' } },
  async () => {
    if (!isSupabaseReady()) {
      return NextResponse.json({ error: 'Database missing' }, { status: 503 })
    }

    const { data: programs, error } = await supabaseAdmin
      .from('programs')
      .select(`
        *,
        certificate_templates (*)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ programs: (programs || []).map(mapProgram) })
  }
)

export const POST = withRoute(
  {
    auth: { type: 'admin', roles: ['admin'] },
    bodySchema: adminProgramCreateSchema,
    rateLimit: { tier: 'write' },
  },
  async ({ body: input }) => {
    if (!isSupabaseReady()) {
      return NextResponse.json({ error: 'Database missing' }, { status: 503 })
    }

    const { data, error } = await supabaseAdmin
      .from('programs')
      .insert([{
        name: input.name,
        type: input.type,
        branch: input.branch || null,
        has_belt_subtypes: Boolean(input.hasBeltSubtypes),
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, program: mapProgram(data) })
  }
)
