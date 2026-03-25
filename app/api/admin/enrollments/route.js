import { NextResponse } from 'next/server'
import { supabase, isSupabaseReady } from '@/lib/server/supabase'
import { getStudentBySkfId } from '@/lib/server/sheets'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/server/auth/options'

export async function GET(request) {
  try {
    // 1. Authenticate Admin
    const session = await getServerSession(authOptions)
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isSupabaseReady()) {
      return NextResponse.json({ enrollments: [], warning: 'Database missing' })
    }

    // 2. Fetch all enrollments joined with programs
    const { data: records, error } = await supabase
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
        
        try {
          const studentInfo = await getStudentBySkfId(rec.skf_id)
          if (studentInfo) {
            studentName = `${studentInfo['First Name']} ${studentInfo['Last Name']}`
            belt = studentInfo.Belt || 'White'
          }
        } catch (e) {
          // Ignore fetch errors per student
        }

        return {
          id: rec.id,
          skfId: rec.skf_id,
          studentName,
          belt,
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
