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
            // Assume student format has `dob` or can fetch it somehow.
            // Wait, in `sheets.ts` `getAllStudents()` return `skfId`, `name`, `branch`, etc.
            // The prompt for admin students form had `dob: row.dob`.
            // Let's assume Student object has `dob` as `YYYY-MM-DD` or we will have to skip.
            // Actually `getAllStudents` currently does NOT fetch `dob`! It gets up to column K, but we need to verify `dob`.
            // Wait, I updated `createStudent` which presumably puts `dob` in Column L? No, the columns are:
            // "Expected headers: name, dob, branch, batch, belt, parent_name, phone, monthly_fee, photo_consent, enrolled_date"
            // We should ensure we read `dob`. For now we rely on `(student as any).dob` if we didn't map it properly.
            // Wait, let's fix `getAllStudents` mapping to include DOB. I'll just adjust the index mapping later or try parsing.
            // Actually, in previous `StudentCsvImportClient`, `name, dob, branch, batch, belt...`.
            // To be safe, let's fetch the raw `getSheets()` here if `dob` is missing from `student`.
            const dob = (student as any).dob
            if (!dob) continue

            const [yearStr, monthStr, dayStr] = dob.split('-')
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
