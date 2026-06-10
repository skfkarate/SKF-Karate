#!/usr/bin/env node
/**
 * seed-mrithika-p.mjs
 *
 * Adds Mrithika P (SKF25HE003) to the Herohalli branch:
 *   1. Upserts athlete profile with achievements & points
 *   2. Upserts billing profile
 *   3. Upserts fee records for Jan–Dec 2026
 *      - Jan–May: break (long gap)
 *      - June onwards: due (resuming this month)
 *
 * Safe to re-run — uses upserts with conflict resolution.
 *
 * Usage:
 *   node scripts/seed-mrithika-p.mjs
 */

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

const NOW = new Date().toISOString()

/* ═══════════════════ Constants ═══════════════════ */

const BRANCH_NAME = 'Herohalli'
const TARGET_YEAR = 2026
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/* ═══════════════════ Student Data ═══════════════════ */

const STUDENT = {
  skfId: 'SKF25HE003',
  firstName: 'Mrithika',
  lastName: 'P',
  dateOfBirth: '2015-02-06',
  gender: 'female',
  joinDate: '2025-01-01',
  parentName: 'Prakash D',
  phone: '9108699585',
  email: '',
  monthlyFee: 500,
  currentBelt: 'yellow',
}

/* ═══════════════════ Helpers ═══════════════════ */

/* ═══════════════════ Main ═══════════════════ */

