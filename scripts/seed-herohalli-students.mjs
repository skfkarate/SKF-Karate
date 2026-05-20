/**
 * seed-herohalli-students.mjs
 *
 * Seeds 18 Herohalli branch students into the `athletes` table
 * and enrolls 6 of them in the active Black Belt program.
 *
 * Safe to re-run — uses upserts with `skf_id` conflict resolution.
 *
 * Usage:
 *   node scripts/seed-herohalli-students.mjs
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

/**
 * Upsert with automatic fallback: if Supabase reports a missing column,
 * remove that column from the payload and retry (up to 10 times).
 */
async function upsertWithFallback(table, payload, conflictKey) {
  const data = { ...payload }
  const dropped = []
  for (let attempt = 0; attempt < 10; attempt++) {
    const { error } = await supabase.from(table).upsert(data, { onConflict: conflictKey })
    if (!error) return { ok: true, dropped }
    const match = error.message?.match(/Could not find the '([^']+)' column/)
    if (match && match[1] in data) {
      dropped.push(match[1])
      delete data[match[1]]
      continue
    }
    return { ok: false, error: error.message, dropped }
  }
  return { ok: false, error: 'Too many missing columns', dropped }
}
const BRANCH_NAME = 'Herohalli'

/* ═══════════════════ Student Data ═══════════════════ */

// Columns: skf_id, name, dob (DD/MM/YYYY or ''), gender, parent_name, phone, alt_phone, email, join_date, status
const RAW_STUDENTS = [
  ['SKF17BL000', 'SHRIROSHAN P',       '03/07/2007', 'M', 'Prasad M',        '7795840272', '7795840272', 'shriroshanp@gmail.com',            '',           'Active'],
  ['SKF20HE001', 'SANJANA S',          '16/03/2007', 'F', 'Shivanna. H G',   '9008069437', '9008069437', 'shivannahg4@gmail.com',            '',           'Active'],
  ['SKF20HE002', 'TEJASHREE S',        '21/12/2011', 'F', 'Shivanna. H G',   '8892544741', '8892544741', 'shivannahg4@gmail.com',            '',           'Active'],
  ['SKF20HE003', 'AYUSH KASHYAP G',    '17/08/2014', 'M', 'Girish',          '9743804467', '9743804467', 'srikrishnakalamandir50@gmail.com', '',           'Active'],
  ['SKF21HE001', 'ISHAAN GOWDA B S',   '30/03/2009', 'M', 'Suresh M',        '8147043216', '8147043216', 'ishaangowda3027@gmail.com',        '08/01/2021', 'Active'],
  ['SKF21HE002', 'JNANAVIRAM',         '15/07/2015', 'F', 'Ramu G',          '7795280342', '7795280342', 'ramugowda21s@gmail.com',            '',           'Active'],
  ['SKF21HE003', 'SHASHANK',           '',           'M', '',                 '',           '',           '',                                 '',           'Active'],
  ['SKF21HE004', 'PRANAV',             '',           'M', '',                 '',           '',           '',                                 '',           'Active'],
  ['SKF23HE001', 'HARSHA KUMAR S P',   '02/12/2012', 'M', 'Puttaraju S B',   '9972734491', '9972734491', 'puttarajuputtu00225@gmail.com',    '',           'Active'],
  ['SKF23HE002', 'VEDANK GOWDA K',     '',           'M', '',                 '',           '',           '',                                 '',           'NOT ACTIVE'],
  ['SKF23HE003', 'DEEKSHARAM',         '07/09/2017', 'F', 'Ramu G',          '7795280342', '7795280342', 'ramugowda21s@gmail.com',            '',           'Active'],
  ['SKF23HE004', 'MANOGNA B N',        '03/06/2014', 'F', 'Narayana B N',    '9113549736', '9113549736', 'prithviraj219bescom@gmail.com',    '',           'Active'],
  ['SKF23HE005', 'PRITHVI RAJ B N',    '21/09/2012', 'M', 'Narayana B N',    '9113549736', '9113549736', 'prithviraj219bescom@gmail.com',    '',           'Active'],
  ['SKF23HE006', 'KUSHAL GOWDA K',     '28/11/2015', 'M', 'Kumar M S',       '9008099968', '9008099968', 'kumarradhakushsl@gmail.com',       '',           'Active'],
  ['SKF24HE001', 'KUSHIL V',           '21/01/2017', 'M', 'Venkatesh S',     '9620512480', '9620512480', 'kushivenki7527@gmail.com',         '',           'Active'],
  ['SKF25HE001', 'LIKHITH GOWDA U R',  '01/02/2020', 'M', 'Rajesh U N',      '9880952278', '9880952278', 'rajeshun1984@gmail.com',           '',           'Active'],
  ['SKF25HE002', 'MANAV',              '',           'M', '',                 '9686244845', '9686244845', '',                                 '',           'NOT ACTIVE'],
  ['SKF26HE001', 'M MONISHPRASAD',     '24/07/2020', 'M', 'Murthy G K',      '6366669065', '6366669065', '',                                 '',           'Active'],
]

