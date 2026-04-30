import { randomUUID } from 'node:crypto'

import { calculateAllRanks } from '../../utils/rank'
import { buildCompetitionResultsFromAthletes, getAthleteRankEntry } from '../../utils/rankings'
import { generateRegistrationNumber, normaliseRegistrationNumber } from '../../utils/registration'
import { ApiError } from '../api'
import { isSupabaseReady, supabaseAdmin } from '../supabase'
import {
  createAthlete,
  getAllAthletes,
  getAthleteById,
  getAthleteByRegistrationNumber,
  getAthleteRank,
  updateAthlete,
} from './athletes'

type AthleteAchievement = Record<string, unknown> & {
  type?: string
}
type AthletePointsHistoryEntry = Record<string, unknown>

type AthleteRecord = {
  id: string
  registrationNumber: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  photoUrl: string
  branchName: string
  currentBelt: string
  joinDate: string
  status: string
  parentName: string
  phone: string
  email: string
  batch: string
  monthlyFee: number
  photoConsent: boolean
  consentGivenAt: string | null
  isPublic: boolean
  isFeatured: boolean
  achievements: AthleteAchievement[]
  pointsHistory: AthletePointsHistoryEntry[]
  pointsBalance: number
  pointsLifetime: number
  attendanceRate: number | null
  createdAt: string
  updatedAt: string
}

type AthleteInput = Partial<AthleteRecord>

type AthleteDatabaseRow = {
  id?: string
  registration_number?: string | null
  first_name?: string | null
  last_name?: string | null
  date_of_birth?: string | null
  gender?: string | null
  photo_url?: string | null
  branch_name?: string | null
  current_belt?: string | null
  join_date?: string | null
  status?: string | null
  parent_name?: string | null
  phone?: string | null
  email?: string | null
  batch?: string | null
  monthly_fee?: number | string | null
  photo_consent?: boolean | null
  consent_given_at?: string | null
  is_public?: boolean | null
  is_featured?: boolean | null
  achievements?: unknown
  points_history?: unknown
  points_balance?: number | string | null
  points_lifetime?: number | string | null
  attendance_rate?: number | string | null
  created_at?: string | null
  updated_at?: string | null
}

type RankSnapshot = {
  athleteId?: string
  overallRank?: number | null
  totalPoints?: number
  totalMedals?: number
}

type DatabaseWriteError = {
  code?: string
  message?: string
}

function cloneAthleteData<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function buildRankSnapshotsForAthletes(athletes: AthleteRecord[]) {
  const results = buildCompetitionResultsFromAthletes(athletes)
  return calculateAllRanks(athletes, results, new Date())
}

function buildSearchResult(athlete: AthleteRecord, rankSnapshot?: RankSnapshot) {
  return {
    registrationNumber: athlete.registrationNumber,
    firstName: athlete.firstName,
    lastName: athlete.lastName,
    branchName: athlete.branchName,
    currentBelt: athlete.currentBelt,
    photoUrl: athlete.photoUrl,
    overallRank: rankSnapshot?.overallRank ?? null,
    totalPoints: rankSnapshot?.totalPoints ?? 0,
    totalMedals: rankSnapshot?.totalMedals ?? 0,
  }
}

function mapAthleteRowToRecord(row: AthleteDatabaseRow): AthleteRecord {
  return {
    id: row.id,
    registrationNumber: row.registration_number,
    firstName: row.first_name,
    lastName: row.last_name,
    dateOfBirth: row.date_of_birth || '',
    gender: row.gender || 'male',
    photoUrl: row.photo_url || '',
    branchName: row.branch_name || '',
    currentBelt: row.current_belt || 'white',
    joinDate: row.join_date || '',
    status: row.status || 'active',
    parentName: row.parent_name || '',
    phone: row.phone || '',
    email: row.email || '',
    batch: row.batch || '',
    monthlyFee: Number(row.monthly_fee || 0),
    photoConsent: Boolean(row.photo_consent),
    consentGivenAt: row.consent_given_at || null,
    isPublic: Boolean(row.is_public),
    isFeatured: Boolean(row.is_featured),
    achievements: Array.isArray(row.achievements) ? row.achievements : [],
    pointsHistory: Array.isArray(row.points_history) ? row.points_history : [],
    pointsBalance: Number(row.points_balance || 0),
    pointsLifetime: Number(row.points_lifetime || 0),
    attendanceRate:
      row.attendance_rate === null || row.attendance_rate === undefined
        ? null
        : Number(row.attendance_rate),
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  }
}

