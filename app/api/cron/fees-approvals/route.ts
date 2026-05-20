import { NextResponse } from 'next/server'
import { TelegramReportsService } from '@/src/server/services/telegram-reports.service'
import { logger } from '@/src/server/lib/logger'
import { env } from '@/src/server/config/env'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // allow up to 5 minutes

export async function GET(request: Request) {
  try {
    // 1. Verify Vercel Cron Secret. Cron routes must fail closed in production.
    const authHeader = request.headers.get('authorization')
    if (!env.CRON_SECRET) {
      return NextResponse.json({ error: 'Cron secret not configured' }, { status: 503 })
    }

    if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    logger.info('cron.fees_approvals.started')

    // 2. Check and send pending verifications alert
    const result = await TelegramReportsService.sendPendingVerificationsAlert()

    return NextResponse.json({ 
      success: true, 
      count: result.count 
    })

  } catch (error) {
    logger.error('cron.fees_approvals.failed', { error })
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    )
  }
}
