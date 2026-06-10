import { NextResponse } from 'next/server'

import { sendDailyReminders } from '@/src/server/services/reminders.service'
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

    const result = await sendDailyReminders({ requestId })
    return NextResponse.json(result, { status: result.success || result.skipped ? 200 : 503 })
  }
)
