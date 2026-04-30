import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/server/supabase'
import { NotFoundError } from '@/src/server/lib/errors'
import { withRoute } from '@/src/server/lib/route'

export const PATCH = withRoute(
  { auth: { type: 'admin', roles: ['admin'] }, rateLimit: { tier: 'write' } },
  async ({ params }) => {
    // First get current status
    const { data: current, error: readError } = await supabaseAdmin
      .from('programs')
      .select('is_active')
      .eq('id', params.id)
      .single()

    if (readError) throw readError
    if (!current) {
      throw new NotFoundError('Program')
    }

    // Toggle
    const { data, error } = await supabaseAdmin
      .from('programs')
      .update({ is_active: !current.is_active })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, program: data })
  }
)
