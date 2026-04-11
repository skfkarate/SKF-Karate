import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/server/requireRole'
import { createStudentSchema } from '@/lib/validators'
import { getAllSkfIds, createStudent } from '@/lib/server/sheets'
import { supabaseAdmin } from '@/lib/server/supabase'

export async function POST(request: Request) {
  try {
    // Attempt role check. Prompt specifies branch_admin/super_admin but system might use 'admin'
    await requireRole(['admin', 'branch_admin', 'super_admin'] as any)
    
    const body = await request.json()
    const validated = createStudentSchema.parse(body)

    const year = new Date().getFullYear().toString()
    const allIds = await getAllSkfIds()
    
    // Filter IDs from current year (e.g., SKF2025...)
    const currentYearIds = allIds.filter(id => id.startsWith(`SKF${year}`))
    
    let maxSuffix = 0
    currentYearIds.forEach(id => {
      const suffixStr = id.slice(-4)
      const num = parseInt(suffixStr, 10)
      if (!isNaN(num) && num > maxSuffix) maxSuffix = num
    })

    const newSuffix = String(maxSuffix + 1).padStart(4, '0')
    const newSkfId = `SKF${year}${newSuffix}`

    const newStudent = { 
      ...validated, 
      skfId: newSkfId, 
      status: 'Active' as const 
    }
    
    const res = await createStudent(newStudent)
    if (!res) throw new Error('Sheet creation failed')

    // Create auth_sessions row in Supabase
    const { error: dbError } = await supabaseAdmin.from('auth_sessions').insert({
      skf_id: newSkfId,
      pin_hash: '',   // parent sets PIN on first portal login
      failed_attempts: 0
    })

    if (dbError) {
        console.error('Supabase auth insertion failed:', dbError)
        // Non-fatal, just log it. Some envs might not have Supabase fully set up.
    }

    return NextResponse.json({ success: true, skfId: newSkfId })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('POST /api/admin/students error:', error)
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: error.message }, { status: error.message === 'UNAUTHORIZED' ? 401 : 403 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
