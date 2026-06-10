import { NextResponse } from 'next/server'
import { z } from 'zod'
import { submitLead } from '@/lib/server/sheets'
import { retryWithBackoff } from '@/lib/utils/retry'
import { resolveClassBranchLabel } from '@/lib/classes/catalog'
import { getAllCitiesLive } from '@/lib/server/repositories/classes-live'
import { extractClientIp, recordSiteAnalyticsEvent } from '@/lib/server/site-analytics'
import { logger } from '@/src/server/lib/logger'
import { withRoute } from '@/src/server/lib/route'
import { sendFeeTrackPushNotification } from '@/src/server/services/feetrack-push.service'
import { hasTelegramChannel, sendTelegramMessage } from '@/src/server/services/telegram.service'

// The schema matching FreeTrialForm.tsx
const leadSchema = z.object({
  studentName: z.string().min(2).max(100),
  parentPhone: z.string().regex(/^\+91[0-9]{10}$/),
  childAge: z.number().min(4).max(60),
  branch: z.string().min(1).max(160),
  preferredBatch: z.string().min(2),
  hearAboutUs: z.string().optional()
})

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

export const POST = withRoute(
  {
    bodySchema: leadSchema,
    rateLimit: { tier: 'contact' },
  },
  async ({ request, body: validatedData, requestId }) => {
  try {
    const timestamp = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    })
    const classes = await getAllCitiesLive()
    
    const status = 'New'
    const branchLabel =
      validatedData.branch === 'not-sure'
        ? 'Not Sure / Contact Me'
        : resolveClassBranchLabel(classes, validatedData.branch) || validatedData.branch

    // 1. Prepare Google Sheet Row
    const row = [
      validatedData.studentName.trim(),
      validatedData.parentPhone.trim(),
      String(validatedData.childAge),
      branchLabel,
      validatedData.preferredBatch,
      validatedData.hearAboutUs || '',
      timestamp,
      status
    ]

    let sheetOk = false
    let telegramOk = false
    let sheetError: unknown = null
    let telegramError: unknown = null

    // --- Channel 1: Google Sheets ---
    try {
      await retryWithBackoff(async () => {
        const success = await submitLead(row)
        if (!success) throw new Error('submitLead returned false')
      }, 2, 1000)
      sheetOk = true
    } catch (err: unknown) {
      sheetError = err
      logger.error('leads.sheets_failed', { requestId, error: err })
    }

    // --- Channel 2: Telegram ---
    const escapeTelegramMarkdown = (value: unknown) =>
      String(value).replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1')

    const telegramMessage = [
      `🥋 *New Free Trial Request*`,
      ``,
      `👤 *Student:* ${escapeTelegramMarkdown(validatedData.studentName.trim())}`,
      `📞 *Phone:* ${escapeTelegramMarkdown(validatedData.parentPhone.trim())}`,
      `🎂 *Age:* ${escapeTelegramMarkdown(validatedData.childAge)}`,
      `🏢 *Branch:* ${escapeTelegramMarkdown(branchLabel)}`,
      `⏰ *Batch:* ${escapeTelegramMarkdown(validatedData.preferredBatch)}`,
      validatedData.hearAboutUs ? `📣 *Source:* ${escapeTelegramMarkdown(validatedData.hearAboutUs)}` : '',
      ``,
      `🕐 ${escapeTelegramMarkdown(timestamp)}`,
    ].filter(Boolean).join('\n')

    try {
      if (hasTelegramChannel('leads')) {
        await retryWithBackoff(async () => {
          const result = await sendTelegramMessage({
            channel: 'leads',
            text: telegramMessage,
            parseMode: 'Markdown',
          })
          if (!result.ok) throw new Error(result.error || 'Telegram leads alert failed')
        }, 2, 800)
        telegramOk = true
      } else {
        logger.warn('leads.telegram_missing_credentials', { requestId })
      }
    } catch (err: unknown) {
      telegramError = err
      logger.error('leads.telegram_failed', { requestId, error: err })
    }

    // Return success if AT LEAST ONE channel worked
    if (sheetOk || telegramOk) {
      const pushResult = await sendFeeTrackPushNotification({
        title: 'New Free Trial Request',
        body: `${validatedData.studentName.trim()} • ${branchLabel} • ${validatedData.parentPhone.trim()}`,
        url: '/dashboard',
        tag: `lead-${Date.now()}`,
      })

      await recordSiteAnalyticsEvent({
        eventType: 'lead_submit_success',
        path: '/book-trial',
        pageTitle: 'Book Trial',
        referrer: request.headers.get('referer'),
        metadata: {
          branch: branchLabel,
          sheets: sheetOk,
          telegram: telegramOk,
          push: pushResult,
        },
        userAgent: request.headers.get('user-agent'),
        ipAddress: extractClientIp(request.headers),
      })

      return NextResponse.json({ 
        success: true, 
        captured: { sheets: sheetOk, telegram: telegramOk } 
      })
    }

    // Both failed
    throw new Error(`Submission failed. Sheets: ${getErrorMessage(sheetError)}, Telegram: ${getErrorMessage(telegramError)}`)

  } catch (error: unknown) {
    logger.error('leads.failed', { requestId, error })
    
    if (error instanceof z.ZodError) {
      await recordSiteAnalyticsEvent({
        eventType: 'lead_submit_failed',
        path: '/book-trial',
        pageTitle: 'Book Trial',
        referrer: request.headers.get('referer'),
        metadata: {
          reason: 'validation',
          fields: error.issues.map((issue) => issue.path.join('.')).filter(Boolean),
        },
        userAgent: request.headers.get('user-agent'),
        ipAddress: extractClientIp(request.headers),
      })

      return NextResponse.json({ 
        error: 'Please check your inputs.',
        retryable: false,
        details: error.issues 
      }, { status: 400 })
    }

    await recordSiteAnalyticsEvent({
      eventType: 'lead_submit_failed',
      path: '/book-trial',
      pageTitle: 'Book Trial',
      referrer: request.headers.get('referer'),
      metadata: {
        reason: 'delivery',
      },
      userAgent: request.headers.get('user-agent'),
      ipAddress: extractClientIp(request.headers),
    })
    
    return NextResponse.json({ 
      error: 'Could not submit booking. Please try again.',
      retryable: true
    }, { status: 503 })
  }
  }
)
