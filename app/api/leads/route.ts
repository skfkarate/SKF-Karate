import { NextResponse } from 'next/server'
import { z } from 'zod'
import { submitLead } from '@/lib/server/sheets'
import { retryWithBackoff } from '@/lib/utils/retry'
import { BRANCH_SLUGS, BRANCH_LABELS, type BranchSlug } from '@/data/constants/branches'

// The schema matching FreeTrialForm.tsx
const leadSchema = z.object({
  studentName: z.string().min(2).max(100),
  parentPhone: z.string().regex(/^\+91[0-9]{10}$/),
  childAge: z.number().min(4).max(60),
  branch: z.union([z.enum(BRANCH_SLUGS), z.literal('not-sure')]),
  preferredBatch: z.string().min(2),
  hearAboutUs: z.string().optional()
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validatedData = leadSchema.parse(body)

    const timestamp = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    })
    
    const status = 'New'

    // 1. Prepare Google Sheet Row
    const row = [
      validatedData.studentName.trim(),
      validatedData.parentPhone.trim(),
      String(validatedData.childAge),
      validatedData.branch,
      validatedData.preferredBatch,
      validatedData.hearAboutUs || '',
      timestamp,
      status
    ]

    let sheetOk = false
    let telegramOk = false
    let sheetError = null
    let telegramError = null

    // --- Channel 1: Google Sheets ---
    try {
      await retryWithBackoff(async () => {
        const success = await submitLead(row)
        if (!success) throw new Error('submitLead returned false')
      }, 2, 1000)
      sheetOk = true
    } catch (err: any) {
      sheetError = err
      console.error('Leads Sheets Error:', err?.message || err)
    }

    // --- Channel 2: Telegram ---
    const escapeTelegramMarkdown = (value: any) =>
      String(value).replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1')

    const branchLabel = validatedData.branch === 'not-sure' 
      ? 'Not Sure / Contact Me' 
      : (BRANCH_LABELS[validatedData.branch as BranchSlug] || validatedData.branch)

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
      if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
        await retryWithBackoff(async () => {
          const res = await fetch(
            `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: process.env.TELEGRAM_CHAT_ID,
                text: telegramMessage,
                parse_mode: 'Markdown',
              }),
            }
          )
          if (!res.ok) {
            const errorBody = await res.text()
            throw new Error(`Telegram HTTP ${res.status}: ${errorBody}`)
          }
        }, 2, 800)
        telegramOk = true
      } else {
        console.warn('Telegram credentials missing in leads API')
      }
    } catch (err: any) {
      telegramError = err
      console.error('Leads Telegram Error:', err?.message || err)
    }

    // Return success if AT LEAST ONE channel worked
    if (sheetOk || telegramOk) {
      return NextResponse.json({ 
        success: true, 
        captured: { sheets: sheetOk, telegram: telegramOk } 
      })
    }

    // Both failed
    throw new Error(`Submission failed. Sheets: ${sheetError?.message}, Telegram: ${telegramError?.message}`)

  } catch (error: any) {
    console.error('Leads API Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Please check your inputs.',
        retryable: false,
        details: error.errors 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: 'Could not submit booking. Please try again.',
      retryable: true
    }, { status: 503 })
  }
}
