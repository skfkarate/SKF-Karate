import { NextResponse } from 'next/server'

import { awardPoints } from '@/lib/points/pointsService'
import { getAllAthletesLive } from '@/lib/server/repositories/athletes-live'
import { supabaseAdmin } from '@/lib/server/supabase'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const athletes = await getAllAthletesLive()
    if (!athletes.length) {
      return NextResponse.json({ error: 'No athletes found' }, { status: 500 })
    }

    const today = new Date()
    const currentMonth = today.getMonth() + 1
    const currentDate = today.getDate()
    const currentYear = today.getFullYear()
    const startOfYear = new Date(currentYear, 0, 1).toISOString()

    let awardedCount = 0

    for (const athlete of athletes) {
      const dob = String(athlete.dateOfBirth || '').trim()
      if (!dob) continue

      const [, monthStr, dayStr] = dob.split('-')
      if (parseInt(monthStr, 10) === currentMonth && parseInt(dayStr, 10) === currentDate) {
        const { count } = await supabaseAdmin
          .from('point_transactions')
          .select('*', { count: 'exact', head: true })
          .eq('skf_id', athlete.registrationNumber)
          .eq('reason', 'BIRTHDAY')
          .gte('created_at', startOfYear)

        if (count === 0) {
          await awardPoints(athlete.registrationNumber, 'BIRTHDAY')
          awardedCount++
        }
      }
    }

    return NextResponse.json({ success: true, awarded: awardedCount })
  } catch (error: any) {
    console.error('Birthday cron error:', error)
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}
