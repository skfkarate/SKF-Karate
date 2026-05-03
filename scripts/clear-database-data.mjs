import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'node:fs'

// Load env vars manually like other project scripts
function loadEnv() {
  const path = '.env.local'
  if (!existsSync(path)) return

  const content = readFileSync(path, 'utf8')
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue

    const index = trimmed.indexOf('=')
    const key = trimmed.slice(0, index).trim()
    let value = trimmed.slice(index + 1).trim()

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    process.env[key] = value
  }
}

loadEnv()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
})

const tables = [
  // Child tables / Dependencies first
  'certificate_events',
  'certificate_views',
  'enrollments',
  'certificate_templates',
  'video_progress',
  'fee_records',
  'point_transactions',
  'student_points',
  'notifications',
  'branch_timetables',
  'class_branches',
  'class_schools',
  'skf_shop_orders',
  'site_analytics_events',
  'push_subscriptions',
  'otp_attempts',
  'auth_sessions',

  // Base tables
  'events',
  'tournaments',
  'athletes',
  'leads',
  'event_categories',
  'senseis',
  'class_cities',
  'programs',
  'skf_products'
]

async function clearTable(table) {
  console.log(`⏳ Clearing table: ${table}...`)

  // Postgrest requires a filter for DELETE.
  // We try common columns until one works.
  const filters = [
    ['created_at', '1970-01-01'],
    ['id', '00000000-0000-0000-0000-000000000000'],
    ['skf_id', '____'],
    ['slug', '____'],
    ['skf_id', '____'],
    ['email', '____'],
    ['name', '____']
  ]

  let lastError = null
  for (const [column, value] of filters) {
    const { error } = await supabase
      .from(table)
      .delete()
      .neq(column, value)

    if (!error) {
      console.log(`✅ Table ${table} cleared (using ${column}).`)
      return true
    }
    lastError = error
    // If it's a "table not found" error, no point in trying other columns
    if (error.message.includes('Could not find the table')) break
  }

  console.error(`❌ Failed to clear ${table}:`, lastError.message)
  return false
}

async function run() {
  console.log('🚀 Starting database data wipe (Schema will be preserved)...')

  let successCount = 0
  for (const table of tables) {
    const success = await clearTable(table)
    if (success) successCount++
  }

  console.log(`\n✨ Finished. Cleared ${successCount}/${tables.length} tables.`)
  if (successCount < tables.length) {
    console.warn('⚠️ Some tables could not be cleared (likely due to foreign key constraints or missing filters).')
    console.warn('Suggestion: Run the script again; order-dependent tables often clear on the second pass.')
  }
}

run().catch(err => {
  console.error('FATAL ERROR:', err)
  process.exit(1)
})
