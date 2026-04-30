import { NextResponse } from 'next/server'
import { supabaseAdmin, isSupabaseReady } from '@/lib/server/supabase'
import { certificateProgramCreateSchema } from '@/src/server/api/validators/admin-certificates.validator'
import { withRoute } from '@/src/server/lib/route'

export const GET = withRoute(
  { auth: { type: 'admin', roles: ['admin'] }, rateLimit: { tier: 'authed' } },
  async () => {
    if (!isSupabaseReady()) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
    }

    const { data: programs, error } = await supabaseAdmin
      .from('programs')
      .select('*, enrollments (count), certificate_templates(count)')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ programs })
  }
)

export const POST = withRoute(
  {
    auth: { type: 'admin', roles: ['admin'] },
    bodySchema: certificateProgramCreateSchema,
    rateLimit: { tier: 'write' },
  },
  async ({ body }) => {
    if (!isSupabaseReady()) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
    }

    const { data, error } = await supabaseAdmin
      .from('programs')
      .insert([{ name: body.name, type: body.type, branch: body.branch === 'ALL' ? null : body.branch, is_active: true }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, programId: data.id })
  }
)
