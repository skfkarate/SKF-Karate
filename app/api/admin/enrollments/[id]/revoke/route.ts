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
  } catch (error: any) {
    console.error('[API PATCH] Failed to revoke enrollment:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
