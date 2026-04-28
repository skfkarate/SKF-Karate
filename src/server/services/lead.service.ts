import { submitLead } from '@/lib/server/sheets'
import { resolveClassBranchLabel } from '@/lib/classes/catalog'
import { getAllCitiesLive } from '@/lib/server/repositories/classes-live'
import { recordSiteAnalyticsEvent } from '@/lib/server/site-analytics'
import { retryWithBackoff } from '@/lib/utils/retry'
import type { LeadInput } from '@/src/server/api/validators/lead.validator'
import { env, hasEnv } from '@/src/server/config/env'
import { ExternalServiceError } from '@/src/server/lib/errors'
import { logger } from '@/src/server/lib/logger'

function escapeTelegramMarkdown(value: string) {
  return value.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1')
}

export class LeadService {
  static async submit(
    input: LeadInput,
    requestMeta: {
      referrer: string | null
      userAgent: string | null
      ipAddress: string | null
    }
  ) {
    const timestamp = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    })

    const classes = await getAllCitiesLive()
    const branchLabel =
      input.branch === 'not-sure'
        ? 'Not Sure / Contact Me'
        : resolveClassBranchLabel(classes, input.branch) || input.branch

    const row = [
      input.studentName.trim(),
      input.parentPhone.trim(),
      String(input.childAge),
      branchLabel,
      input.preferredBatch.trim(),
      input.hearAboutUs?.trim() || '',
      timestamp,
      'New',
    ]

    let sheet = false
    let telegram = false

    try {
      await retryWithBackoff(async () => {
        const ok = await submitLead(row)
        if (!ok) {
          throw new Error('submitLead returned false')
        }
      })
      sheet = true
    } catch (error) {
      logger.warn('lead.sheets_failed', { error })
    }

    if (hasEnv('TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID')) {
      const telegramMessage = [
        '🥋 *New Free Trial Request*',
        '',
        `👤 *Student:* ${escapeTelegramMarkdown(input.studentName.trim())}`,
        `📞 *Phone:* ${escapeTelegramMarkdown(input.parentPhone.trim())}`,
        `🎂 *Age:* ${escapeTelegramMarkdown(String(input.childAge))}`,
        `🏢 *Branch:* ${escapeTelegramMarkdown(branchLabel)}`,
        `⏰ *Batch:* ${escapeTelegramMarkdown(input.preferredBatch.trim())}`,
        input.hearAboutUs ? `📣 *Source:* ${escapeTelegramMarkdown(input.hearAboutUs.trim())}` : '',
        '',
        `🕐 ${escapeTelegramMarkdown(timestamp)}`,
      ]
        .filter(Boolean)
        .join('\n')

      try {
        await retryWithBackoff(async () => {
          const response = await fetch(
            `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: env.TELEGRAM_CHAT_ID,
                text: telegramMessage,
                parse_mode: 'Markdown',
              }),
              signal: AbortSignal.timeout(5000),
            }
          )

          if (!response.ok) {
            throw new Error(`Telegram HTTP ${response.status}`)
          }
        })
        telegram = true
      } catch (error) {
        logger.warn('lead.telegram_failed', { error })
      }
    }

    if (!sheet && !telegram) {
      await recordSiteAnalyticsEvent({
        eventType: 'lead_submit_failed',
        path: '/book-trial',
        pageTitle: 'Book Trial',
        referrer: requestMeta.referrer,
        metadata: { reason: 'delivery' },
        userAgent: requestMeta.userAgent,
        ipAddress: requestMeta.ipAddress,
      })

      throw new ExternalServiceError('Could not submit booking. Please try again.')
    }

    await recordSiteAnalyticsEvent({
      eventType: 'lead_submit_success',
      path: '/book-trial',
      pageTitle: 'Book Trial',
      referrer: requestMeta.referrer,
      metadata: {
        branch: branchLabel,
        sheets: sheet,
        telegram,
      },
      userAgent: requestMeta.userAgent,
      ipAddress: requestMeta.ipAddress,
    })

    return {
      branchLabel,
      channels: { sheets: sheet, telegram },
    }
  }
}
