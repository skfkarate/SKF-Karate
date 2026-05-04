import fs from 'node:fs'

import { createClient } from '@supabase/supabase-js'

const REFERENCE_ATHLETE_ID = 'athlete_reference_aarav_rao'
const REFERENCE_SKF_ID = 'SKF01MP999'
const BRANCH_NAME = 'M P Sports Club'
const NOW = new Date().toISOString()

const EVENT_TIER_WEIGHTS = {
  international: 12,
  national: 8,
  state: 5,
  district: 3,
  invitational: 2,
  'inter-dojo': 2,
  open: 2,
}

const RESULT_BASE_POINTS = {
  gold: 100,
  silver: 70,
  bronze: 50,
  '5th-place': 30,
  participation: 10,
}

const TOURNAMENT_DIFFICULTY_FACTORS = {
  1: 1,
  2: 1.15,
  3: 1.3,
  4: 1.45,
  5: 1.6,
}

function readEnvFile(path) {
  if (!fs.existsSync(path)) return {}

  return Object.fromEntries(
    fs
      .readFileSync(path, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => !line.startsWith('#'))
      .filter((line) => line.includes('='))
      .map((line) => {
        const separatorIndex = line.indexOf('=')
        return [
          line.slice(0, separatorIndex),
          line.slice(separatorIndex + 1).replace(/^"|"$/g, '').replace(/\\n/g, '\n'),
        ]
      })
  )
}

