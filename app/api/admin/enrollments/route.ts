import { NextResponse } from 'next/server'
import { supabaseAdmin, isSupabaseReady } from '@/lib/server/supabase'
import { getStudentBySkfId } from '@/lib/server/sheets'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/server/auth/options'

export async function GET(request) {
  try {
    // 1. Authenticate Admin
    const session = await getServerSession(authOptions as any)
    if (!session || (session as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isSupabaseReady()) {
      return NextResponse.json({ enrollments: [], warning: 'Database missing' })
    }

    // 2. Fetch all enrollments joined with programs
    const { data: records, error } = await supabaseAdmin
      .from('enrollments')
      .select(`
        id,
        skf_id,
        status,
        updated_at,
        programs ( id, name, type )
      `)
      .order('updated_at', { ascending: false })

    if (error) throw error

    // 3. Map SKF IDs to Real Names via Google Sheets (in parallel for speed)
    const enrichedEnrollments = await Promise.all(
      records.map(async (rec) => {
        let studentName = 'Unknown Student'
        let belt = 'Unknown Belt'
        let branch = 'Unknown Branch'
        
        try {
          const studentInfo = await getStudentBySkfId(rec.skf_id)
          if (studentInfo) {
            studentName = `${studentInfo.name?.split(' ')[0] || ''} ${studentInfo.name?.split(' ').slice(1).join(' ') || ''}`
            belt = studentInfo.belt || 'White'
            branch = studentInfo.branch || 'Unknown'
          }
        } catch (e) {
          // Ignore fetch errors per student
        }

        return {
          id: rec.id,
          skfId: rec.skf_id,
          studentName,
          belt,
          branch,
          programId: rec.programs?.id,
          programName: rec.programs?.name || 'Unknown Program',
          status: rec.status,
          certUnlocked: rec.status === 'completed',
          date: new Date(rec.updated_at).toLocaleDateString()
        }
      })
    )

    return NextResponse.json({ enrollments: enrichedEnrollments })

  } catch (error) {
    console.error('[API] Failed to fetch enrollments:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions as any)
    if (!session || (session as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { skfId, programId, beltLevel, completionDate, issuerName } = body

    if (!skfId || !programId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Server-side validate SKF ID natively against sheets
    const studentInfo = await getStudentBySkfId(skfId)
    if (!studentInfo) return NextResponse.json({ error: 'Invalid SKF ID' }, { status: 404 })

    const { data: program } = await supabaseAdmin.from('programs').select('id').eq('id', programId).single()
    if (!program) return NextResponse.json({ error: 'Invalid Program' }, { status: 404 })

    const { data, error } = await supabaseAdmin
      .from('enrollments')
      .insert([{ 
        skf_id: skfId, 
        program_id: programId, 
        belt_level: beltLevel || null, 
        completion_date: completionDate || null, 
        issuer_name: issuerName || null,
        status: 'enrolled',
        certificate_unlocked: false
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, enrollmentId: data.id })
  } catch (error: any) {
    console.error('[API POST] Failed to link enrollment:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
