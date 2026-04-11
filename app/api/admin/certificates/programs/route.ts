import { NextResponse } from 'next/server'
import { supabaseAdmin, isSupabaseReady } from '@/lib/server/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/server/auth/options'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isSupabaseReady()) {
      return NextResponse.json({ programs: [] })
    }

    const { data: programs, error } = await supabaseAdmin
      .from('programs')
      .select('*, enrollments (count), certificate_templates(count)')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ programs })
  } catch (error) {
    console.error('[API] Failed to fetch certificate programs:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, type, branch } = body

    if (!name || !type) {
      return NextResponse.json({ error: 'Name and Type are required' }, { status: 400 })
    }

    if (!isSupabaseReady()) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
    }

    const { data, error } = await supabaseAdmin
      .from('programs')
      .insert([{ name, type, branch: branch === 'ALL' ? null : branch, is_active: true }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, programId: data.id })
  } catch (error) {
    console.error('[API] Failed to create certificate program:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
