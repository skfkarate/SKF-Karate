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

    // 2. Determine the target date
    const { searchParams } = new URL(request.url)
    const queryDate = searchParams.get('date')
    const today = queryDate ? new Date(queryDate) : new Date()
    const dayOfMonth = today.getDate()
    const isLastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() === dayOfMonth

    logger.info('cron.fees_telegram.started', { date: today.toISOString(), dayOfMonth, isLastDayOfMonth })

    // 3. Execute appropriate report logic based on the date
    let executedReport = 'none'

    if (dayOfMonth === 5) {
      await TelegramReportsService.sendEarlyMonthReminder()
      executedReport = 'early_month_reminder'
    } 
    else if (dayOfMonth === 10) {
      await TelegramReportsService.sendMidMonthPendingList(false) // Not escalation
      executedReport = 'mid_month_pending'
    } 
    else if (dayOfMonth === 22) {
      await TelegramReportsService.sendMidMonthPendingList(true) // Escalation
      executedReport = 'late_month_escalation'
    } 
    else if (isLastDayOfMonth) {
      await TelegramReportsService.sendMonthEndReconciliation()
      executedReport = 'month_end_reconciliation'
    }

    return NextResponse.json({ 
      success: true, 
      date: today.toISOString(), 
      executedReport 
    })

  } catch (error) {
    logger.error('cron.fees_telegram.failed', { error })
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    )
  }
}