function buildSupabaseClient() {
  const env = {
    ...readEnvFile('.env'),
    ...readEnvFile('.env.local'),
    ...process.env,
  }

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

function calculateTournamentPoints({ tournamentLevel, result, difficultyLevel, wins }) {
  const tier = EVENT_TIER_WEIGHTS[tournamentLevel] ? tournamentLevel : 'invitational'
  const basePoints = RESULT_BASE_POINTS[result] ?? RESULT_BASE_POINTS.participation
  const multiplier = EVENT_TIER_WEIGHTS[tier] ?? EVENT_TIER_WEIGHTS.invitational
  const difficultyFactor = TOURNAMENT_DIFFICULTY_FACTORS[difficultyLevel] ?? 1
  const winsBonus = Number(wins || 0) * Math.max(4, Math.round(multiplier * 2))

  return Number(((basePoints * multiplier * difficultyFactor) + winsBonus).toFixed(2))
}

function beltAchievement({
  id,
  date,
  title,
  beltEarned,
  grade,
  pointsAwarded = 180,
  examiner = 'SKF Examination Panel',
}) {
  return {
    id,
    type: beltEarned === 'white' ? 'enrollment' : 'belt-pass',
    date,
    title,
    description: `Reference progression record for ${title}.`,
    beltEarned,
    grade,
    result: 'pass',
    examiner,
    awardedBy: examiner,
    location: BRANCH_NAME,
    pointsAwarded,
  }
}

function tournamentAchievement({
  id,
  date,
  tournamentName,
  tournamentLevel,
  result,
  eventCategory,
  ageGroup = 'senior',
  weightCategory = 'open',
  difficultyLevel = 5,
  wins = 5,
  location,
}) {
  const pointsAwarded = calculateTournamentPoints({
    tournamentLevel,
    result,
    difficultyLevel,
    wins,
  })
  const medalTitle = result.charAt(0).toUpperCase() + result.slice(1)

  return {
    id,
    type: `tournament-${result}`,
    date,
    title: `${medalTitle} Medal - ${tournamentName}`,
    description: `Reference ${eventCategory} tournament result for an all-round karate athlete.`,
    tournamentName,
    tournamentLevel,
    sourceEventLevel: tournamentLevel,
    eventCategory,
    ageGroup,
    weightCategory,
    difficultyLevel,
    wins,
    competitionResult: result,
    result,
    awardedBy: 'SKF Results Desk',
    location,
    pointsAwarded,
  }
}

function specialAchievement({
  id,
  type,
  date,
  title,
  sourceEventType,
  location,
  description,
  pointsAwarded,
  awardedBy = 'SKF Karate',
}) {
  return {
    id,
    type,
    date,
    title,
    sourceEventType,
    location,
    description,
    awardReason: description,
    result: 'completed',
    awardedBy,
    pointsAwarded,
  }
}

const beltAchievements = [
  beltAchievement({
    id: 'ach_ref_aarav_belt_001_white',
    date: '2001-06-04',
    title: 'Joined SKF Karate as White Belt',
    beltEarned: 'white',
    grade: 'Enrollment',
    pointsAwarded: 50,
    examiner: 'SKF Karate',
  }),
  beltAchievement({
    id: 'ach_ref_aarav_belt_002_yellow',
    date: '2002-02-10',
    title: 'Yellow Belt Promotion',
    beltEarned: 'yellow',
    grade: 'A+',
  }),
  beltAchievement({
    id: 'ach_ref_aarav_belt_003_orange',
    date: '2002-11-20',
    title: 'Orange Belt Promotion',
    beltEarned: 'orange',
    grade: 'A+',
  }),
  beltAchievement({
    id: 'ach_ref_aarav_belt_004_green',
    date: '2003-09-14',
    title: 'Green Belt Promotion',
    beltEarned: 'green',
    grade: 'A+',
  }),
  beltAchievement({
    id: 'ach_ref_aarav_belt_005_blue',
    date: '2004-08-22',
    title: 'Blue Belt Promotion',
    beltEarned: 'blue',
    grade: 'A+',
  }),
  beltAchievement({
    id: 'ach_ref_aarav_belt_006_brown',
    date: '2005-11-30',
    title: 'Brown Belt Promotion',
    beltEarned: 'brown',
    grade: 'A+',
  }),
  beltAchievement({
    id: 'ach_ref_aarav_belt_007_black_1st',
    date: '2008-12-20',
    title: 'Black Belt 1st Dan Promotion',
    beltEarned: 'black-1st-dan',
    grade: 'Shodan - Distinction',
  }),
  beltAchievement({
    id: 'ach_ref_aarav_belt_008_black_2nd',
    date: '2012-12-16',
    title: 'Black Belt 2nd Dan Promotion',
    beltEarned: 'black-2nd-dan',
    grade: 'Nidan - Distinction',
  }),
  beltAchievement({
    id: 'ach_ref_aarav_belt_009_black_3rd',
    date: '2016-12-18',
    title: 'Black Belt 3rd Dan Promotion',
    beltEarned: 'black-3rd-dan',
    grade: 'Sandan - Distinction',
  }),
  beltAchievement({
    id: 'ach_ref_aarav_belt_010_black_4th',
    date: '2020-12-20',
    title: 'Black Belt 4th Dan Promotion',
    beltEarned: 'black-4th-dan',
    grade: 'Yondan - Distinction',
  }),
  beltAchievement({
    id: 'ach_ref_aarav_belt_011_black_5th',
    date: '2025-12-21',
    title: 'Black Belt 5th Dan Promotion',
    beltEarned: 'black-5th-dan',
    grade: 'Godan - Distinction',
  }),
]

const tournamentAchievements = [
  tournamentAchievement({
    id: 'ach_ref_aarav_tournament_001',
    date: '2026-04-28',
    tournamentName: 'SKF National Elite Cup 2026',
    tournamentLevel: 'national',
    result: 'gold',
    eventCategory: 'kata-individual',
    weightCategory: 'open',
    difficultyLevel: 5,
    wins: 7,
    location: 'Bengaluru, Karnataka',
  }),
  tournamentAchievement({
    id: 'ach_ref_aarav_tournament_002',
    date: '2026-04-27',
    tournamentName: 'Karnataka Open Kumite League 2026',
    tournamentLevel: 'state',
    result: 'gold',
    eventCategory: 'kumite-individual',
    weightCategory: '-75kg',
    difficultyLevel: 5,
    wins: 8,
    location: 'Bengaluru, Karnataka',
  }),
  tournamentAchievement({
    id: 'ach_ref_aarav_tournament_003',
    date: '2026-03-16',
    tournamentName: 'South India Karate Championship',
    tournamentLevel: 'national',
    result: 'gold',
    eventCategory: 'kata-team',
    weightCategory: 'team',
    difficultyLevel: 5,
    wins: 6,
    location: 'Chennai, Tamil Nadu',
  }),
  tournamentAchievement({
    id: 'ach_ref_aarav_tournament_004',
    date: '2026-02-22',
    tournamentName: 'Bengaluru District Kumite Championship',
    tournamentLevel: 'district',
    result: 'gold',
    eventCategory: 'kumite-team',
    weightCategory: 'team',
    difficultyLevel: 4,
    wins: 7,
    location: 'Bengaluru, Karnataka',
  }),
  tournamentAchievement({
    id: 'ach_ref_aarav_tournament_005',
    date: '2026-01-19',
    tournamentName: 'India All Style Karate Open',
    tournamentLevel: 'international',
    result: 'gold',
    eventCategory: 'mixed',
    weightCategory: 'open',
    difficultyLevel: 5,
    wins: 9,
    location: 'New Delhi, India',
  }),
  tournamentAchievement({
    id: 'ach_ref_aarav_tournament_006',
    date: '2025-12-14',
    tournamentName: 'KIO National Karate Championship',
    tournamentLevel: 'national',
    result: 'gold',
    eventCategory: 'kata-individual',
    weightCategory: 'open',
    difficultyLevel: 5,
    wins: 6,
    location: 'Pune, Maharashtra',
  }),
  tournamentAchievement({
    id: 'ach_ref_aarav_tournament_007',
    date: '2025-11-17',
    tournamentName: 'WKF Invitational Karate Challenge',
    tournamentLevel: 'international',
    result: 'silver',
    eventCategory: 'kumite-individual',
    weightCategory: '-75kg',
    difficultyLevel: 5,
    wins: 7,
    location: 'Dubai, UAE',
  }),
  tournamentAchievement({
    id: 'ach_ref_aarav_tournament_008',
    date: '2025-09-20',
    tournamentName: 'Karnataka State Karate Championship',
    tournamentLevel: 'state',
    result: 'gold',
    eventCategory: 'kata-individual',
    weightCategory: 'open',
    difficultyLevel: 5,
    wins: 5,
    location: 'Mysuru, Karnataka',
  }),
  tournamentAchievement({
    id: 'ach_ref_aarav_tournament_009',
    date: '2025-08-10',
    tournamentName: 'Bengaluru Open Team Kata Cup',
    tournamentLevel: 'state',
    result: 'gold',
    eventCategory: 'kata-team',
    weightCategory: 'team',
    difficultyLevel: 4,
    wins: 5,
    location: 'Bengaluru, Karnataka',
  }),
  tournamentAchievement({
    id: 'ach_ref_aarav_tournament_010',
    date: '2025-06-21',
    tournamentName: 'District SKF Inter Dojo Cup',
    tournamentLevel: 'district',
    result: 'gold',
    eventCategory: 'mixed',
    weightCategory: 'open',
    difficultyLevel: 4,
    wins: 6,
    location: 'Bengaluru, Karnataka',
  }),
  tournamentAchievement({
    id: 'ach_ref_aarav_tournament_011',
    date: '2025-04-12',
    tournamentName: 'Karnataka State Kumite League',
    tournamentLevel: 'state',
    result: 'gold',
    eventCategory: 'kumite-individual',
    weightCategory: '-75kg',
    difficultyLevel: 5,
    wins: 7,
    location: 'Hubballi, Karnataka',
  }),
  tournamentAchievement({
    id: 'ach_ref_aarav_tournament_012',
    date: '2024-12-08',
    tournamentName: 'National School Games Karate',
    tournamentLevel: 'national',
    result: 'gold',
    eventCategory: 'kumite-team',
    weightCategory: 'team',
    difficultyLevel: 5,
    wins: 6,
    location: 'Jaipur, Rajasthan',
  }),
  tournamentAchievement({
    id: 'ach_ref_aarav_tournament_013',
    date: '2024-10-04',
    tournamentName: 'All India Open Karate Championship',
    tournamentLevel: 'national',
    result: 'gold',
    eventCategory: 'kata-individual',
    weightCategory: 'open',
    difficultyLevel: 5,
    wins: 6,
    location: 'Hyderabad, Telangana',
  }),
  tournamentAchievement({
    id: 'ach_ref_aarav_tournament_014',
    date: '2024-07-18',
    tournamentName: 'South Asian Karate Open',
    tournamentLevel: 'international',
    result: 'bronze',
    eventCategory: 'kata-individual',
    weightCategory: 'open',
    difficultyLevel: 5,
    wins: 5,
    location: 'Kathmandu, Nepal',
  }),
  tournamentAchievement({
    id: 'ach_ref_aarav_tournament_015',
    date: '2024-05-26',
    tournamentName: 'Bengaluru District Kata Championship',
    tournamentLevel: 'district',
    result: 'gold',
    eventCategory: 'kata-individual',
    weightCategory: 'open',
    difficultyLevel: 4,
    wins: 5,
    location: 'Bengaluru, Karnataka',
  }),
  tournamentAchievement({
    id: 'ach_ref_aarav_tournament_016',
    date: '2023-11-19',
    tournamentName: 'State Invitational Kumite Cup',
    tournamentLevel: 'state',
    result: 'silver',
    eventCategory: 'kumite-individual',
    weightCategory: '-75kg',
    difficultyLevel: 5,
    wins: 5,
    location: 'Mangaluru, Karnataka',
  }),
  tournamentAchievement({
    id: 'ach_ref_aarav_tournament_017',
    date: '2023-08-12',
    tournamentName: 'SKF Champions Trophy',
    tournamentLevel: 'inter-dojo',
    result: 'gold',
    eventCategory: 'mixed',
    weightCategory: 'open',
    difficultyLevel: 3,
    wins: 4,
    location: BRANCH_NAME,
  }),
  tournamentAchievement({
    id: 'ach_ref_aarav_tournament_018',
    date: '2022-12-11',
    tournamentName: 'Karnataka State Team Kumite Cup',
    tournamentLevel: 'state',
    result: 'bronze',
    eventCategory: 'kumite-team',
    weightCategory: 'team',
    difficultyLevel: 4,
    wins: 4,
    location: 'Bengaluru, Karnataka',
  }),
]

const specialEventAchievements = [
  specialAchievement({
    id: 'ach_ref_aarav_special_001',
    type: 'seminar-completion',
    date: '2026-04-10',
    title: 'Elite Kata Seminar with National Panel',
    sourceEventType: 'seminar',
    location: 'Bengaluru, Karnataka',
    description: 'Completed advanced kata correction, rhythm, bunkai, and competition presentation training.',
    pointsAwarded: 30,
  }),
  specialAchievement({
    id: 'ach_ref_aarav_special_002',
    type: 'camp-completion',
    date: '2026-03-02',
    title: 'Advanced Kumite Sparring Camp',
    sourceEventType: 'camp',
    location: BRANCH_NAME,
    description: 'Completed elite kumite drills covering distance, timing, counterattack, and ring control.',
    pointsAwarded: 30,
  }),
  specialAchievement({
    id: 'ach_ref_aarav_special_003',
    type: 'camp-completion',
    date: '2026-02-09',
    title: 'Nunchaku Weapon Training Completion',
    sourceEventType: 'camp',
    location: BRANCH_NAME,
    description: 'Completed weapon handling fundamentals, combinations, and safety discipline.',
    pointsAwarded: 30,
  }),
  specialAchievement({
    id: 'ach_ref_aarav_special_004',
    type: 'fun-completion',
    date: '2026-01-26',
    title: 'Republic Day Karate Demonstration Lead',
    sourceEventType: 'fun',
    location: 'Bengaluru, Karnataka',
    description: 'Led kata, kumite, self-defence, and team demonstration segments for public display.',
    pointsAwarded: 30,
  }),
  specialAchievement({
    id: 'ach_ref_aarav_special_005',
    type: 'special-award',
    date: '2025-12-28',
    title: 'Best All-Round Karate Athlete Award',
    sourceEventType: 'seminar',
    location: BRANCH_NAME,
    description: 'Recognized as a balanced performer across kata, kumite, team events, discipline, and leadership.',
    pointsAwarded: 150,
    awardedBy: 'SKF Senior Coaching Panel',
  }),
  specialAchievement({
    id: 'ach_ref_aarav_special_006',
    type: 'seminar-completion',
    date: '2025-10-19',
    title: 'Referee and Judge Orientation',
    sourceEventType: 'seminar',
    location: 'Bengaluru, Karnataka',
    description: 'Completed competition rules, scoring, gestures, warnings, and match-control orientation.',
    pointsAwarded: 30,
  }),
  specialAchievement({
    id: 'ach_ref_aarav_special_007',
    type: 'attendance-milestone',
    date: '2025-09-01',
    title: 'Dojo Captain Attendance Milestone',
    sourceEventType: 'camp',
    location: BRANCH_NAME,
    description: 'Maintained excellent attendance while assisting junior athletes in regular classes.',
    pointsAwarded: 100,
  }),
  specialAchievement({
    id: 'ach_ref_aarav_special_008',
    type: 'seminar-completion',
    date: '2025-07-13',
    title: 'Kata Bunkai Masterclass',
    sourceEventType: 'seminar',
    location: 'Mysuru, Karnataka',
    description: 'Completed bunkai analysis, application drills, and senior kata performance refinement.',
    pointsAwarded: 30,
  }),
  specialAchievement({
    id: 'ach_ref_aarav_special_009',
    type: 'seminar-completion',
    date: '2025-05-18',
    title: 'Kumite Strategy Workshop',
    sourceEventType: 'seminar',
    location: 'Bengaluru, Karnataka',
    description: 'Completed tactical kumite planning, opponent reading, and pressure-round scenarios.',
    pointsAwarded: 30,
  }),
  specialAchievement({
    id: 'ach_ref_aarav_special_010',
    type: 'camp-completion',
    date: '2025-04-06',
    title: 'Summer Conditioning and Agility Camp',
    sourceEventType: 'camp',
    location: BRANCH_NAME,
    description: 'Completed strength, flexibility, agility, reaction, and recovery blocks for competition readiness.',
    pointsAwarded: 30,
  }),
  specialAchievement({
    id: 'ach_ref_aarav_special_011',
    type: 'fun-completion',
    date: '2025-02-16',
    title: 'Inter-Branch Demonstration Team Lead',
    sourceEventType: 'fun',
    location: 'Rajajinagar, Bengaluru',
    description: 'Coordinated team kata, kihon, kumite footwork, and self-defence demonstration flow.',
    pointsAwarded: 30,
  }),
  specialAchievement({
    id: 'ach_ref_aarav_special_012',
    type: 'special-award',
    date: '2024-12-22',
    title: 'Outstanding Discipline and Leadership Award',
    sourceEventType: 'seminar',
    location: BRANCH_NAME,
    description: 'Awarded for mentoring juniors, supporting events, and representing SKF values consistently.',
    pointsAwarded: 150,
    awardedBy: 'SKF Karate',
  }),
]

const achievements = [
  ...beltAchievements,
  ...tournamentAchievements,
  ...specialEventAchievements,
]

function buildPointsHistory(entries) {
  let balanceAfter = 0

  return [...entries]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((achievement) => {
      const points = Number(achievement.pointsAwarded || 0)
      balanceAfter += points

      return {
        id: `points_${achievement.id}`,
        date: achievement.date,
        type: achievement.type,
        title: achievement.title,
        points,
        balanceAfter: Number(balanceAfter.toFixed(2)),
        sourceAchievementId: achievement.id,
      }
    })
}

function buildReferenceAthleteRecord() {
  const pointsHistory = buildPointsHistory(achievements)
  const pointsLifetime = pointsHistory.at(-1)?.balanceAfter || 0

  return {
    id: REFERENCE_ATHLETE_ID,
    skf_id: REFERENCE_SKF_ID,
    first_name: 'Aarav',
    last_name: 'Prakash Rao',
    date_of_birth: '1992-08-15',
    gender: 'male',
    photo_url: '/no-profile/no profile male.png',
    branch_name: BRANCH_NAME,
    current_belt: 'black-5th-dan',
    join_date: '2001-06-04',
    status: 'active',
    parent_name: 'Prakash Rao',
    phone: '9000000000',
    email: 'reference.athlete@example.com',
    batch: 'Advanced Competition Batch',
    monthly_fee: 2500,
    photo_consent: true,
    consent_given_at: '2026-05-04T00:00:00.000Z',
    is_public: true,
    is_featured: true,
    achievements,
    points_history: pointsHistory,
    points_balance: pointsLifetime,
    points_lifetime: pointsLifetime,
    attendance_rate: 99.2,
    created_at: '2026-05-04T00:00:00.000Z',
    updated_at: NOW,
  }
}

function summarizeRecord(record) {
  const achievementsList = Array.isArray(record.achievements) ? record.achievements : []
  const tournamentCount = achievementsList.filter((entry) =>
    String(entry?.type || '').startsWith('tournament')
  ).length
  const beltCount = achievementsList.filter((entry) =>
    ['enrollment', 'belt-pass', 'belt-grading', 'grading-fail', 'belt-fail'].includes(
      String(entry?.type || '')
    )
  ).length
  const specialEventCount = achievementsList.length - tournamentCount - beltCount

  return {
    id: record.id,
    skfId: record.skf_id,
    name: `${record.first_name} ${record.last_name}`,
    currentBelt: record.current_belt,
    publicProfile: `/athlete/${record.skf_id}`,
    featured: record.is_featured,
    public: record.is_public,
    achievements: achievementsList.length,
    beltEntries: beltCount,
    tournaments: tournamentCount,
    specialEvents: specialEventCount,
    pointsLifetime: Number(record.points_lifetime || 0),
  }
}

function getMissingColumnName(error) {
  const message = String(error?.message || '')
  const match = message.match(/Could not find the '([^']+)' column/)
  return match?.[1] || null
}

