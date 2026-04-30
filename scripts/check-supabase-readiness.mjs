import { existsSync, readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const envFiles = ['.env', '.env.local']

function loadEnvFile(path) {
  if (!existsSync(path)) return

  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue

    const index = trimmed.indexOf('=')
    const key = trimmed.slice(0, index).trim()
    let value = trimmed.slice(index + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (!process.env[key] && value) {
      process.env[key] = value
    }
  }
}

envFiles.forEach(loadEnvFile)

const requiredEnv = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
]

const missingEnv = requiredEnv.filter((key) => !process.env[key])
if (missingEnv.length > 0) {
  console.error(`Missing required Supabase env vars: ${missingEnv.join(', ')}`)
  process.exit(1)
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
})
const admin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const requiredTables = [
  ['programs', 'id'],
  ['athletes', 'id'],
  ['portal_videos', 'youtube_id'],
  ['video_progress', 'id'],
  ['enrollments', 'id'],
  ['certificate_templates', 'id'],
  ['certificate_events', 'id'],
  ['certificates', 'enrollment_id'],
  ['fee_records', 'id'],
  ['student_points', 'skf_id'],
  ['point_transactions', 'id'],
]

const sensitiveAnonTables = [
  ['athletes', 'id'],
  ['portal_videos', 'youtube_id'],
  ['video_progress', 'id'],
  ['certificate_events', 'id'],
  ['certificates', 'enrollment_id'],
  ['fee_records', 'id'],
  ['student_points', 'skf_id'],
  ['point_transactions', 'id'],
]

let failures = 0
let warnings = 0

function mark(status, message) {
  console.log(`${status} ${message}`)
}

async function checkTableExists(table, column) {
  const { error, count } = await admin
    .from(table)
    .select(column, { count: 'exact', head: true })
    .limit(1)

  if (error) {
    failures += 1
    mark('FAIL', `${table}: not queryable by service role (${error.code || error.message})`)
    return
  }

  mark('PASS', `${table}: exists and service role can query (${count ?? 0} rows)`)
}

async function checkAnonExposure(table, column) {
  const { data, error } = await anon.from(table).select(column).limit(1)

  if (error) {
    mark('PASS', `${table}: anon direct read blocked (${error.code || error.message})`)
    return
  }

  if (Array.isArray(data) && data.length === 0) {
    mark('PASS', `${table}: anon direct read returned no rows`)
    return
  }

  warnings += 1
  mark('WARN', `${table}: anon direct read returned rows; verify this is intentional RLS exposure`)
}

async function checkTrainingVideosBucket() {
  const { data, error } = await admin.storage.listBuckets()

  if (error) {
    failures += 1
    mark('FAIL', `storage buckets: cannot list buckets (${error.message})`)
    return
  }

  const bucket = data.find((item) => item.name === 'training-videos')
  if (!bucket) {
    failures += 1
    mark('FAIL', 'training-videos bucket: missing')
    return
  }

  if (bucket.public) {
    failures += 1
    mark('FAIL', 'training-videos bucket: exists but is public')
    return
  }

  mark('PASS', 'training-videos bucket: exists and is private')
}

console.log('Supabase readiness check: read-only')
console.log(`Project: ${new URL(supabaseUrl).hostname}`)

for (const [table, column] of requiredTables) {
  await checkTableExists(table, column)
}

for (const [table, column] of sensitiveAnonTables) {
  await checkAnonExposure(table, column)
}

await checkTrainingVideosBucket()

if (failures > 0) {
  console.error(`Supabase readiness failed: ${failures} failures, ${warnings} warnings.`)
  process.exit(1)
}

if (warnings > 0) {
  console.warn(`Supabase readiness completed with ${warnings} warnings.`)
  process.exit(0)
}

console.log('Supabase readiness OK.')