function mapAthleteRecordToRow(record: AthleteRecord): Record<string, unknown> {
  return {
    id: record.id,
    registration_number: record.registrationNumber,
    first_name: record.firstName,
    last_name: record.lastName,
    date_of_birth: record.dateOfBirth || null,
    gender: record.gender || 'male',
    photo_url: record.photoUrl || null,
    branch_name: record.branchName || null,
    current_belt: record.currentBelt || 'white',
    join_date: record.joinDate || null,
    status: record.status || 'active',
    parent_name: record.parentName || null,
    phone: record.phone || null,
    email: record.email || null,
    batch: record.batch || null,
    monthly_fee: Number(record.monthlyFee || 0),
    photo_consent: Boolean(record.photoConsent),
    consent_given_at: record.consentGivenAt || null,
    is_public: typeof record.isPublic === 'boolean' ? record.isPublic : true,
    is_featured: typeof record.isFeatured === 'boolean' ? record.isFeatured : false,
    achievements: Array.isArray(record.achievements) ? record.achievements : [],
    points_history: Array.isArray(record.pointsHistory) ? record.pointsHistory : [],
    points_balance: Number(record.pointsBalance || 0),
    points_lifetime: Number(record.pointsLifetime || 0),
    attendance_rate:
      record.attendanceRate === null || record.attendanceRate === undefined
        ? null
        : Number(record.attendanceRate),
    created_at: record.createdAt || new Date().toISOString(),
    updated_at: record.updatedAt || new Date().toISOString(),
  }
}

function normaliseAthletePayload(
  input: AthleteInput = {},
  existing: AthleteRecord | null = null
): AthleteRecord {
  const now = new Date().toISOString()

  return {
    id: existing?.id || input.id || `athlete_${randomUUID()}`,
    registrationNumber:
      input.registrationNumber || existing?.registrationNumber || '',
    firstName: input.firstName?.trim() || existing?.firstName || '',
    lastName: input.lastName?.trim() || existing?.lastName || '',
    dateOfBirth: input.dateOfBirth || existing?.dateOfBirth || '',
    gender: input.gender || existing?.gender || 'male',
    photoUrl: input.photoUrl || existing?.photoUrl || '',
    branchName: input.branchName || existing?.branchName || '',
    currentBelt: input.currentBelt || existing?.currentBelt || 'white',
    joinDate: input.joinDate || existing?.joinDate || '',
    status: input.status || existing?.status || 'active',
    parentName: input.parentName || existing?.parentName || '',
    phone: input.phone || existing?.phone || '',
    email: input.email || existing?.email || '',
    batch: input.batch || existing?.batch || '',
    monthlyFee: Number.isFinite(input.monthlyFee)
      ? input.monthlyFee
      : existing?.monthlyFee || 0,
    photoConsent:
      typeof input.photoConsent === 'boolean'
        ? input.photoConsent
        : existing?.photoConsent ?? false,
    consentGivenAt:
      input.consentGivenAt === null
        ? null
        : input.consentGivenAt || existing?.consentGivenAt || null,
    isPublic:
      typeof input.isPublic === 'boolean' ? input.isPublic : existing?.isPublic ?? true,
    isFeatured:
      typeof input.isFeatured === 'boolean'
        ? input.isFeatured
        : existing?.isFeatured ?? false,
    achievements: Array.isArray(input.achievements)
      ? input.achievements
      : existing?.achievements || [],
    pointsHistory: Array.isArray(input.pointsHistory)
      ? input.pointsHistory
      : existing?.pointsHistory || [],
    pointsBalance: Number.isFinite(input.pointsBalance)
      ? input.pointsBalance
      : existing?.pointsBalance || 0,
    pointsLifetime: Number.isFinite(input.pointsLifetime)
      ? input.pointsLifetime
      : existing?.pointsLifetime || 0,
    attendanceRate:
      input.attendanceRate === null || input.attendanceRate === undefined
        ? existing?.attendanceRate ?? null
        : Number(input.attendanceRate),
    createdAt: existing?.createdAt || input.createdAt || now,
    updatedAt: now,
  }
}

