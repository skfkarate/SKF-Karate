import { hasEnv } from '@/src/server/config/env'

export class AdminSettingsService {
  static getStatus() {
    return {
      supabase: hasEnv('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'),
      sheets: hasEnv('GOOGLE_SHEET_ID', 'GOOGLE_SERVICE_ACCOUNT_EMAIL', 'GOOGLE_PRIVATE_KEY'),
      resend: hasEnv('RESEND_API_KEY'),
      telegramSystem: hasEnv('TELEGRAM_SYSTEM_BOT_TOKEN', 'TELEGRAM_SYSTEM_CHAT_ID'),
      telegramReminders: hasEnv('TELEGRAM_REMINDERS_BOT_TOKEN', 'TELEGRAM_REMINDERS_CHAT_ID'),
      redis: hasEnv('UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'),
      telemetry: hasEnv('SENTRY_DSN'),
    }
  }
}
