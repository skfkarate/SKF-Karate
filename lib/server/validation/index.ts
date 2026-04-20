import { ApiError } from '../api'
import { BELTS } from '@/data/constants/belts'
import {
  AGE_GROUPS,
  BELTS as TOURNAMENT_BELTS,
  BRANCHES,
  EVENT_CATEGORIES,
  MEDAL_TYPES,
  TOURNAMENT_LEVELS,
} from '../../types/tournament'
import {
  EVENT_STATUSES,
  EVENT_TYPES,
  EVENT_RESULT_OPTIONS,
  EVENT_BELT_VALUES,
} from '../../types/event'

const ATHLETE_GENDERS = new Set(['male', 'female', 'other'])
const ATHLETE_STATUSES = new Set(['active', 'inactive', 'alumni'])
const BELT_VALUES = new Set(BELTS.map((belt) => belt.colour))
const TOURNAMENT_LEVEL_VALUES = new Set(TOURNAMENT_LEVELS)
const EXTENDED_TOURNAMENT_LEVEL_VALUES = new Set([
  ...TOURNAMENT_LEVELS,
  'invitational',
  'open',
])
const BRANCH_VALUES = new Set(BRANCHES)
const EVENT_CATEGORY_VALUES = new Set(EVENT_CATEGORIES)
const AGE_GROUP_VALUES = new Set(AGE_GROUPS)
const MEDAL_VALUES = new Set(MEDAL_TYPES)
const TOURNAMENT_BELT_VALUES = new Set(TOURNAMENT_BELTS)
const EVENT_TYPE_VALUES = new Set(EVENT_TYPES)
const EVENT_STATUS_VALUES = new Set(EVENT_STATUSES)
const EVENT_BELT_VALUE_SET = new Set(EVENT_BELT_VALUES)

type NumericOptions = {
  min?: number
  max?: number
}

type PhoneOptions = {
  minDigits?: number
  maxDigits?: number
}

function optionalInteger(value, label, options: NumericOptions = {}) {
  if (value === undefined || value === null || value === '') return null
  return integerValue(value, label, options)
}

function optionalNumberValue(value, label, options: NumericOptions = {}) {
  if (value === undefined || value === null || value === '') return null
  return numberValue(value, label, options)
}

function ensureObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ApiError(400, `${label} is invalid.`)
  }

  return value
}

function requiredString(value, label, options: NumericOptions = {}) {
  const trimmed = String(value ?? '').trim()
  const min = options.min ?? 1
  const max = options.max ?? 120

  if (trimmed.length < min) {
    throw new ApiError(400, `${label} is required.`)
  }

  if (trimmed.length > max) {
    throw new ApiError(400, `${label} is too long.`)
  }

  return trimmed
}

function optionalString(value, label, options: NumericOptions = {}) {
  if (value === undefined || value === null) return ''

  const trimmed = String(value).trim()
  const max = options.max ?? 120

  if (!trimmed) return ''

  if (trimmed.length > max) {
    throw new ApiError(400, `${label} is too long.`)
  }

  return trimmed
}

function requiredDate(value, label) {
  const trimmed = requiredString(value, label, { max: 40 })
  const date = new Date(trimmed)

  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, `${label} is invalid.`)
  }

  return trimmed
}

function optionalDate(value, label) {
  if (value === undefined || value === null || String(value).trim() === '') {
    return ''
  }

  return requiredDate(value, label)
}

function booleanValue(value, fallback = false) {
  return typeof value === 'boolean' ? value : fallback
}

function integerValue(value, label, options: NumericOptions = {}) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    throw new ApiError(400, `${label} is invalid.`)
  }

  const integer = Math.trunc(parsed)
  const min = options.min ?? Number.MIN_SAFE_INTEGER
  const max = options.max ?? Number.MAX_SAFE_INTEGER

  if (integer < min || integer > max) {
    throw new ApiError(400, `${label} is out of range.`)
  }

  return integer
}

function numberValue(value, label, options: NumericOptions = {}) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    throw new ApiError(400, `${label} is invalid.`)
  }

  const min = options.min ?? Number.MIN_SAFE_INTEGER
  const max = options.max ?? Number.MAX_SAFE_INTEGER

  if (parsed < min || parsed > max) {
    throw new ApiError(400, `${label} is out of range.`)
  }

  return parsed
}