async function readAllAthletesFromDatabase(): Promise<AthleteRecord[]> {
  const { data, error } = await supabaseAdmin
    .from('athletes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data || []).map(mapAthleteRowToRecord)
}

async function getAthleteDataset(): Promise<AthleteRecord[]> {
  if (!isSupabaseReady()) {
    return cloneAthleteData(getAllAthletes())
  }

  try {
    return await readAllAthletesFromDatabase()
  } catch (error) {
    console.warn('[athletes-live] Falling back to local athlete repository:', error)
    return cloneAthleteData(getAllAthletes())
  }
}

async function getNextSequenceNumberLive(year: number): Promise<number> {
  const athletes = await getAthleteDataset()
  const athletesThisYear = athletes.filter((athlete) =>
    String(athlete.registrationNumber || '').startsWith(`SKF-${year}-`)
  )

  if (athletesThisYear.length === 0) return 1

  const sequences = athletesThisYear
    .map((athlete) => Number.parseInt(String(athlete.registrationNumber).split('-')[2] || '0', 10))
    .filter((value) => Number.isFinite(value))

  return sequences.length > 0 ? Math.max(...sequences) + 1 : 1
}

async function hasAthleteRegistrationNumberLive(
  registrationNumber: string,
  excludeId: string | null = null
): Promise<boolean> {
  const normalized = normaliseRegistrationNumber(registrationNumber)
  const athletes = await getAthleteDataset()

  return athletes.some((athlete) => {
    return (
      String(athlete.registrationNumber || '').toUpperCase() === normalized.toUpperCase() &&
      athlete.id !== excludeId
    )
  })
}

function handleAthleteWriteError(error: DatabaseWriteError): never {
  if (error?.code === 'PGRST205') {
    throw new ApiError(
      500,
      'Supabase schema is incomplete: missing "athletes" table. Run database/schema.sql in the connected Supabase project.'
    )
  }

  if (error?.code === '23505') {
    throw new ApiError(409, 'An athlete with this registration number already exists.')
  }

  throw new ApiError(500, error?.message || 'Unable to persist the athlete record.')
}

export async function getAllAthletesLive() {
  return cloneAthleteData(await getAthleteDataset())
}

export async function getAthleteByRegistrationNumberLive(regNum: string) {
  if (!isSupabaseReady()) {
    return cloneAthleteData(getAthleteByRegistrationNumber(regNum))
  }

  try {
    const normalized = normaliseRegistrationNumber(regNum)
    const { data, error } = await supabaseAdmin
      .from('athletes')
      .select('*')
      .eq('registration_number', normalized)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return mapAthleteRowToRecord(data)
  } catch (error) {
    console.warn('[athletes-live] Falling back to local athlete lookup:', error)
    return cloneAthleteData(getAthleteByRegistrationNumber(regNum))
  }
}

export async function getAthleteByIdLive(id: string) {
  if (!isSupabaseReady()) {
    return cloneAthleteData(getAthleteById(id))
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('athletes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return mapAthleteRowToRecord(data)
  } catch (error) {
    console.warn('[athletes-live] Falling back to local athlete lookup by id:', error)
    return cloneAthleteData(getAthleteById(id))
  }
}

export async function getFeaturedAthletesLive() {
  const athletes = await getAthleteDataset()

  return cloneAthleteData(
    athletes.filter(
      (athlete) => athlete.isFeatured && athlete.isPublic && athlete.status === 'active'
    )
  )
}

export async function searchAthletesByNameLive(query: string) {
  if (!query) return []

  const lowerQuery = query.toLowerCase()
  const athletes = await getAthleteDataset()
  const rankSnapshots = buildRankSnapshotsForAthletes(athletes)
  const rankMap = new Map(rankSnapshots.map((entry) => [String(entry.athleteId), entry]))

  return athletes
    .filter(
      (athlete) =>
        athlete.isPublic &&
        athlete.status === 'active' &&
        (String(athlete.firstName || '').toLowerCase().includes(lowerQuery) ||
          String(athlete.lastName || '').toLowerCase().includes(lowerQuery))
    )
    .sort((a, b) => {
      const aName = `${a.firstName} ${a.lastName}`.trim().toLowerCase()
      const bName = `${b.firstName} ${b.lastName}`.trim().toLowerCase()
      const aRank = rankMap.get(String(a.id))
      const bRank = rankMap.get(String(b.id))

      const getPriority = (name: string) => {
        if (name === lowerQuery) return 0
        if (name.startsWith(lowerQuery)) return 1
        return 2
      }

      const priorityDiff = getPriority(aName) - getPriority(bName)
      if (priorityDiff !== 0) return priorityDiff

      const pointDiff = Number(bRank?.totalPoints || 0) - Number(aRank?.totalPoints || 0)
      if (pointDiff !== 0) return pointDiff

      return aName.localeCompare(bName)
    })
    .map((athlete) => buildSearchResult(athlete, rankMap.get(String(athlete.id))))
}

export async function getFeaturedAthleteSearchResultsLive(limit = 6) {
  const athletes = await getAthleteDataset()
  const rankSnapshots = buildRankSnapshotsForAthletes(athletes)
  const rankMap = new Map(rankSnapshots.map((entry) => [String(entry.athleteId), entry]))

  const featured = athletes
    .filter((athlete) => athlete.isPublic && athlete.status === 'active')
    .sort((a, b) => {
      const aRank = rankMap.get(String(a.id))
      const bRank = rankMap.get(String(b.id))
      const pointDiff = Number(bRank?.totalPoints || 0) - Number(aRank?.totalPoints || 0)
      if (pointDiff !== 0) return pointDiff

      const featuredDiff = Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured))
      if (featuredDiff !== 0) return featuredDiff

      return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
    })
    .slice(0, limit)

  return featured.map((athlete) => buildSearchResult(athlete, rankMap.get(String(athlete.id))))
}

