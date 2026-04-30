import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/server/supabase'
import { enrollmentPatchSchema } from '@/src/server/api/validators/admin-certificates.validator'
import { withRoute } from '@/src/server/lib/route'

// GET a specific enrollment
export const GET = withRoute(
  { auth: { type: 'admin', roles: ['admin'] }, rateLimit: { tier: 'authed' } },
  async ({ params }) => {
    const { data, error } = await supabaseAdmin
      .from('enrollments')
      .select('*, programs(name, type)')
      .eq('id', params.id)
      .single()

    if (error) throw error

    return NextResponse.json({ enrollment: data })
  }
)

// PATCH — update enrollment details (error correction flow)
export const PATCH = withRoute(
  {
    auth: { type: 'admin', roles: ['admin'] },
    bodySchema: enrollmentPatchSchema,
    rateLimit: { tier: 'write' },
  },
  async ({ body, params }) => {
    const updates = {
      ...body,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabaseAdmin
      .from('enrollments')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, enrollment: data })
  }
)