function enumValue(value, label, allowedValues) {
  const normalized = String(value ?? '').trim()
  if (!allowedValues.has(normalized)) {
    throw new ApiError(400, `${label} is invalid.`)
  }

  return normalized
}

function optionalUrl(value, label) {
  const normalized = optionalString(value, label, { max: 500 })
  if (!normalized) return ''

  if (normalized.startsWith('/')) {
    return normalized
  }

  let parsed
  try {
    parsed = new URL(normalized)
  } catch {
    throw new ApiError(400, `${label} must be a valid URL.`)
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new ApiError(400, `${label} must use http or https.`)
  }

  return normalized
}

function optionalEmail(value, label) {
  const normalized = optionalString(value, label, { max: 160 })
  if (!normalized) return ''

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(normalized)) {
    throw new ApiError(400, `${label} is invalid.`)
  }

  return normalized.toLowerCase()
}

function optionalPhone(value, label, options: PhoneOptions = {}) {
  const normalized = optionalString(value, label, { max: 30 })
  if (!normalized) return ''

  const digits = normalized.replace(/\D/g, '')
  const minDigits = options.minDigits ?? 10
  const maxDigits = options.maxDigits ?? 15

  if (digits.length < minDigits || digits.length > maxDigits) {
    throw new ApiError(400, `${label} is invalid.`)
  }

  return normalized
}

function normaliseAchievement(achievement, index) {
  const value = ensureObject(achievement, `Achievement ${index + 1}`)
  const pointsAwarded =
    value.pointsAwarded === undefined || value.pointsAwarded === null || value.pointsAwarded === ''
      ? 0
      : integerValue(value.pointsAwarded, `Achievement ${index + 1} points`, {
          min: -10000,
          max: 10000,
        })

  return {
    id: optionalString(value.id, `Achievement ${index + 1} id`, { max: 80 }),
    type: requiredString(value.type, `Achievement ${index + 1} type`, { max: 60 }),
    date: requiredDate(value.date, `Achievement ${index + 1} date`),
    title: requiredString(value.title, `Achievement ${index + 1} title`, {
      max: 180,
    }),
    description: optionalString(
      value.description,
      `Achievement ${index + 1} description`,
      { max: 600 }
    ),
    pointsAwarded,
    photoUrl: optionalUrl(value.photoUrl, `Achievement ${index + 1} photo URL`),
    beltEarned: value.beltEarned
      ? enumValue(value.beltEarned, `Achievement ${index + 1} belt`, BELT_VALUES)
      : '',
    tournamentName: optionalString(
      value.tournamentName,
      `Achievement ${index + 1} tournament name`,
      { max: 160 }
    ),
    tournamentLevel: value.tournamentLevel
      ? enumValue(
          value.tournamentLevel,
          `Achievement ${index + 1} tournament level`,
          EXTENDED_TOURNAMENT_LEVEL_VALUES
        )
      : '',
    eventCategory: optionalString(
      value.eventCategory,
      `Achievement ${index + 1} event category`,
      { max: 80 }
    ),
    ageGroup: optionalString(value.ageGroup, `Achievement ${index + 1} age group`, {
      max: 40,
    }),
    awardedBy: optionalString(value.awardedBy, `Achievement ${index + 1} awarded by`, {
      max: 120,
    }),
    awardReason: optionalString(
      value.awardReason,
      `Achievement ${index + 1} award reason`,
      { max: 200 }
    ),
    location: optionalString(value.location, `Achievement ${index + 1} location`, {
      max: 160,
    }),
    weightCategory: optionalString(
      value.weightCategory,
      `Achievement ${index + 1} weight category`,
      { max: 80 }
    ),
    sourceEventId: optionalString(value.sourceEventId, `Achievement ${index + 1} source event id`, {
      max: 80,
    }),
    sourceEventSlug: optionalString(
      value.sourceEventSlug,
      `Achievement ${index + 1} source event slug`,
      { max: 120 }
    ),
    sourceParticipantId: optionalString(
      value.sourceParticipantId,
      `Achievement ${index + 1} source participant id`,
      { max: 80 }
    ),
    sourceEventType: optionalString(
      value.sourceEventType,
      `Achievement ${index + 1} source event type`,
      { max: 40 }
    ),
    competitionResult: optionalString(
      value.competitionResult,
      `Achievement ${index + 1} competition result`,
      { max: 40 }
    ),
    result: optionalString(value.result, `Achievement ${index + 1} result`, {
      max: 40,
    }),
    grade: optionalString(value.grade, `Achievement ${index + 1} grade`, {
      max: 80,
    }),
    examiner: optionalString(value.examiner, `Achievement ${index + 1} examiner`, {
      max: 120,
    }),
    sourceEventLevel: optionalString(
      value.sourceEventLevel,
      `Achievement ${index + 1} source event level`,
      { max: 40 }
    ),
  }
}