async function main() {
  console.log('═══════════════════════════════════════')
  console.log(' Adding Mrithika P (SKF25HE003) — Herohalli')
  console.log('═══════════════════════════════════════\n')

  // ─── Step 1: Upsert athlete profile ───
  console.log('Step 1: Upserting athlete profile...')

  const achievements = [
    {
      id: 'ach_skf25he003_yellow_belt',
      type: 'belt-grading',
      date: '2025-07-12',
      title: 'Passed Yellow Belt Grading',
      description: 'SKF Progressive Kyu Examination – June 2025',
      beltEarned: 'Yellow Belt',
      grade: 'A',
      result: 'pass',
      examiner: 'Dr. Renshi Channegowda UC',
      location: BRANCH_NAME,
      pointsAwarded: 100,
    },
    {
      id: 'ach_skf25he003_enrollment',
      type: 'enrollment',
      date: '2025-01-01',
      title: 'Joined SKF Karate as White Belt',
      description: `Enrolled at ${BRANCH_NAME} branch.`,
      beltEarned: 'white',
      grade: 'Enrollment',
      result: 'pass',
      awardedBy: 'SKF Admissions',
      location: BRANCH_NAME,
      pointsAwarded: 50,
    },
  ]

  const pointsHistory = [
    {
      id: 'points_ach_skf25he003_enrollment',
      date: '2025-01-01',
      type: 'enrollment',
      title: 'Joined SKF Karate as White Belt',
      points: 50,
      balanceAfter: 50,
      sourceAchievementId: 'ach_skf25he003_enrollment',
    },
    {
      id: 'points_ach_skf25he003_yellow_belt',
      date: '2025-07-12',
      type: 'belt-grading',
      title: 'Passed Yellow Belt Grading',
      points: 100,
      balanceAfter: 150,
      sourceAchievementId: 'ach_skf25he003_yellow_belt',
    },
  ]

  const athletePayload = {
    id: `athlete_herohalli_${STUDENT.skfId.toLowerCase()}`,
    skf_id: STUDENT.skfId,
    first_name: STUDENT.firstName,
    last_name: STUDENT.lastName,
    date_of_birth: STUDENT.dateOfBirth,
    gender: STUDENT.gender,
    photo_url: '/no-profile/no profile female.png',
    branch_name: BRANCH_NAME,
    current_belt: STUDENT.currentBelt,
    join_date: STUDENT.joinDate,
    status: 'active',
    parent_name: STUDENT.parentName,
    phone: STUDENT.phone,
    email: STUDENT.email || null,
    batch: null,
    monthly_fee: STUDENT.monthlyFee,
    photo_consent: false,
    is_public: true,
    is_featured: false,
    achievements,
    points_history: pointsHistory,
    points_balance: 150,
    points_lifetime: 150,
    attendance_rate: null,
    created_at: NOW,
    updated_at: NOW,
  }

  // Check if athlete exists
  const { data: existing } = await supabase
    .from('athletes')
    .select('id')
    .eq('skf_id', STUDENT.skfId)
    .maybeSingle()

  if (existing) {
    const updatePayload = { ...athletePayload }
    delete updatePayload.id
    delete updatePayload.created_at
    const { error } = await supabase
      .from('athletes')
      .update(updatePayload)
      .eq('skf_id', STUDENT.skfId)
    if (error) throw new Error(`Athlete update failed: ${error.message}`)
    console.log(`  ✓ Updated existing athlete ${STUDENT.skfId}`)
  } else {
    const { error } = await supabase
      .from('athletes')
      .upsert(athletePayload, { onConflict: 'skf_id' })
    if (error) throw new Error(`Athlete upsert failed: ${error.message}`)
    console.log(`  ✓ Inserted new athlete ${STUDENT.skfId} — ${STUDENT.firstName} ${STUDENT.lastName}`)
  }

  // ─── Step 2: Upsert billing profile ───
  console.log('\nStep 2: Upserting billing profile...')

  const billingPayload = {
    skf_id: STUDENT.skfId,
    billing_status: 'active',
    monthly_fee: STUDENT.monthlyFee,
    admission_fee: 0,
    dress_fee: 0,
    dress_cost: 0,
    billing_start_date: STUDENT.joinDate,
    billing_end_date: null,
    branch_snapshot: BRANCH_NAME,
    updated_at: NOW,
  }

  const { error: billingError } = await supabase
    .from('student_billing_profiles')
    .upsert(billingPayload, { onConflict: 'skf_id' })

  if (billingError) throw new Error(`Billing profile upsert failed: ${billingError.message}`)
  console.log(`  ✓ Billing profile: ₹${STUDENT.monthlyFee}/month, active`)

  // ─── Step 3: Upsert fee records for 2026 ───
  console.log('\nStep 3: Upserting fee records for 2026...')

  // Jan–May = break (long gap), June onwards = due (resuming)
  const RESUMING_MONTH_INDEX = 5 // June = index 5

  for (let i = 0; i < MONTHS.length; i++) {
    const month = MONTHS[i]
    const isBreak = i < RESUMING_MONTH_INDEX
    const status = isBreak ? 'break' : 'due'

    const feePayload = {
      skf_id: STUDENT.skfId,
      fee_type: 'monthly',
      month,
      year: TARGET_YEAR,
      amount: STUDENT.monthlyFee,
      status,
      paid_date: null,
      receipt_id: null,
      payment_method: null,
      verified_by: null,
      verified_at: null,
      rejected_reason: null,
      notes: isBreak ? 'Long gap — not attending' : null,
      source_key: '',
      metadata: {
        seededFrom: 'scripts/seed-mrithika-p.mjs',
        source: 'manual Herohalli 2026 — Mrithika P addition',
      },
      updated_at: NOW,
    }

    const { error: feeError } = await supabase
      .from('fee_records')
      .upsert(feePayload, { onConflict: 'skf_id,fee_type,month,year,source_key' })

    if (feeError) {
      console.error(`  ✗ ${month} ${TARGET_YEAR}: ${feeError.message}`)
    } else {
      const icon = isBreak ? '○' : '●'
      console.log(`  ${icon} ${month} ${TARGET_YEAR}: ${status} (₹${STUDENT.monthlyFee})`)
    }
  }

  // ─── Summary ───
  console.log('\n═══════════════════════════════════════')
  console.log(' Seed Complete — Mrithika P (SKF25HE003)')
  console.log('   Athlete: ✓')
  console.log('   Billing Profile: ✓')
  console.log('   Fee Records: 12 (5 break + 7 due)')
  console.log('   Achievements: 2 (White Belt + Yellow Belt)')
  console.log('   Points: 150 (50 + 100)')
  console.log('═══════════════════════════════════════\n')
}

main().catch((err) => {
  console.error('\nFATAL:', err)
  process.exit(1)
})
