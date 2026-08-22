/**
 * Imports the supplied Kunigal athlete, profile-photo, and grading history.
 *
 * This is intentionally idempotent: re-running it updates the same 25
 * profiles, 12 events, 78 result records, and their photos.
 *
 * Usage: node scripts/import-kunigal-belt-examinations.mjs
 */
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

import { createClient } from '@supabase/supabase-js'

const ROOT = process.cwd()
const PAYLOAD_PATH = path.join(ROOT, 'SKF_Kunigal_Complete_Belt_Examination_Agent_Payload.json')
const PHOTOS_DIR = path.join(ROOT, 'SKF-kunigal-photos')
const PROFILE_PHOTO_BUCKET = 'athlete-profile-photos'
const NOW = new Date().toISOString()
const EXAMINER = 'Dr. Renshi Channegowda UC'

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {}
  return Object.fromEntries(
    fs.readFileSync(filePath, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const separator = line.indexOf('=')
        return [
          line.slice(0, separator),
          line.slice(separator + 1).replace(/^['\"]|['\"]$/g, ''),
        ]
      })
  )
}

function normaliseName(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function profileName(athlete) {
  return [athlete.firstName, athlete.lastName].filter(Boolean).join(' ').trim()
}

function fullDate(joinYear) {
  // A deterministic valid date within the known joining year, and earlier
  // than every matching athlete's first historical examination.
  return `${String(joinYear).slice(0, 4)}-01-15`
}

function extensionContentType(fileName) {
  const extension = path.extname(fileName).toLowerCase()
  if (extension === '.webp') return 'image/webp'
  if (extension === '.png') return 'image/png'
  if (extension === '.jpg' || extension === '.jpeg') return 'image/jpeg'
  throw new Error(`Unsupported profile-photo format: ${fileName}`)
}

function stableId(prefix, value) {
  return `${prefix}_${crypto.createHash('sha256').update(value).digest('hex').slice(0, 24)}`
}

function buildEnrollmentAchievement(athlete, joinDate) {
  return {
    id: 'ach_initial_white_belt',
    type: 'enrollment',
    date: joinDate,
    title: 'Joined SKF Karate',
    description: 'Started SKF Karate as a White Belt.',
    beltEarned: 'white',
    grade: 'Enrollment',
    result: 'pass',
    examiner: 'SKF Admissions',
    awardedBy: 'SKF Admissions',
    location: 'Kunigal',
    pointsAwarded: 50,
  }
}

function buildGradingAchievement({ event, participant, result }) {
  return {
    id: stableId('ach', `${event.id}:${participant.skfId}`),
    type: 'belt-grading',
    date: event.date,
    title: `Passed ${event.name}`,
    description: `A • Passed and promoted to ${result.beltAwarded}.`,
    beltEarned: result.beltAwarded,
    grade: 'A',
    examiner: EXAMINER,
    awardedBy: EXAMINER,
    result: 'pass',
    sourceEventId: event.id,
    sourceEventSlug: event.slug,
    sourceParticipantId: participant.id,
    sourceEventType: 'grading',
    sourceEventLevel: '',
    location: 'Kunigal, Kunigal',
    pointsAwarded: 240,
  }
}

async function main() {
  const env = {
    ...readEnvFile(path.join(ROOT, '.env')),
    ...readEnvFile(path.join(ROOT, '.env.local')),
    ...process.env,
  }
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.')
  }

  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const payload = JSON.parse(fs.readFileSync(PAYLOAD_PATH, 'utf8'))
  const examinations = payload.beltExaminations.map((entry) => entry.beltExamination)
  const athletes = new Map()

  for (const examination of examinations) {
    for (const athlete of examination.athletes || []) {
      if (athlete.action === 'create') athletes.set(athlete.skfId, athlete)
    }
  }
  if (athletes.size !== 25) throw new Error(`Expected 25 athlete profiles; found ${athletes.size}.`)

  const photoFiles = fs.readdirSync(PHOTOS_DIR).filter((file) => fs.statSync(path.join(PHOTOS_DIR, file)).isFile())
  const photosByName = new Map(photoFiles.map((file) => [normaliseName(path.parse(file).name), file]))
  // This is the one closest-name match: the payload uses Purushottama and
  // the supplied photo uses Purushothama.
  const photoOverrides = new Map([
    ['purushottamatb', 'Purushothama T B.webp'],
  ])
  const photoBySkfId = new Map()

  for (const athlete of athletes.values()) {
    const key = normaliseName(profileName(athlete))
    const photo = photosByName.get(key) || photoOverrides.get(key)
    if (!photo) throw new Error(`No supplied photo matches ${athlete.skfId} (${profileName(athlete)}).`)
    photoBySkfId.set(athlete.skfId, photo)
  }
  if (new Set(photoBySkfId.values()).size !== athletes.size || photoFiles.length !== athletes.size) {
    throw new Error('Profile-photo matching is not one-to-one.')
  }

  const { error: bucketError } = await supabase.storage.getBucket(PROFILE_PHOTO_BUCKET)
  if (bucketError) throw new Error(`Profile-photo storage is unavailable: ${bucketError.message}`)

  const photoUrls = new Map()
  for (const [skfId, fileName] of photoBySkfId) {
    const bytes = fs.readFileSync(path.join(PHOTOS_DIR, fileName))
    const storagePath = `${skfId}/${skfId}${path.extname(fileName).toLowerCase()}`
    const { error } = await supabase.storage.from(PROFILE_PHOTO_BUCKET).upload(storagePath, bytes, {
      contentType: extensionContentType(fileName),
      upsert: true,
    })
    if (error) throw new Error(`Unable to upload ${fileName}: ${error.message}`)
    const { data } = supabase.storage.from(PROFILE_PHOTO_BUCKET).getPublicUrl(storagePath)
    photoUrls.set(skfId, data.publicUrl)
  }

  const assignmentCountBySkfId = new Map()
  for (const examination of examinations) {
    for (const assignment of examination.assignments || []) {
      assignmentCountBySkfId.set(assignment.skfId, (assignmentCountBySkfId.get(assignment.skfId) || 0) + 1)
    }
  }

  const athleteRows = [...athletes.values()].map((athlete) => {
    const joinDate = fullDate(athlete.joinDate)
    const gradingCount = assignmentCountBySkfId.get(athlete.skfId) || 0
    return {
      id: stableId('athlete', athlete.skfId),
      skf_id: athlete.skfId,
      first_name: athlete.firstName,
      last_name: athlete.lastName || '',
      date_of_birth: athlete.dateOfBirth,
      gender: athlete.gender,
      photo_url: photoUrls.get(athlete.skfId),
      branch_name: 'Kunigal',
      current_belt: athlete.currentBelt,
      join_date: joinDate,
      status: 'active',
      parent_name: athlete.parentName || null,
      phone: athlete.phone || null,
      email: athlete.email || null,
      batch: athlete.batch || null,
      monthly_fee: 400,
      photo_consent: false,
      consent_given_at: null,
      is_public: athlete.isPublic !== false,
      is_featured: false,
      achievements: [buildEnrollmentAchievement(athlete, joinDate)],
      points_history: [],
      points_balance: 50 + (gradingCount * 240),
      points_lifetime: 50 + (gradingCount * 240),
      attendance_rate: null,
      created_at: NOW,
      updated_at: NOW,
    }
  })

  const { error: athleteError } = await supabase
    .from('athletes')
    .upsert(athleteRows, { onConflict: 'skf_id' })
  if (athleteError) throw new Error(`Unable to save athlete profiles: ${athleteError.message}`)

  const athleteBySkfId = new Map(athleteRows.map((athlete) => [athlete.skf_id, athlete]))
  const eventRows = []
  const achievementsBySkfId = new Map([...athletes.keys()].map((skfId) => [skfId, [
    buildEnrollmentAchievement(athleteBySkfId.get(skfId), athleteBySkfId.get(skfId).join_date),
  ]]))

  for (const examination of examinations) {
    const sourceEvent = examination.event
    const slug = `${slugify(sourceEvent.name)}-${sourceEvent.date}`
    const event = {
      id: stableId('evt', slug),
      slug,
      name: sourceEvent.name,
      shortName: `${sourceEvent.name} — ${sourceEvent.date}`,
      type: 'grading',
      status: 'completed',
      level: '',
      date: sourceEvent.date,
      endDate: null,
      venue: 'Kunigal',
      city: 'Kunigal',
      state: 'Karnataka',
      description: sourceEvent.description,
      coverImageUrl: null,
      affiliatedBody: 'SKF Karate',
      isPublished: true,
      isFeatured: false,
      isResultsPublished: true,
      showInJourney: true,
      hostingBranch: 'Kunigal',
    }
    const participants = []
    const results = []
    for (const assignment of examination.assignments || []) {
      const athlete = athleteBySkfId.get(assignment.skfId)
      if (!athlete) throw new Error(`Assignment references unknown athlete ${assignment.skfId}.`)
      const participant = {
        id: stableId('participant', `${event.id}:${athlete.skf_id}`),
        athleteId: athlete.id,
        athleteName: `${athlete.first_name} ${athlete.last_name}`.trim(),
        skfId: athlete.skf_id,
        branchName: 'Kunigal',
        belt: athlete.current_belt,
        photoUrl: athlete.photo_url,
      }
      const result = {
        id: stableId('result', `${event.id}:${athlete.skf_id}`),
        participantId: participant.id,
        athleteId: athlete.id,
        athleteName: participant.athleteName,
        skfId: athlete.skf_id,
        branchName: 'Kunigal',
        belt: participant.belt,
        photoUrl: athlete.photo_url,
        result: 'pass',
        beltAwarded: assignment.examiningForBelt,
        promotion: 'Promoted',
        promotionType: 'normal',
        doublePromotion: false,
        examiner: EXAMINER,
        grade: 'A',
        notes: 'A. Passed and promoted.',
      }
      participants.push(participant)
      results.push(result)
      achievementsBySkfId.get(athlete.skf_id).push(buildGradingAchievement({ event, participant, result }))
    }
    eventRows.push({
      id: event.id,
      slug: event.slug,
      name: event.name,
      short_name: event.shortName,
      type: event.type,
      status: event.status,
      level: null,
      date: event.date,
      end_date: event.endDate,
      venue: event.venue,
      city: event.city,
      state: event.state,
      description: event.description,
      cover_image_url: event.coverImageUrl,
      affiliated_body: event.affiliatedBody,
      is_published: event.isPublished,
      is_featured: event.isFeatured,
      is_results_published: event.isResultsPublished,
      show_in_journey: event.showInJourney,
      hosting_branch: event.hostingBranch,
      participants,
      results,
      results_applied_at: NOW,
      created_at: NOW,
      updated_at: NOW,
    })
  }

  const { error: eventError } = await supabase
    .from('events')
    .upsert(eventRows, { onConflict: 'slug' })
  if (eventError) throw new Error(`Unable to save belt-examination events: ${eventError.message}`)

  const profileUpdates = athleteRows.map((athlete) => ({
    ...athlete,
    achievements: achievementsBySkfId.get(athlete.skf_id).sort((a, b) => b.date.localeCompare(a.date)),
    updated_at: NOW,
  }))
  const { error: achievementError } = await supabase
    .from('athletes')
    .upsert(profileUpdates, { onConflict: 'skf_id' })
  if (achievementError) throw new Error(`Unable to save athlete journey records: ${achievementError.message}`)

  const summerEvent = eventRows.find((event) => event.date === '2026-07-26')
  if (summerEvent.participants.some((participant) => participant.skfId === 'SKF21KL001')) {
    throw new Error('Safety check failed: Preran A was assigned to the 26 July 2026 event.')
  }

  console.log(JSON.stringify({
    success: true,
    athletes: athleteRows.length,
    photos: photoUrls.size,
    events: eventRows.length,
    assignments: eventRows.reduce((total, event) => total + event.participants.length, 0),
    summerAssignments: summerEvent.participants.length,
    preranExcludedFromSummerEvent: true,
  }, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