function normalisePointsHistoryEntry(entry, index) {
  const value = ensureObject(entry, `Points history entry ${index + 1}`)

  return {
    id: optionalString(value.id, `Points history entry ${index + 1} id`, { max: 80 }),
    date: requiredDate(value.date, `Points history entry ${index + 1} date`),
    description: requiredString(
      value.description,
      `Points history entry ${index + 1} description`,
      { max: 180 }
    ),
    points: integerValue(value.points ?? 0, `Points history entry ${index + 1} points`, {
      min: -10000,
      max: 10000,
    }),
    balance: integerValue(
      value.balance ?? 0,
      `Points history entry ${index + 1} balance`,
      { min: -100000, max: 1000000 }
    ),
    sourceEventId: optionalString(
      value.sourceEventId,
      `Points history entry ${index + 1} source event id`,
      { max: 80 }
    ),
    sourceParticipantId: optionalString(
      value.sourceParticipantId,
      `Points history entry ${index + 1} source participant id`,
      { max: 80 }
    ),
  }
}

function normaliseWinner(winner, index) {
  const value = ensureObject(winner, `Winner ${index + 1}`)
  const medal = enumValue(value.medal, `Winner ${index + 1} medal`, MEDAL_VALUES)
  const positionMap = { gold: 1, silver: 2, bronze: 3 }

  return {
    id: optionalString(value.id, `Winner ${index + 1} id`, { max: 80 }),
    athleteId: optionalString(value.athleteId, `Winner ${index + 1} athlete id`, {
      max: 80,
    }),
    athleteName: requiredString(value.athleteName, `Winner ${index + 1} athlete name`, {
      max: 120,
    }),
    registrationNumber: optionalString(
      value.registrationNumber,
      `Winner ${index + 1} registration number`,
      { max: 40 }
    ),
    branchName: enumValue(value.branchName, `Winner ${index + 1} branch`, BRANCH_VALUES),
    belt: value.belt
      ? enumValue(value.belt, `Winner ${index + 1} belt`, TOURNAMENT_BELT_VALUES)
      : 'White Belt',
    medal,
    position: integerValue(
      value.position ?? positionMap[medal],
      `Winner ${index + 1} position`,
      { min: 1, max: 3 }
    ),
    category: enumValue(
      value.category || 'kata-individual',
      `Winner ${index + 1} category`,
      EVENT_CATEGORY_VALUES
    ),
    ageGroup: enumValue(
      value.ageGroup || 'sub-junior',
      `Winner ${index + 1} age group`,
      AGE_GROUP_VALUES
    ),
    weightCategory: optionalString(
      value.weightCategory,
      `Winner ${index + 1} weight category`,
      { max: 80 }
    ),
    photoUrl: optionalUrl(value.photoUrl, `Winner ${index + 1} photo URL`),
  }
}

