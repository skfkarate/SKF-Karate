import { submitContactForm } from '@/lib/server/sheets'
import { retryWithBackoff } from '@/lib/utils/retry'
import type { ContactInput } from '@/src/server/api/validators/contact.validator'
import { ExternalServiceError } from '@/src/server/lib/errors'
import { logger } from '@/src/server/lib/logger'
import { hasTelegramChannel, sendTelegramMessage } from '@/src/server/services/telegram.service'

type ContactSubmissionResult = {
  sheet: boolean
  telegram: boolean
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, '').trim()
}

function escapeTelegramMarkdown(value: string) {
  return value.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1')
}

export class ContactService {
  static async submit(input: ContactInput): Promise<ContactSubmissionResult> {
    if (input.website?.trim()) {
      return { sheet: false, telegram: false }
    }

    const name = stripHtml(input.name)
    const phone = stripHtml(input.phone)
    const email = stripHtml(input.email || '').toLowerCase()
    const preferredTime = stripHtml(input.preferredTime || '')
    const interest = stripHtml(input.interest || '') || 'General Inquiry'
    const message = stripHtml(input.message || '')

    const timestamp = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    })

    let sheet = false
    let telegram = false

    try {
      await retryWithBackoff(async () => {
        const ok = await submitContactForm([
          timestamp,
          name,
          phone,
          email || '—',
          preferredTime || 'Anytime',
          interest,
          message || '—',
        ])

        if (!ok) {
          throw new Error('Sheets transport returned false')
        }
      })
      sheet = true
    } catch (error) {
      logger.warn('contact.sheets_failed', { error })
    }

    if (hasTelegramChannel('leads')) {
      const telegramMessage = [
        '📋 *New Callback Request*',
        '',
        `*Name:* ${escapeTelegramMarkdown(name)}`,
        `*Phone:* ${escapeTelegramMarkdown(phone)}`,
        `*Call Time:* ${escapeTelegramMarkdown(preferredTime || 'Anytime')}`,
        email ? `*Email:* ${escapeTelegramMarkdown(email)}` : '',
        `*Interest:* ${escapeTelegramMarkdown(interest)}`,
        message ? `*Message:* ${escapeTelegramMarkdown(message)}` : '',
        '',
        escapeTelegramMarkdown(timestamp),
      ]
        .filter(Boolean)
        .join('\n')

      try {
        await retryWithBackoff(async () => {
          const result = await sendTelegramMessage({
            channel: 'leads',
            text: telegramMessage,
            parseMode: 'Markdown',
            timeoutMs: 5000,
          })

          if (!result.ok) throw new Error(result.error || 'Telegram leads alert failed')
        })
        telegram = true
      } catch (error) {
        logger.warn('contact.telegram_failed', { error })
      }
    }

    if (!sheet && !telegram) {
      throw new ExternalServiceError('Could not send your message. Please try again shortly.')
    }

    return { sheet, telegram }
  }
}
