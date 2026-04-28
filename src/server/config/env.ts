import { z } from 'zod'

const optionalString = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(
    (value) => {
      if (typeof value === 'string' && value.trim() === '') {
        return undefined
      }

      return value
    },
    schema.optional()
  )

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  TREASURY_COLLECTION_MODE: z.enum(['manual', 'gateway']).default('manual'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('https://skfkarate.org'),
  NEXTAUTH_SECRET: optionalString(z.string().min(32)),
  JWT_SECRET: optionalString(z.string().min(32)),
  ADMIN_USERNAME: optionalString(z.string().min(1)),
  ADMIN_PASSWORD: optionalString(z.string().min(1)),
  INSTRUCTOR_USERNAME: optionalString(z.string().min(1)),
  INSTRUCTOR_PASSWORD: optionalString(z.string().min(1)),
  NEXT_PUBLIC_SUPABASE_URL: optionalString(z.string().url()),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalString(z.string().min(1)),
  SUPABASE_SERVICE_ROLE_KEY: optionalString(z.string().min(1)),
  UPSTASH_REDIS_REST_URL: optionalString(z.string().url()),
  UPSTASH_REDIS_REST_TOKEN: optionalString(z.string().min(1)),
  RAZORPAY_KEY_ID: optionalString(z.string().min(1)),
  RAZORPAY_KEY_SECRET: optionalString(z.string().min(1)),
  RAZORPAY_WEBHOOK_SECRET: optionalString(z.string().min(1)),
  RESEND_API_KEY: optionalString(z.string().min(1)),
  ADMIN_EMAIL: optionalString(z.string().email()),
  TELEGRAM_BOT_TOKEN: optionalString(z.string().min(1)),
  TELEGRAM_CHAT_ID: optionalString(z.string().min(1)),
  GOOGLE_SITE_VERIFICATION: optionalString(z.string()),
  NEXT_PUBLIC_GA_ID: optionalString(z.string()),
  GOOGLE_SHEETS_CLIENT_EMAIL: optionalString(z.string().email()),
  GOOGLE_SHEETS_PRIVATE_KEY: optionalString(z.string().min(1)),
  GOOGLE_SPREADSHEET_ID: optionalString(z.string().min(1)),
  GOOGLE_SERVICE_ACCOUNT_EMAIL: optionalString(z.string().email()),
  GOOGLE_PRIVATE_KEY: optionalString(z.string().min(1)),
  GOOGLE_SHEET_ID: optionalString(z.string().min(1)),
  GOOGLE_SHEET_ID_SUMMER_CAMP: optionalString(z.string().min(1)),
  CRON_SECRET: optionalString(z.string().min(1)),
  SENTRY_DSN: optionalString(z.string().url()),
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  console.error('Invalid environment variables', parsedEnv.error.flatten().fieldErrors)
  throw new Error('Environment validation failed.')
}

export const env = parsedEnv.data

type EnvKey = keyof typeof env

export function requireEnv(key: EnvKey): string {
  const value = env[key]

  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Missing required environment variable: ${key}`)
  }

  return value
}

export function hasEnv(...keys: EnvKey[]): boolean {
  return keys.every((key) => {
    const value = env[key]
    return typeof value === 'string' && value.length > 0
  })
}