async function assertNoConflictingReference(supabase) {
  const { data, error } = await supabase
    .from('athletes')
    .select('id, skf_id')
    .or(`id.eq.${REFERENCE_ATHLETE_ID},skf_id.eq.${REFERENCE_SKF_ID}`)

  if (error) throw error

  const conflicts = (data || []).filter(
    (row) => row.id !== REFERENCE_ATHLETE_ID || row.skf_id !== REFERENCE_SKF_ID
  )

  if (conflicts.length > 0) {
    throw new Error(
      `Reference athlete handle conflicts with existing row: ${JSON.stringify(conflicts)}`
    )
  }
}

async function upsertWithSchemaFallback(supabase, record) {
  const payload = { ...record }
  const omittedColumns = []

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const { data, error } = await supabase
      .from('athletes')
      .upsert(payload, { onConflict: 'id' })
      .select('*')
      .single()

    if (!error) {
      return { data, omittedColumns }
    }

    const missingColumn = error.code === 'PGRST204' ? getMissingColumnName(error) : null
    if (!missingColumn || !(missingColumn in payload)) {
      throw error
    }

    delete payload[missingColumn]
    omittedColumns.push(missingColumn)
  }

  throw new Error('Could not upsert reference athlete after removing missing optional columns.')
}

async function upsertReferenceAthlete(supabase) {
  await assertNoConflictingReference(supabase)

  const record = buildReferenceAthleteRecord()
  const { data, omittedColumns } = await upsertWithSchemaFallback(supabase, record)

  console.log(
    JSON.stringify(
      {
        action: 'upserted',
        athlete: summarizeRecord(data),
        omittedColumns,
      },
      null,
      2
    )
  )
}