// SKF IDs for Black Belt program enrollment
const BB_CANDIDATE_SKF_IDS = [
  'SKF17BL000',
  'SKF20HE001',
  'SKF20HE002',
  'SKF20HE003',
  'SKF21HE001',
  'SKF21HE003',
]

/* ═══════════════════ Helpers ═══════════════════ */

/**
 * Parse DD/MM/YYYY to YYYY-MM-DD. Returns '2000-01-01' if missing.
 */
function parseDob(raw) {
  if (!raw || !raw.trim()) return '2000-01-01'
  const parts = raw.trim().split('/')
  if (parts.length !== 3) return '2000-01-01'
  const [dd, mm, yyyy] = parts
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`
}

function parseJoinDate(raw) {
  if (!raw || !raw.trim()) return null
  const parts = raw.trim().split('/')
  if (parts.length !== 3) return null
  const [dd, mm, yyyy] = parts
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`
}

function titleCase(str) {
  return str
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

function splitName(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { firstName: 'SKF', lastName: 'Athlete' }
  if (parts.length === 1) return { firstName: titleCase(parts[0]), lastName: '' }
  return {
    firstName: titleCase(parts[0]),
    lastName: parts.slice(1).map((p) => titleCase(p)).join(' '),
  }
}

function inferJoinYear(skfId) {
  // SKF17BL000 → 2017, SKF20HE001 → 2020, etc.
  const match = skfId.match(/^SKF(\d{2})/)
  if (!match) return new Date().getFullYear()
  const twoDigit = parseInt(match[1], 10)
  return twoDigit >= 0 && twoDigit <= 50 ? 2000 + twoDigit : 1900 + twoDigit
}

/* ═══════════════════ Main ═══════════════════ */

async function main() {
  console.log('═══════════════════════════════════════')
  console.log(' Seeding Herohalli Branch Students')
  console.log('═══════════════════════════════════════\n')

  // ─── Step 1: Upsert all students into athletes table ───
  const athletePayloads = RAW_STUDENTS.map((row) => {
    const [skfId, rawName, rawDob, gender, parentName, phone, , email, rawJoinDate, rawStatus] = row

    const { firstName, lastName } = splitName(rawName)
    const dob = parseDob(rawDob)
    const joinDate = parseJoinDate(rawJoinDate) || `${inferJoinYear(skfId)}-01-01`
    const isActive = rawStatus.trim().toUpperCase() === 'ACTIVE'

    return {
      id: `athlete_herohalli_${skfId.toLowerCase()}`,
      skf_id: skfId,
      first_name: firstName,
      last_name: lastName,
      date_of_birth: dob,
      gender: gender === 'F' ? 'female' : 'male',
      photo_url: gender === 'F'
        ? '/no-profile/no profile female.png'
        : '/no-profile/no profile male.png',
      branch_name: BRANCH_NAME,
      current_belt: 'white',
      join_date: joinDate,
      status: isActive ? 'active' : 'inactive',
      parent_name: parentName || null,
      phone: phone || null,
      email: email || null,
      batch: null,
      monthly_fee: 0,
      photo_consent: false,
      is_public: true,
      is_featured: false,
      achievements: [
        {
          id: `ach_${skfId.toLowerCase()}_enrollment`,
          type: 'enrollment',
          date: joinDate,
          title: 'Joined SKF Karate as White Belt',
          description: `Enrolled at ${BRANCH_NAME} branch.`,
          beltEarned: 'white',
          grade: 'Enrollment',
          result: 'pass',
          awardedBy: 'SKF Karate',
          location: BRANCH_NAME,
          pointsAwarded: 50,
        },
      ],
      points_history: [
        {
          id: `points_ach_${skfId.toLowerCase()}_enrollment`,
          date: joinDate,
          type: 'enrollment',
          title: 'Joined SKF Karate as White Belt',
          points: 50,
          balanceAfter: 50,
          sourceAchievementId: `ach_${skfId.toLowerCase()}_enrollment`,
        },
      ],
      points_balance: 50,
      points_lifetime: 50,
      attendance_rate: null,
      created_at: NOW,
      updated_at: NOW,
    }
  })

  console.log(`Upserting ${athletePayloads.length} athletes...`)

  for (const payload of athletePayloads) {
    const result = await upsertWithFallback('athletes', payload, 'skf_id')

    if (!result.ok) {
      console.error(`  ✗ ${payload.skf_id} (${payload.first_name} ${payload.last_name}):`, result.error)
    } else {
      const statusLabel = payload.status === 'active' ? '✓' : '○'
      const dobLabel = payload.date_of_birth === '2000-01-01' ? ' [DOB placeholder]' : ''
      console.log(`  ${statusLabel} ${payload.skf_id} — ${payload.first_name} ${payload.last_name}${dobLabel}`)
    }
  }

  // ─── Step 2: Find the active Black Belt program ───
  console.log('\n─── Black Belt Program Enrollment ───\n')

  let { data: bbProgram, error: bbError } = await supabase
    .from('bb_programs')
    .select('id, title, status')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (bbError) {
    console.error('Could not query bb_programs:', bbError.message)
    console.log('Skipping Black Belt enrollment. You can re-run after creating a BB program.')
    return
  }

  if (!bbProgram) {
    console.log('No active Black Belt program found.')
    console.log('Creating a default Black Belt program...')

    const { data: newProgram, error: createError } = await supabase
      .from('bb_programs')
      .insert({
        title: 'Black Belt Examination 2026',
        slug: 'bb-exam-2026',
        tagline: 'SKF Karate Black Belt Examination Program',
        exam_date: '2026-10-19',
        program_start: '2026-05-19',
        program_end: '2026-10-19',
        status: 'active',
        exam_components: [],
        wkf_documents: [],
        config: {},
      })
      .select('id, title')
      .single()

    if (createError) {
      console.error('Failed to create BB program:', createError.message)
      console.log('Skipping Black Belt enrollment.')
      return
    }

    console.log(`  Created program: "${newProgram.title}" (${newProgram.id})`)
    bbProgram = newProgram
  } else {
    console.log(`Active program: "${bbProgram.title}" (${bbProgram.id})`)
  }

  // ─── Step 3: Enroll BB candidates ───
  console.log('')

  for (let i = 0; i < BB_CANDIDATE_SKF_IDS.length; i++) {
    const skfId = BB_CANDIDATE_SKF_IDS[i]
    const student = RAW_STUDENTS.find((r) => r[0] === skfId)
    if (!student) {
      console.error(`  ✗ ${skfId} — not found in student data`)
      continue
    }

    const displayName = titleCase(student[1])

    const candidatePayload = {
      program_id: bbProgram.id,
      skf_id: skfId,
      display_name: displayName,
      display_code: `BB-${String(i + 1).padStart(2, '0')}`,
      photo_url: null,
      weapon_group: 'bo_staff',
      bunkai_group: i % 2 === 0 ? 'group_a' : 'group_b',
      self_defense_day: 'saturday',

      first_aid_status: 'not_started',
      marketing_status: 'in_progress',
      tournament_kata_status: 'not_won',
      tournament_kumite_status: 'not_won',

      fitness_baseline_done: false,
      fitness_baseline_data: {},
      fitness_retest_done: false,
      fitness_retest_data: {},
      fitness_improved: null,

      wkf_kumite_status: 'not_started',
      wkf_kata_status: 'not_started',
      wkf_referee_status: 'not_started',

      weapon_status: 'not_started',
      bunkai_status: 'not_done',

      self_defense_months: { month_1: false, month_2: false, month_3: false, month_4: false },

      video_count: 0,
      video_target: 16,

      teaching_status: 'active',
      mock_exam_done: false,
      readiness: 'attention_needed',

      exam_score: null,
      exam_result: null,
      exam_component_scores: {},

      instructor_notes: '',
      sort_order: i + 1,
    }

    const candidateResult = await upsertWithFallback('bb_candidates', candidatePayload, 'program_id,skf_id')

    if (!candidateResult.ok) {
      console.error(`  ✗ ${skfId} (${displayName}):`, candidateResult.error)
    } else {
      console.log(`  ✓ ${skfId} — ${displayName} enrolled as ${candidatePayload.display_code}`)
    }
  }

  // ─── Summary ───
  console.log('\n═══════════════════════════════════════')
  console.log(' Seed Complete')
  console.log(`   Athletes upserted: ${athletePayloads.length}`)
  console.log(`   BB candidates enrolled: ${BB_CANDIDATE_SKF_IDS.length}`)
  console.log('═══════════════════════════════════════\n')
}

main().catch((err) => {
  console.error('\nFATAL:', err)
  process.exit(1)
})
