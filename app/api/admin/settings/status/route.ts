import { NextResponse } from 'next/server'
import { withRoute } from '@/src/server/lib/route'

export const GET = withRoute(
  { auth: { type: 'admin', roles: ['admin'] }, rateLimit: { tier: 'authed' } },
  async () => {
    return NextResponse.json({
      supabase: !!(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.SUPABASE_SERVICE_ROLE_KEY
      ),
      sheets: !!(
        process.env.GOOGLE_SHEET_ID &&
        process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
        process.env.GOOGLE_PRIVATE_KEY
      ),
      razorpay: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
      resend: !!process.env.RESEND_API_KEY,
      telegramSystem: !!(
        process.env.TELEGRAM_SYSTEM_BOT_TOKEN &&
        process.env.TELEGRAM_SYSTEM_CHAT_ID
      ),
      telegramReminders: !!(
        process.env.TELEGRAM_REMINDERS_BOT_TOKEN &&
        process.env.TELEGRAM_REMINDERS_CHAT_ID
      ),
    })
  }
)