function normaliseParticipant(participant, index) {
  const value = ensureObject(participant, `Participant ${index + 1}`)

  const athleteName = requiredString(
    value.athleteName || `${value.firstName || ''} ${value.lastName || ''}`,
    `Participant ${index + 1} athlete name`,
    { max: 120 }
  )

  return {
    id: optionalString(value.id, `Participant ${index + 1} id`, { max: 80 }),
    athleteId: optionalString(value.athleteId, `Participant ${index + 1} athlete id`, {
      max: 80,
    }),
    registrationNumber: requiredString(
      value.registrationNumber,
      `Participant ${index + 1} registration number`,
      { max: 40 }
    ),
    athleteName,
    branchName: enumValue(
      value.branchName || 'Sunkadakatte',
      `Participant ${index + 1} branch`,
      BRANCH_VALUES
    ),
    belt: optionalString(value.belt, `Participant ${index + 1} belt`, { max: 80 }),
    photoUrl: optionalUrl(value.photoUrl, `Participant ${index + 1} photo URL`),
  }
}

function normaliseEventResult(result, index, eventType) {
  const value = ensureObject(result, `Result ${index + 1}`)
  const normalizedType = enumValue(eventType, 'Event type', EVENT_TYPE_VALUES)
  const allowedResults = new Set(EVENT_RESULT_OPTIONS[normalizedType] || [])
  const participantName = requiredString(
    value.athleteName,
    `Result ${index + 1} athlete name`,
    { max: 120 }
  )

  const base = {
    id: optionalString(value.id, `Result ${index + 1} id`, { max: 80 }),
    athleteId: optionalString(value.athleteId, `Result ${index + 1} athlete id`, { max: 80 }),
    registrationNumber: requiredString(
      value.registrationNumber,
      `Result ${index + 1} registration number`,
      { max: 40 }
    ),
    athleteName: participantName,
    notes: optionalString(value.notes, `Result ${index + 1} notes`, { max: 400 }),
  }

  if (normalizedType === 'tournament') {
    const medal = value.medal ? enumValue(value.medal, `Result ${index + 1} medal`, MEDAL_VALUES) : ''
    const resultValue = optionalString(value.result || medal, `Result ${index + 1} result`, {
      max: 40,
    }) || 'participation'

    return {
      ...base,
      result: resultValue,
      medal,
      position: optionalInteger(value.position, `Result ${index + 1} position`, {
        min: 1,
        max: 128,
      }),
      category: enumValue(
        value.category || 'kata-individual',
        `Result ${index + 1} category`,
        EVENT_CATEGORY_VALUES
      ),
      ageGroup: enumValue(
        value.ageGroup || 'sub-junior',
        `Result ${index + 1} age group`,
        AGE_GROUP_VALUES
      ),
      weightCategory: optionalString(
        value.weightCategory,
        `Result ${index + 1} weight category`,
        { max: 80 }
      ),
    }
  }

  if (normalizedType === 'seminar' || normalizedType === 'camp' || normalizedType === 'fun') {
    const attended = booleanValue(value.attended, false)
    const completed = booleanValue(value.completed, false)
    const resultValue =
      optionalString(value.result, `Result ${index + 1} result`, { max: 40 }) ||
      (completed ? 'completed' : attended ? 'attended' : 'absent')

    if (!allowedResults.has(resultValue)) {
      throw new ApiError(400, `Result ${index + 1} is invalid.`)
    }

    return {
      ...base,
      result: resultValue,
      attended,
      completed,
      daysAttended: optionalInteger(
        value.daysAttended,
        `Result ${index + 1} days attended`,
        { min: 0, max: 365 }
      ),
    }
  }

  if (normalizedType === 'pelt-exam') {
    const resultValue = enumValue(
      value.result || 'fail',
      `Result ${index + 1} result`,
      allowedResults
    )

    return {
      ...base,
      result: resultValue,
      score: optionalNumberValue(value.score, `Result ${index + 1} score`, {
        min: 0,
        max: 1000,
      }),
      grade: optionalString(value.grade, `Result ${index + 1} grade`, { max: 80 }),
    }
  }

  const resultValue = enumValue(
    value.result || 'fail',
    `Result ${index + 1} result`,
    allowedResults
  )

  return {
    ...base,
    result: resultValue,
    beltAwarded:
      resultValue === 'pass'
        ? enumValue(
            value.beltAwarded || EVENT_BELT_VALUES[0],
            `Result ${index + 1} belt awarded`,
            EVENT_BELT_VALUE_SET
          )
        : '',
    examiner: optionalString(value.examiner, `Result ${index + 1} examiner`, {
      max: 120,
    }),
  }
}