export async function getRankSnapshotsLive() {
  const athletes = await getAthleteDataset()
  return buildRankSnapshotsForAthletes(athletes)
}

export async function getAthleteRankLive(athleteId: string) {
  const athletes = await getAthleteDataset()
  const results = buildCompetitionResultsFromAthletes(athletes)
  const rankInfo = getAthleteRankEntry(athleteId, athletes, results)

  if (!rankInfo) return null

  return {
    branchRank: rankInfo.branchRank,
    overallRank: rankInfo.overallRank,
    totalPoints: rankInfo.totalPoints,
    rankingCategory: rankInfo.rankingCategory,
  }
}

export async function createAthleteLive(input: AthleteInput) {
  if (!isSupabaseReady()) {
    return cloneAthleteData(createAthlete(input))
  }

  const joinDate = input.joinDate || new Date().toISOString().split('T')[0]
  const joinYear = Number.parseInt(String(joinDate).slice(0, 4), 10) || new Date().getFullYear()
  const requestedRegistrationNumber = input.registrationNumber
    ? normaliseRegistrationNumber(input.registrationNumber)
    : ''
  const registrationNumber =
    requestedRegistrationNumber ||
    generateRegistrationNumber(joinYear, await getNextSequenceNumberLive(joinYear))

  if (await hasAthleteRegistrationNumberLive(registrationNumber)) {
    throw new ApiError(409, 'An athlete with this registration number already exists.')
  }

  const athlete = normaliseAthletePayload({
    ...input,
    joinDate,
    registrationNumber,
  })

  const { data, error } = await supabaseAdmin
    .from('athletes')
    .insert(mapAthleteRecordToRow(athlete))
    .select('*')
    .single()

  if (error) {
    handleAthleteWriteError(error)
  }

  return mapAthleteRowToRecord(data)
}

export async function updateAthleteLive(id: string, input: AthleteInput) {
  if (!isSupabaseReady()) {
    return cloneAthleteData(updateAthlete(id, input))
  }

  const existingAthlete = await getAthleteByIdLive(id)
  if (!existingAthlete) return null

  const registrationNumber = input.registrationNumber
    ? normaliseRegistrationNumber(input.registrationNumber)
    : existingAthlete.registrationNumber

  if (await hasAthleteRegistrationNumberLive(registrationNumber, id)) {
    throw new ApiError(409, 'An athlete with this registration number already exists.')
  }

  const athlete = normaliseAthletePayload(
    { ...input, registrationNumber },
    existingAthlete
  )

  const { data, error } = await supabaseAdmin
    .from('athletes')
    .update(mapAthleteRecordToRow(athlete))
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    handleAthleteWriteError(error)
  }

  return mapAthleteRowToRecord(data)
}

export async function upsertAthleteMirror(input: AthleteInput) {
  const normalizedRegistration = normaliseRegistrationNumber(input.registrationNumber || '')
  if (!normalizedRegistration) {
    throw new ApiError(400, 'Registration number is required to sync an athlete mirror.')
  }

  const existing = await getAthleteByRegistrationNumberLive(normalizedRegistration)

  if (existing) {
    return updateAthleteLive(existing.id, {
      ...existing,
      ...input,
      registrationNumber: normalizedRegistration,
    })
  }

  return createAthleteLive({
    ...input,
    registrationNumber: normalizedRegistration,
  })
}

export async function getAthleteRankOrFallback(athleteId: string) {
  return isSupabaseReady()
    ? getAthleteRankLive(athleteId)
    : Promise.resolve(getAthleteRank(athleteId))
}
