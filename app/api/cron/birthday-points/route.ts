import { NextResponse } from 'next/server'

import { awardPoints } from '@/lib/points/pointsService'
import { getAllAthletesLive } from '@/lib/server/repositories/athletes-live'
import { supabaseAdmin } from '@/lib/server/supabase'
import { logger } from '@/src/server/lib/logger'
import { withRoute } from '@/src/server/lib/route'


export const GET = withRoute(
  { rateLimit: { tier: 'sensitive' } },
  async ({ request, requestId }) => {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'Cron secret not configured' }, { status: 503 })
  }

  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${cronSecret}`) {
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
          .eq('skf_id', athlete.skfId)
          .eq('reason', 'BIRTHDAY')
          .gte('created_at', startOfYear)

        if (count === 0) {
          await awardPoints(athlete.skfId, 'BIRTHDAY')
          awardedCount++
        }
      }
    }

    return NextResponse.json({ success: true, awarded: awardedCount })
  } catch (error) {
    logger.error('cron.birthday_points_failed', { requestId, error })
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
  }
)