async function deleteReferenceAthlete(supabase) {
  const { data, error } = await supabase
    .from('athletes')
    .delete()
    .or(`id.eq.${REFERENCE_ATHLETE_ID},skf_id.eq.${REFERENCE_SKF_ID}`)
    .select('id, skf_id, first_name, last_name')

  if (error) throw error

  console.log(
    JSON.stringify(
      {
        action: 'deleted',
        deletedCount: data?.length || 0,
        deleted: data || [],
      },
      null,
      2
    )
  )
}

async function verifyReferenceAthlete(supabase) {
  const { data, error } = await supabase
    .from('athletes')
    .select('*')
    .eq('id', REFERENCE_ATHLETE_ID)
    .maybeSingle()

  if (error) throw error

  if (!data) {
    console.log(JSON.stringify({ action: 'verify', found: false }, null, 2))
    process.exitCode = 1
    return
  }

  console.log(JSON.stringify({ action: 'verify', found: true, athlete: summarizeRecord(data) }, null, 2))
}

async function main() {
  const command = process.argv[2] || '--upsert'
  const supabase = buildSupabaseClient()

  if (command === '--delete') {
    await deleteReferenceAthlete(supabase)
    return
  }

  if (command === '--verify') {
    await verifyReferenceAthlete(supabase)
    return
  }

  if (command !== '--upsert') {
    throw new Error(`Unknown command "${command}". Use --upsert, --verify, or --delete.`)
  }

  await upsertReferenceAthlete(supabase)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
