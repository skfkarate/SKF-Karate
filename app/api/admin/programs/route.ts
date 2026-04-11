import { NextResponse } from 'next/server'
import { supabaseAdmin, isSupabaseReady } from '@/lib/server/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/server/auth/options'

export async function GET(request) {
  try {
    // 1. Authenticate Admin
    const session = await getServerSession(authOptions)
    if (!session || (session as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isSupabaseReady()) {
      return NextResponse.json({ programs: [], warning: 'Database missing' })
    }

    // 2. Fetch all programs with their template configurations
    const { data: programs, error } = await supabaseAdmin
      .from('programs')
      .select(`
        *,
        certificate_templates (*)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ programs })

  } catch (error) {
    console.error('[API] Failed to fetch programs:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, type, requires_exam, batch_id, price } = body

    if (!name || !type) {
      return NextResponse.json({ error: 'Name and Type are required' }, { status: 400 })
    }

    if (!name || !type) {
      return NextResponse.json({ error: 'Name and Type are required' }, { status: 400 })
    }

    // 1. Authenticate Admin
    const session = await getServerSession(authOptions)
    if (!session || (session as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isSupabaseReady()) {
      return NextResponse.json({ success: true, mock: true })
    }

    // Insert new program
    const { data, error } = await supabaseAdmin
      .from('programs')
      .insert([
        { 
          name, 
          type, 
          requires_exam: !!requires_exam, 
          batch_id: batch_id || null,
          price: price || 0
        }
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, program: data })

  } catch (error) {
    console.error('[API] Failed to create program:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