export function validateContactPayload(payload) {
  const value = ensureObject(payload, 'Request body')
  const website = optionalString(value.website, 'Website', { max: 120 })
  const phone = optionalPhone(requiredString(value.phone, 'Phone', { max: 30 }), 'Phone', {
    minDigits: 10,
    maxDigits: 15,
  })

  return {
    isSpam: Boolean(website),
    data: {
      name: requiredString(value.name, 'Name', { min: 2, max: 80 }),
      email: optionalEmail(value.email, 'Email'),
      phone,
      preferredTime: optionalString(value.preferredTime, 'Preferred time', {
        max: 80,
      }),
      interest: optionalString(value.interest, 'Interest', { max: 80 }) || 'General Inquiry',
      message: optionalString(value.message, 'Message', { max: 1000 }),
      website,
    },
  }
}

export function validateAthletePayload(payload) {
  const value = ensureObject(payload, 'Athlete payload')

  const dateOfBirth = requiredDate(value.dateOfBirth, 'Date of birth')
  const joinDate = requiredDate(value.joinDate, 'Join date')

  if (new Date(joinDate) < new Date(dateOfBirth)) {
    throw new ApiError(400, 'Join date cannot be earlier than date of birth.')
  }

  const achievements = Array.isArray(value.achievements)
    ? value.achievements.map(normaliseAchievement)
    : []
  const pointsHistory = Array.isArray(value.pointsHistory)
    ? value.pointsHistory.map(normalisePointsHistoryEntry)
    : []

  return {
    id: optionalString(value.id, 'Athlete id', { max: 80 }),
    registrationNumber: optionalString(value.registrationNumber, 'Registration number', {
      max: 40,
    }),
    firstName: requiredString(value.firstName, 'First name', { max: 80 }),
    lastName: requiredString(value.lastName, 'Last name', { max: 80 }),
    dateOfBirth,
    gender: enumValue(value.gender || 'male', 'Gender', ATHLETE_GENDERS),
    photoUrl: optionalUrl(value.photoUrl, 'Photo URL'),
    branchName: enumValue(value.branchName || 'Sunkadakatte', 'Branch', BRANCH_VALUES),
    currentBelt: enumValue(value.currentBelt || 'white', 'Current belt', BELT_VALUES),
    joinDate,
    status: enumValue(value.status || 'active', 'Status', ATHLETE_STATUSES),
    parentName: optionalString(value.parentName, 'Parent name', { max: 120 }),
    phone: optionalPhone(value.phone, 'Phone', { minDigits: 10, maxDigits: 15 }),
    email: optionalEmail(value.email, 'Email'),
    isPublic: booleanValue(value.isPublic, true),
    isFeatured: booleanValue(value.isFeatured, false),
    achievements,
    pointsHistory,
    pointsBalance: numberValue(value.pointsBalance ?? 0, 'Points balance', {
      min: -100000,
      max: 1000000,
    }),
    pointsLifetime: numberValue(value.pointsLifetime ?? 0, 'Lifetime points', {
      min: 0,
      max: 1000000,
    }),
    createdAt: optionalDate(value.createdAt, 'Created at'),
    updatedAt: optionalDate(value.updatedAt, 'Updated at'),
  }
}

