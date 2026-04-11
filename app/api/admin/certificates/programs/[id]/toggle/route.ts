import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/server/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/server/auth/options'

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // First get current status
    const { data: current } = await supabaseAdmin
      .from('programs')
      .select('is_active')
      .eq('id', params.id)
      .single()

    if (!current) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 })
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
  } catch (error) {
    console.error('[API] Failed to toggle program:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
