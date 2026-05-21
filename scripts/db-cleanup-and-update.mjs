import fs from 'node:fs'
import { createClient } from '@supabase/supabase-js'

/* ═══════════════════ Env + Supabase ═══════════════════ */

function readEnvFile(path) {
  if (!fs.existsSync(path)) return {}
  return Object.fromEntries(
    fs
      .readFileSync(path, 'utf8')
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .filter((l) => !l.startsWith('#'))
      .filter((l) => l.includes('='))
      .map((l) => {
        const i = l.indexOf('=')
        return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, '').replace(/\\n/g, '\n')]
      })
  )
}

const env = { ...readEnvFile('.env'), ...readEnvFile('.env.local'), ...process.env }
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.')
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  console.log('═══════════════════════════════════════')
  console.log(' Running Database Clean-up & Updates')
  console.log('═══════════════════════════════════════\n')

  const targetSkfId = 'SKF01MP999'

  // 1. Get athlete internal ID to clear any references using athlete_id
  const { data: athleteRecord } = await supabase
    .from('athletes')
    .select('id')
    .eq('skf_id', targetSkfId)
    .maybeSingle()

  const athleteId = athleteRecord?.id
  console.log(`Target SKF ID: ${targetSkfId}, Internal ID: ${athleteId || 'Not found'}`)

  // 2. Delete SKF01MP999 from all related tables
  const tablesWithSkfId = [
    'enrollments',
    'certificates',
    'certificate_views',
    'certificate_events',
    'ranking_snapshots',
    'video_progress',
    'fee_records',
    'fee_payment_proofs',
    'fee_payment_intents',
    'fee_receipts',
    'fee_followups',
    'fee_reminder_logs',
    'push_subscriptions',
    'student_points',
    'point_transactions',
    'notifications',
    'skf_shop_orders',
    'auth_sessions',
    'bb_candidates',
    'student_billing_profiles'
  ]

  for (const table of tablesWithSkfId) {
    const { count, error } = await supabase
      .from(table)
      .delete({ count: 'exact' })
      .eq('skf_id', targetSkfId)

    if (error) {
      console.error(`  ✗ Error deleting from ${table}:`, error.message)
    } else {
      console.log(`  ✓ Deleted ${count || 0} rows from ${table}`)
    }
  }

  // Delete from ranking_snapshots by athlete_id if found
  if (athleteId) {
    const { count, error } = await supabase
      .from('ranking_snapshots')
      .delete({ count: 'exact' })
      .eq('athlete_id', athleteId)

    if (error) {
      console.error(`  ✗ Error deleting from ranking_snapshots by athlete_id:`, error.message)
    } else {
      console.log(`  ✓ Deleted ${count || 0} rows from ranking_snapshots by athlete_id`)
    }
  }

  // Delete from main athletes table
  const { count: athleteCount, error: athleteError } = await supabase
    .from('athletes')
    .delete({ count: 'exact' })
    .eq('skf_id', targetSkfId)

  if (athleteError) {
    console.error(`  ✗ Error deleting from athletes:`, athleteError.message)
  } else {
    console.log(`  ✓ Deleted ${athleteCount || 0} rows from athletes`)
  }

  console.log('\n─── Herohalli Branch Fees Update ───\n')

  // 3. Query all Herohalli athletes
  const { data: herohalliAthletes, error: queryError } = await supabase
    .from('athletes')
    .select('skf_id, first_name, last_name')
    .eq('branch_name', 'Herohalli')

  if (queryError) {
    console.error('Failed to query Herohalli athletes:', queryError.message)
    return
  }

  console.log(`Found ${herohalliAthletes.length} Herohalli athletes in database.`)

  for (const athlete of herohalliAthletes) {
    const skfId = athlete.skf_id
    const fullName = `${athlete.first_name} ${athlete.last_name}`
    let fee = 400

    if (skfId === 'SKF17BL000') {
      fee = 1000
    } else if (skfId === 'SKF21HE003') {
      fee = 500
    } else if (skfId === 'SKF21HE002' || skfId === 'SKF23HE003') {
      // Keep concession zero-fee students
      fee = 0
    }

    console.log(`Updating ${skfId} (${fullName}) to fee: ${fee}`)

    // Update athletes table
    const { error: athleteUpdateError } = await supabase
      .from('athletes')
      .update({ monthly_fee: fee })
      .eq('skf_id', skfId)

    if (athleteUpdateError) {
      console.error(`  ✗ Failed to update monthly_fee in athletes for ${skfId}:`, athleteUpdateError.message)
    }

    // Update student_billing_profiles table (upsert if missing)
    const { error: billingUpdateError } = await supabase
      .from('student_billing_profiles')
      .upsert({
        skf_id: skfId,
        monthly_fee: fee,
        updated_at: new Date().toISOString()
      }, { onConflict: 'skf_id' })

    if (billingUpdateError) {
      console.error(`  ✗ Failed to upsert student_billing_profile for ${skfId}:`, billingUpdateError.message)
    }
  }

  console.log('\n═══════════════════════════════════════')
  console.log(' Database Update Operations Complete')
  console.log('═══════════════════════════════════════\n')
}

main().catch((err) => {
  console.error('\nFATAL:', err)
  process.exit(1)
})
