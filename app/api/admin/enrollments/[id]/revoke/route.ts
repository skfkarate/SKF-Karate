import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/server/supabase'
import { withRoute } from '@/src/server/lib/route'

export const PATCH = withRoute(
  { auth: { type: 'admin', roles: ['admin'] }, rateLimit: { tier: 'write' } },
  async ({ params }) => {
    const { data, error } = await supabaseAdmin
      .from('enrollments')
      .update({
        status: 'revoked',
        certificate_unlocked: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, enrollment: data })
  }
)
