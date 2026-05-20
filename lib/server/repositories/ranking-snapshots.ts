import { compareRankingEntries } from '@/lib/utils/rankings'
import { normaliseSkfId } from '@/lib/utils/registration'

import { isSupabaseReady, supabaseAdmin } from '../supabase'
import { getRankSnapshotsLive } from './athletes-live'
import { logger } from '@/src/server/lib/logger'

export type RankMovement = 'up' | 'down' | 'same' | 'new'

type RankingCategory = {
  key?: string
  [key: string]: unknown
}

export type RankingEntry = {
  athleteId?: string
  skfId?: string
  athleteName?: string
  branchName?: string
  currentBelt?: string
  overallRank?: number
  branchRank?: number
  totalPoints?: number
  goldCount?: number
  silverCount?: number
  bronzeCount?: number
  fightWinCount?: number
  tournamentCount?: number
  totalMedals?: number
  rankingCategory?: RankingCategory
  pointsBreakdown?: unknown[]
}

export type RankingEntryWithMovement<T extends RankingEntry = RankingEntry> = T & {
  previousOverallRank: number | null
  previousCategoryRank: number | null
  previousBranchRank: number | null
  overallRankDelta: number | null
  categoryRankDelta: number | null
  branchRankDelta: number | null
  overallMovement: RankMovement
  categoryMovement: RankMovement
  branchMovement: RankMovement
  rankingMovement: RankMovement
  rankDelta: number | null
  rankingSnapshotRecordedAt: string | null
}

export type RankingSnapshotRow = {
  snapshotKey: string
  reason: string
  sourceType: string | null
  sourceId: string | null
  categoryKey: string
  athleteId: string
  skfId: string
  athleteName: string
  branchName: string
  currentBelt: string
  overallRank: number
  categoryRank: number
  branchRank: number
  totalPoints: number
  goldCount: number
  silverCount: number
  bronzeCount: number
  fightWinCount: number
  tournamentCount: number
  totalMedals: number
  previousOverallRank: number | null
  previousCategoryRank: number | null
  previousBranchRank: number | null
  overallRankDelta: number | null
  categoryRankDelta: number | null
  branchRankDelta: number | null
  overallMovement: RankMovement
  categoryMovement: RankMovement
  branchMovement: RankMovement
  rankingCategory: RankingCategory
  pointsBreakdown: unknown[]
  createdAt: string
}

type RankingSnapshotDatabaseRow = {
  snapshot_key?: string | null
  reason?: string | null
  source_type?: string | null
  source_id?: string | null
  category_key?: string | null
  athlete_id?: string | null
  skf_id?: string | null
  athlete_name?: string | null
  branch_name?: string | null
  current_belt?: string | null
  overall_rank?: number | string | null
  category_rank?: number | string | null
  branch_rank?: number | string | null
  total_points?: number | string | null
  gold_count?: number | string | null
  silver_count?: number | string | null
  bronze_count?: number | string | null
  fight_win_count?: number | string | null
  tournament_count?: number | string | null
  total_medals?: number | string | null
  previous_overall_rank?: number | string | null
  previous_category_rank?: number | string | null
  previous_branch_rank?: number | string | null
  overall_rank_delta?: number | string | null
  category_rank_delta?: number | string | null
  branch_rank_delta?: number | string | null
  overall_movement?: string | null
  category_movement?: string | null
  branch_movement?: string | null
  ranking_category?: unknown
  points_breakdown?: unknown
  created_at?: string | null
}

type CaptureRankingSnapshotOptions = {
  reason?: string
  sourceType?: string
  sourceId?: string
}

type RankedEntry = RankingEntry & {
  categoryKey: string
  categoryRank: number
}

function toNumber(value: unknown, fallback = 0) {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : fallback
}

