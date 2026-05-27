import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const envSchemaPath = resolve(root, 'src/server/config/env.ts')
const envExamplePath = resolve(root, '.env.example')

const envSchemaSource = readFileSync(envSchemaPath, 'utf8')
const envExampleSource = readFileSync(envExamplePath, 'utf8')

const schemaKeys = [...envSchemaSource.matchAll(/^\s{2}([A-Z0-9_]+):/gm)]
  .map((match) => match[1])
  .filter((key) => key !== 'NODE_ENV')
  .sort()

const exampleKeys = [...envExampleSource.matchAll(/^([A-Z0-9_]+)=/gm)]
  .map((match) => match[1])
  .filter((key) => key !== 'NODE_ENV')
  .sort()

const schemaSet = new Set(schemaKeys)
const exampleSet = new Set(exampleKeys)

const missingFromExample = schemaKeys.filter((key) => !exampleSet.has(key))
const extraInExample = exampleKeys.filter((key) => !schemaSet.has(key))

if (missingFromExample.length || extraInExample.length) {
  console.error('Environment contract mismatch.')

  if (missingFromExample.length) {
    console.error(`Missing from .env.example: ${missingFromExample.join(', ')}`)
  }

  if (extraInExample.length) {
    console.error(`Not defined in env schema: ${extraInExample.join(', ')}`)
  }

  process.exit(1)
}

const shouldCheckProduction =
  process.argv.includes('--production') ||
  process.env.NODE_ENV === 'production' ||
  process.env.VERCEL_ENV === 'production'

const productionRequired = [
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_SITE_URL',
  'JWT_SECRET',
  'NEXTAUTH_SECRET',
  'ADMIN_USERNAME',
  'ADMIN_PASSWORD',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'GOOGLE_SERVICE_ACCOUNT_EMAIL',
  'GOOGLE_PRIVATE_KEY',
  'FEETRACK_API_KEY',
  'SENTRY_DSN',
  'SENTRY_AUTH_TOKEN',
  'SENTRY_ORG',
  'SENTRY_PROJECT',
]

const urlKeys = new Set([
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'UPSTASH_REDIS_REST_URL',
  'SENTRY_DSN',
])

const minimumLengths = new Map([
  ['JWT_SECRET', 32],
  ['NEXTAUTH_SECRET', 32],
  ['FEETRACK_API_KEY', 16],
])

function readEnv(key) {
  return String(process.env[key] || '').trim()
}

if (shouldCheckProduction) {
  const productionErrors = []

  for (const key of productionRequired) {
    const value = readEnv(key)

    if (!value) {
      productionErrors.push(`${key} is required in production.`)
      continue
    }

    if (urlKeys.has(key)) {
      try {
        const parsed = new URL(value)
        if (!['https:', 'http:'].includes(parsed.protocol)) {
          productionErrors.push(`${key} must be an absolute HTTP(S) URL.`)
        }
      } catch {
        productionErrors.push(`${key} must be a valid absolute URL.`)
      }
    }

    const minimumLength = minimumLengths.get(key)
    if (minimumLength && value.length < minimumLength) {
      productionErrors.push(`${key} must be at least ${minimumLength} characters.`)
    }
  }

  const hasLegacyAdmissionRoot = Boolean(readEnv('ADMISSION_DRIVE_ROOT_FOLDER_ID'))
  const hasAdmissionPhotoRoot = Boolean(readEnv('ADMISSION_PHOTO_DRIVE_FOLDER_ID'))
  if (!hasLegacyAdmissionRoot && !hasAdmissionPhotoRoot) {
    productionErrors.push(
      'Admissions photo storage requires either ADMISSION_DRIVE_ROOT_FOLDER_ID or ADMISSION_PHOTO_DRIVE_FOLDER_ID.'
    )
  }

  if (productionErrors.length) {
    console.error('Production environment check failed.')
    for (const error of productionErrors) {
      console.error(`- ${error}`)
    }
    process.exit(1)
  }
}

console.log(
  shouldCheckProduction
    ? `Environment contract OK (${exampleKeys.length} documented variables). Production required env OK.`
    : `Environment contract OK (${exampleKeys.length} documented variables).`
)
