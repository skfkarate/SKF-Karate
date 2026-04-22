import { NextResponse } from 'next/server'
import { getAllStudents } from '@/lib/server/sheets'
import { awardPoints } from '@/lib/points/pointsService'
import { supabaseAdmin } from '@/lib/server/supabase'

// Optional: restrict access via an env variable token
export async function GET(request: Request) {
    // Vercel adds a header for cron jobs
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const students = await getAllStudents()
        if (!students) return NextResponse.json({ error: 'No students found' }, { status: 500 })

        const today = new Date()
        const currentMonth = today.getMonth() + 1 // 1-12
        const currentDate = today.getDate()
        const currentYear = today.getFullYear()

        const startOfYear = new Date(currentYear, 0, 1).toISOString()

        let awardedCount = 0

        for (const student of students) {
            const dob = student.dob
            if (!dob) continue

            const [, monthStr, dayStr] = dob.split('-')
            if (parseInt(monthStr, 10) === currentMonth && parseInt(dayStr, 10) === currentDate) {
                
                // Check if they already got their birthday points this year
                const { count } = await supabaseAdmin
                    .from('point_transactions')
                    .select('*', { count: 'exact', head: true })
                    .eq('skf_id', student.skfId)
                    .eq('reason', 'BIRTHDAY')
                    .gte('created_at', startOfYear)

                if (count === 0) {
                    await awardPoints(student.skfId, 'BIRTHDAY')
                    awardedCount++
                }
            }
        }

        return NextResponse.json({ success: true, awarded: awardedCount })
    } catch (e: any) {
        console.error('Birthday cron error:', e)
        return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
    }
}