export function validateTournamentPayload(payload) {
  const value = ensureObject(payload, 'Tournament payload')
  const date = requiredDate(value.date, 'Start date')
  const endDate = optionalDate(value.endDate, 'End date')
  const slug = requiredString(value.slug, 'Slug', { max: 120 })
    .toLowerCase()
    .replace(/\s+/g, '-')

  if (endDate && new Date(endDate) < new Date(date)) {
    throw new ApiError(400, 'End date cannot be earlier than start date.')
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new ApiError(400, 'Slug may only contain lowercase letters, numbers, and hyphens.')
  }

  const totalParticipants = integerValue(
    value.totalParticipants ?? 0,
    'Total participants',
    { min: 1, max: 100000 }
  )
  const skfParticipants = integerValue(
    value.skfParticipants ?? 0,
    'SKF participants',
    { min: 0, max: 100000 }
  )

  if (skfParticipants > totalParticipants) {
    throw new ApiError(400, 'SKF participants cannot exceed total participants.')
  }

  const winners = Array.isArray(value.winners) ? value.winners.map(normaliseWinner) : []
  const participants = Array.isArray(value.participants)
    ? value.participants.map(normaliseParticipant)
    : []
  const results = Array.isArray(value.results)
    ? value.results.map((entry, index) => normaliseEventResult(entry, index, 'tournament'))
    : []

  return {
    id: optionalString(value.id, 'Tournament id', { max: 80 }),
    slug,
    name: requiredString(value.name, 'Tournament name', { max: 160 }),
    shortName: requiredString(value.shortName, 'Short name', { max: 120 }),
    level: enumValue(value.level || 'district', 'Tournament level', TOURNAMENT_LEVEL_VALUES),
    status: enumValue(value.status || 'draft', 'Tournament status', EVENT_STATUS_VALUES),
    date,
    endDate,
    venue: requiredString(value.venue, 'Venue', { max: 160 }),
    city: requiredString(value.city, 'City', { max: 120 }),
    state: requiredString(value.state, 'State', { max: 120 }),
    description: requiredString(value.description, 'Description', { max: 600 }),
    coverImageUrl: optionalUrl(value.coverImageUrl, 'Cover image URL'),
    totalParticipants,
    skfParticipants,
    affiliatedBody: optionalString(value.affiliatedBody, 'Affiliated body', {
      max: 80,
    }),
    isPublished: booleanValue(value.isPublished, false),
    isFeatured: booleanValue(value.isFeatured, false),
    participants,
    results,
    winners,
    resultsAppliedAt: optionalDate(value.resultsAppliedAt, 'Results applied at'),
    createdAt: optionalDate(value.createdAt, 'Created at'),
    updatedAt: optionalDate(value.updatedAt, 'Updated at'),
  }
}

export function validateEventPayload(payload) {
  const value = ensureObject(payload, 'Event payload')
  const type = enumValue(value.type || 'seminar', 'Event type', EVENT_TYPE_VALUES)
  const date = requiredDate(value.date, 'Start date')
  const endDate = optionalDate(value.endDate, 'End date')
  const slug = requiredString(value.slug, 'Slug', { max: 120 })
    .toLowerCase()
    .replace(/\s+/g, '-')

  if (endDate && new Date(endDate) < new Date(date)) {
    throw new ApiError(400, 'End date cannot be earlier than start date.')
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new ApiError(400, 'Slug may only contain lowercase letters, numbers, and hyphens.')
  }

  const participants = Array.isArray(value.participants)
    ? value.participants.map(normaliseParticipant)
    : []
  const results = Array.isArray(value.results)
    ? value.results.map((entry, index) => normaliseEventResult(entry, index, type))
    : []

  return {
    id: optionalString(value.id, 'Event id', { max: 80 }),
    slug,
    name: requiredString(value.name, 'Event name', { max: 160 }),
    shortName: optionalString(value.shortName, 'Short name', { max: 120 }) ||
      requiredString(value.name, 'Event name', { max: 160 }),
    type,
    status: enumValue(value.status || 'draft', 'Event status', EVENT_STATUS_VALUES),
    level:
      type === 'tournament'
        ? enumValue(value.level || 'district', 'Event level', TOURNAMENT_LEVEL_VALUES)
        : '',
    date,
    endDate,
    venue: requiredString(value.venue, 'Venue', { max: 160 }),
    city: requiredString(value.city, 'City', { max: 120 }),
    state: requiredString(value.state || 'Karnataka', 'State', { max: 120 }),
    description: requiredString(value.description, 'Description', { max: 600 }),
    coverImageUrl: optionalUrl(value.coverImageUrl, 'Cover image URL'),
    affiliatedBody: optionalString(value.affiliatedBody, 'Affiliated body', {
      max: 80,
    }),
    isPublished: booleanValue(value.isPublished, false),
    isFeatured: booleanValue(value.isFeatured, false),
    participants,
    results,
    resultsAppliedAt: optionalDate(value.resultsAppliedAt, 'Results applied at'),
    createdAt: optionalDate(value.createdAt, 'Created at'),
    updatedAt: optionalDate(value.updatedAt, 'Updated at'),
  }
}