function toNullableNumber(value: unknown) {
  if (value === null || value === undefined || value === '') return null
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

function categoryKeyFor(entry: RankingEntry) {
  return String(entry.rankingCategory?.key || 'general')
}

function rowIdentity(categoryKey: string, athleteId: string) {
  return `${categoryKey}::${athleteId}`
}

function movementFromDelta(delta: number | null): RankMovement {
  if (delta === null) return 'new'
  if (delta > 0) return 'up'
  if (delta < 0) return 'down'
  return 'same'
}

function rankDelta(previousRank: number | null, currentRank: number) {
  if (!previousRank) return null
  return previousRank - currentRank
}

function snapshotKeyFor(createdAt: string, options: CaptureRankingSnapshotOptions) {
  const timestamp = createdAt.replace(/[^0-9]/g, '')
  const reason = String(options.reason || 'manual').replace(/[^a-z0-9_-]/gi, '-')
  const sourceType = String(options.sourceType || 'rankings').replace(/[^a-z0-9_-]/gi, '-')
  const sourceId = String(options.sourceId || 'snapshot').replace(/[^a-z0-9_-]/gi, '-')
  return `${timestamp}_${reason}_${sourceType}_${sourceId}`
}

function addCategoryRanks(entries: RankingEntry[]): RankedEntry[] {
  const buckets = new Map<string, RankingEntry[]>()

  for (const entry of entries) {
    const key = categoryKeyFor(entry)
    const bucket = buckets.get(key) || []
    bucket.push(entry)
    buckets.set(key, bucket)
  }

  const ranked: RankedEntry[] = []

  for (const [categoryKey, bucket] of buckets.entries()) {
    const sorted = [...bucket].sort(compareRankingEntries)
    sorted.forEach((entry, index) => {
      ranked.push({
        ...entry,
        categoryKey,
        categoryRank: index + 1,
      })
    })
  }

  return ranked.sort(compareRankingEntries)
}

function normalizeMovement(value: unknown): RankMovement {
  return value === 'up' || value === 'down' || value === 'same' || value === 'new'
    ? value
    : 'new'
}

function mapRankingSnapshotRow(row: RankingSnapshotDatabaseRow): RankingSnapshotRow {
  return {
    snapshotKey: String(row.snapshot_key || ''),
    reason: String(row.reason || 'manual'),
    sourceType: row.source_type || null,
    sourceId: row.source_id || null,
    categoryKey: String(row.category_key || 'general'),
    athleteId: String(row.athlete_id || ''),
    skfId: normaliseSkfId(String(row.skf_id || '')),
    athleteName: String(row.athlete_name || ''),
    branchName: String(row.branch_name || ''),
    currentBelt: String(row.current_belt || ''),
    overallRank: toNumber(row.overall_rank),
    categoryRank: toNumber(row.category_rank),
    branchRank: toNumber(row.branch_rank),
    totalPoints: toNumber(row.total_points),
    goldCount: toNumber(row.gold_count),
    silverCount: toNumber(row.silver_count),
    bronzeCount: toNumber(row.bronze_count),
    fightWinCount: toNumber(row.fight_win_count),
    tournamentCount: toNumber(row.tournament_count),
    totalMedals: toNumber(row.total_medals),
    previousOverallRank: toNullableNumber(row.previous_overall_rank),
    previousCategoryRank: toNullableNumber(row.previous_category_rank),
    previousBranchRank: toNullableNumber(row.previous_branch_rank),
    overallRankDelta: toNullableNumber(row.overall_rank_delta),
    categoryRankDelta: toNullableNumber(row.category_rank_delta),
    branchRankDelta: toNullableNumber(row.branch_rank_delta),
    overallMovement: normalizeMovement(row.overall_movement),
    categoryMovement: normalizeMovement(row.category_movement),
    branchMovement: normalizeMovement(row.branch_movement),
    rankingCategory:
      row.ranking_category && typeof row.ranking_category === 'object' && !Array.isArray(row.ranking_category)
        ? row.ranking_category as RankingCategory
        : {},
    pointsBreakdown: Array.isArray(row.points_breakdown) ? row.points_breakdown : [],
    createdAt: row.created_at || '',
  }
}

function snapshotRowToDatabasePayload(row: RankingSnapshotRow): Record<string, unknown> {
  return {
    snapshot_key: row.snapshotKey,
    reason: row.reason,
    source_type: row.sourceType,
    source_id: row.sourceId,
    category_key: row.categoryKey,
    athlete_id: row.athleteId,
    skf_id: row.skfId,
    athlete_name: row.athleteName,
    branch_name: row.branchName || null,
    current_belt: row.currentBelt || null,
    overall_rank: row.overallRank,
    category_rank: row.categoryRank,
    branch_rank: row.branchRank,
    total_points: row.totalPoints,
    gold_count: row.goldCount,
    silver_count: row.silverCount,
    bronze_count: row.bronzeCount,
    fight_win_count: row.fightWinCount,
    tournament_count: row.tournamentCount,
    total_medals: row.totalMedals,
    previous_overall_rank: row.previousOverallRank,
    previous_category_rank: row.previousCategoryRank,
    previous_branch_rank: row.previousBranchRank,
    overall_rank_delta: row.overallRankDelta,
    category_rank_delta: row.categoryRankDelta,
    branch_rank_delta: row.branchRankDelta,
    overall_movement: row.overallMovement,
    category_movement: row.categoryMovement,
    branch_movement: row.branchMovement,
    ranking_category: row.rankingCategory || {},
    points_breakdown: Array.isArray(row.pointsBreakdown) ? row.pointsBreakdown : [],
    created_at: row.createdAt,
  }
}

function isMissingRankingSnapshotTableError(error: unknown) {
  if (!error || typeof error !== 'object') return false
  const code = 'code' in error ? String(error.code || '') : ''
  const message = 'message' in error ? String(error.message || '') : ''
  return code === 'PGRST205' || code === '42P01' || message.includes('ranking_snapshots')
}

export function buildRankingSnapshotRows(
  entries: RankingEntry[],
  previousRows: RankingSnapshotRow[] = [],
  options: CaptureRankingSnapshotOptions = {},
  createdAt = new Date().toISOString()
): RankingSnapshotRow[] {
  const snapshotKey = snapshotKeyFor(createdAt, options)
  const previousByCategoryAndAthlete = new Map(
    previousRows.map((row) => [rowIdentity(row.categoryKey, row.athleteId), row])
  )
  const previousByAthlete = new Map<string, RankingSnapshotRow>()

  for (const row of previousRows) {
    if (!previousByAthlete.has(row.athleteId)) {
      previousByAthlete.set(row.athleteId, row)
    }
  }

  return addCategoryRanks(entries).map((entry) => {
    const athleteId = String(entry.athleteId || '')
    const previousCategoryRow = previousByCategoryAndAthlete.get(
      rowIdentity(entry.categoryKey, athleteId)
    )
    const previousAthleteRow = previousByAthlete.get(athleteId)
    const overallRank = toNumber(entry.overallRank)
    const branchRank = toNumber(entry.branchRank)
    const overallRankDelta = rankDelta(previousAthleteRow?.overallRank ?? null, overallRank)
    const categoryRankDelta = rankDelta(previousCategoryRow?.categoryRank ?? null, entry.categoryRank)
    const branchRankDelta = rankDelta(previousAthleteRow?.branchRank ?? null, branchRank)

    return {
      snapshotKey,
      reason: options.reason || 'manual',
      sourceType: options.sourceType || null,
      sourceId: options.sourceId || null,
      categoryKey: entry.categoryKey,
      athleteId,
      skfId: normaliseSkfId(String(entry.skfId || '')),
      athleteName: String(entry.athleteName || ''),
      branchName: String(entry.branchName || ''),
      currentBelt: String(entry.currentBelt || ''),
      overallRank,
      categoryRank: entry.categoryRank,
      branchRank,
      totalPoints: toNumber(entry.totalPoints),
      goldCount: toNumber(entry.goldCount),
      silverCount: toNumber(entry.silverCount),
      bronzeCount: toNumber(entry.bronzeCount),
      fightWinCount: toNumber(entry.fightWinCount),
      tournamentCount: toNumber(entry.tournamentCount),
      totalMedals: toNumber(entry.totalMedals),
      previousOverallRank: previousAthleteRow?.overallRank ?? null,
      previousCategoryRank: previousCategoryRow?.categoryRank ?? null,
      previousBranchRank: previousAthleteRow?.branchRank ?? null,
      overallRankDelta,
      categoryRankDelta,
      branchRankDelta,
      overallMovement: movementFromDelta(overallRankDelta),
      categoryMovement: movementFromDelta(categoryRankDelta),
      branchMovement: movementFromDelta(branchRankDelta),
      rankingCategory: entry.rankingCategory || {},
      pointsBreakdown: Array.isArray(entry.pointsBreakdown) ? entry.pointsBreakdown : [],
      createdAt,
    }
  })
}

export function applyRankingMovements<T extends RankingEntry>(
  entries: T[],
  latestRows: RankingSnapshotRow[] = []
): RankingEntryWithMovement<T>[] {
  const latestByCategoryAndAthlete = new Map(
    latestRows.map((row) => [rowIdentity(row.categoryKey, row.athleteId), row])
  )
  const rankedEntryMap = new Map(
    addCategoryRanks(entries).map((entry) => [
      rowIdentity(entry.categoryKey, String(entry.athleteId || '')),
      entry,
    ])
  )

  return entries.map((entry) => {
    const athleteId = String(entry.athleteId || '')
    const categoryKey = categoryKeyFor(entry)
    const latest = latestByCategoryAndAthlete.get(rowIdentity(categoryKey, athleteId))
    const rankedEntry = rankedEntryMap.get(rowIdentity(categoryKey, athleteId))
    const currentOverallRank = toNullableNumber(entry.overallRank)
    const currentCategoryRank = rankedEntry?.categoryRank ?? null
    const currentBranchRank = toNullableNumber(entry.branchRank)
    const currentPoints = toNumber(entry.totalPoints)
    const matchesLatestSnapshot = Boolean(
      latest &&
        currentOverallRank === latest.overallRank &&
        currentCategoryRank === latest.categoryRank &&
        currentBranchRank === latest.branchRank &&
        currentPoints === latest.totalPoints
    )
    const overallRankDelta = matchesLatestSnapshot
      ? latest?.overallRankDelta ?? null
      : latest && currentOverallRank
        ? rankDelta(latest.overallRank, currentOverallRank)
        : null
    const categoryRankDelta = matchesLatestSnapshot
      ? latest?.categoryRankDelta ?? null
      : latest && currentCategoryRank
        ? rankDelta(latest.categoryRank, currentCategoryRank)
        : null
    const branchRankDelta = matchesLatestSnapshot
      ? latest?.branchRankDelta ?? null
      : latest && currentBranchRank
        ? rankDelta(latest.branchRank, currentBranchRank)
        : null

    return {
      ...entry,
      previousOverallRank: matchesLatestSnapshot
        ? latest?.previousOverallRank ?? null
        : latest?.overallRank ?? null,
      previousCategoryRank: matchesLatestSnapshot
        ? latest?.previousCategoryRank ?? null
        : latest?.categoryRank ?? null,
      previousBranchRank: matchesLatestSnapshot
        ? latest?.previousBranchRank ?? null
        : latest?.branchRank ?? null,
      overallRankDelta,
      categoryRankDelta,
      branchRankDelta,
      overallMovement: matchesLatestSnapshot
        ? latest?.overallMovement ?? 'new'
        : movementFromDelta(overallRankDelta),
      categoryMovement: matchesLatestSnapshot
        ? latest?.categoryMovement ?? 'new'
        : movementFromDelta(categoryRankDelta),
      branchMovement: matchesLatestSnapshot
        ? latest?.branchMovement ?? 'new'
        : movementFromDelta(branchRankDelta),
      rankingMovement: matchesLatestSnapshot
        ? latest?.categoryMovement ?? 'new'
        : movementFromDelta(categoryRankDelta),
      rankDelta: categoryRankDelta,
      rankingSnapshotRecordedAt: latest?.createdAt || null,
    }
  })
}

export async function getLatestRankingSnapshotRowsLive(): Promise<RankingSnapshotRow[]> {
  if (!isSupabaseReady()) return []

  try {
    const { data: latest, error: latestError } = await supabaseAdmin
      .from('ranking_snapshots')
      .select('snapshot_key')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (latestError) {
      if (isMissingRankingSnapshotTableError(latestError)) return []
      throw latestError
    }

    const latestSnapshotKey = latest?.snapshot_key
    if (!latestSnapshotKey) return []

    const { data, error } = await supabaseAdmin
      .from('ranking_snapshots')
      .select('*')
      .eq('snapshot_key', latestSnapshotKey)

    if (error) {
      if (isMissingRankingSnapshotTableError(error)) return []
      throw error
    }

    return (data || []).map(mapRankingSnapshotRow)
  } catch (error) {
    if (isMissingRankingSnapshotTableError(error)) return []
    logger.warn('ranking_snapshots.latest_read_failed', { error })
    return []
  }
}

export async function hydrateRankingMovementsLive<T extends RankingEntry>(
  entries: T[]
): Promise<RankingEntryWithMovement<T>[]> {
  const latestRows = await getLatestRankingSnapshotRowsLive()
  return applyRankingMovements(entries, latestRows)
}

export async function captureRankingSnapshotLive(
  options: CaptureRankingSnapshotOptions = {}
): Promise<{ captured: boolean; rows: number; snapshotKey: string | null }> {
  if (!isSupabaseReady()) {
    return { captured: false, rows: 0, snapshotKey: null }
  }

  try {
    const [entries, previousRows] = await Promise.all([
      getRankSnapshotsLive(),
      getLatestRankingSnapshotRowsLive(),
    ])
    const rows = buildRankingSnapshotRows(entries, previousRows, options)

    if (rows.length === 0) {
      return { captured: false, rows: 0, snapshotKey: null }
    }

    const { error } = await supabaseAdmin
      .from('ranking_snapshots')
      .upsert(rows.map(snapshotRowToDatabasePayload), {
        onConflict: 'snapshot_key,category_key,athlete_id',
      })

    if (error) {
      if (isMissingRankingSnapshotTableError(error)) {
        logger.warn('ranking_snapshots.table_missing', { migration: '010_ranking_snapshots' })
        return { captured: false, rows: 0, snapshotKey: null }
      }
      throw error
    }

    return {
      captured: true,
      rows: rows.length,
      snapshotKey: rows[0]?.snapshotKey || null,
    }
  } catch (error) {
    if (isMissingRankingSnapshotTableError(error)) {
      logger.warn('ranking_snapshots.table_missing', { migration: '010_ranking_snapshots' })
      return { captured: false, rows: 0, snapshotKey: null }
    }

    logger.warn('ranking_snapshots.capture_failed', { error })
    return { captured: false, rows: 0, snapshotKey: null }
  }
}
