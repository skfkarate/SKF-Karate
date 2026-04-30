import { randomUUID } from 'node:crypto'

import { findClassBranchByName, findClassBranchBySlug } from '@/lib/classes/catalog'
import { ApiError } from '@/lib/server/api'
import { isPublicTechniqueVideosEnabled } from '@/lib/server/feature-flags'
import { isSupabaseReady, supabaseAdmin } from '@/lib/server/supabase'
import { extractYouTubeId, getYouTubeThumbnailUrl, YOUTUBE_ID_PATTERN } from '@/lib/youtube'

import { getAllCitiesLive } from './classes-live'

type PortalVideoRow = {
  id?: unknown
  title?: unknown
  description?: unknown
  category?: unknown
  duration_label?: unknown
  youtube_id?: unknown
  branch_slugs?: unknown
  batch_names?: unknown
  belt_levels?: unknown
  is_featured?: unknown
  is_published?: unknown
  show_in_techniques?: unknown
  sort_order?: unknown
  created_at?: unknown
  updated_at?: unknown
}

type TimetableRow = {
  id?: unknown
  branch_slug?: unknown
  title?: unknown
  drive_url?: unknown
  image_url?: unknown
  month_label?: unknown
  effective_from?: unknown
  effective_to?: unknown
  is_active?: unknown
  notes?: unknown
  created_at?: unknown
  updated_at?: unknown
}

type PortalVideoPayload = {
  id?: unknown
  title?: unknown
  description?: unknown
  category?: unknown
  durationLabel?: unknown
  duration_label?: unknown
  youtubeId?: unknown
  youtube_id?: unknown
  youtubeInput?: unknown
  youtube_input?: unknown
  branchSlugs?: unknown
  branch_slugs?: unknown
  batchNames?: unknown
  batch_names?: unknown
  beltLevels?: unknown
  belt_levels?: unknown
  isFeatured?: unknown
  isPublished?: unknown
  showInTechniques?: unknown
  show_in_techniques?: unknown
  sortOrder?: unknown
}

type BranchTimetablePayload = {
  id?: unknown
  branchSlug?: unknown
  branch_slug?: unknown
  title?: unknown
  driveUrl?: unknown
  drive_url?: unknown
  imageUrl?: unknown
  image_url?: unknown
  monthLabel?: unknown
  month_label?: unknown
  effectiveFrom?: unknown
  effective_from?: unknown
  effectiveTo?: unknown
  effective_to?: unknown
  isActive?: unknown
  notes?: unknown
}

type DatabaseWriteError = {
  code?: string
  message?: string
}

export type PortalVideoRecord = {
  id: string
  title: string
  description: string
  category: string
  durationLabel: string
  youtubeId: string
  thumbnailUrl: string
  branchSlugs: string[]
  batchNames: string[]
  beltLevels: string[]
  isFeatured: boolean
  isPublished: boolean
  showInTechniques: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export type AthletePortalVideoRecord = PortalVideoRecord

export type BranchTimetableRecord = {
  id: string
  branchSlug: string
  title: string
  driveUrl: string
  imageUrl: string
  monthLabel: string
  effectiveFrom: string
  effectiveTo: string
  isActive: boolean
  notes: string
  createdAt: string
  updatedAt: string
}

function slugify(value: string) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function normalizeTextList(values: unknown): string[] {
  return Array.isArray(values)
    ? values
        .map((value) => String(value || '').trim().toLowerCase())
        .filter(Boolean)
    : []
}

function normalizeBeltLevel(value?: string | null) {
  const normalized = String(value || '').trim().toLowerCase()
  if (!normalized) return ''
  return normalized.startsWith('black') ? 'black' : normalized
}

function mapPortalVideoRow(row: PortalVideoRow): PortalVideoRecord {
  const youtubeId = String(row.youtube_id || '').trim()

  return {
    id: String(row.id),
    title: String(row.title || '').trim(),
    description: String(row.description || '').trim(),
    category: String(row.category || 'techniques').trim().toLowerCase(),
    durationLabel: String(row.duration_label || '').trim(),
    youtubeId,
    thumbnailUrl: youtubeId ? getYouTubeThumbnailUrl(youtubeId) : '',
    branchSlugs: normalizeTextList(row.branch_slugs),
    batchNames: normalizeTextList(row.batch_names),
    beltLevels: normalizeTextList(row.belt_levels).map((belt) => normalizeBeltLevel(belt)),
    isFeatured: Boolean(row.is_featured),
    isPublished: Boolean(row.is_published),
    showInTechniques: Boolean(row.show_in_techniques),
    sortOrder: Number(row.sort_order || 0),
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: String(row.updated_at || new Date().toISOString()),
  }
}

function mapTimetableRow(row: TimetableRow): BranchTimetableRecord {
  return {
    id: String(row.id),
    branchSlug: String(row.branch_slug || '').trim(),
    title: String(row.title || 'Official Timetable').trim(),
    driveUrl: String(row.drive_url || '').trim(),
    imageUrl: String(row.image_url || '').trim(),
    monthLabel: String(row.month_label || '').trim(),
    effectiveFrom: String(row.effective_from || '').trim(),
    effectiveTo: String(row.effective_to || '').trim(),
    isActive: Boolean(row.is_active),
    notes: String(row.notes || '').trim(),
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: String(row.updated_at || new Date().toISOString()),
  }
}

function handlePortalContentError(error: DatabaseWriteError, entityLabel: string): never {
  if (error?.code === 'PGRST205') {
    throw new ApiError(
      500,
      `Supabase schema is incomplete: missing "${entityLabel}" table. Run database/schema.sql in the connected Supabase project.`
    )
  }

  throw new ApiError(500, error?.message || `Unable to persist ${entityLabel}.`)
}

function ensureSupabaseForPortalContent() {
  if (!isSupabaseReady()) {
    throw new ApiError(503, 'Supabase is not configured for portal content.')
  }
}

function normalisePortalVideoPayload(payload: PortalVideoPayload) {
  const title = String(payload.title || '').trim()
  const youtubeId = extractYouTubeId(
    String(
      payload.youtubeId ||
        payload.youtube_id ||
        payload.youtubeInput ||
        payload.youtube_input ||
        ''
    )
  )

  if (!title) {
    throw new ApiError(400, 'Video title is required.')
  }

  if (!youtubeId || !YOUTUBE_ID_PATTERN.test(youtubeId)) {
    throw new ApiError(400, 'A valid 11-character YouTube video ID is required.')
  }

  const branchSlugs = normalizeTextList(payload.branchSlugs || payload.branch_slugs)
  const batchNames = normalizeTextList(payload.batchNames || payload.batch_names)
  const showInTechniques = Boolean(payload.showInTechniques ?? payload.show_in_techniques)

  if (showInTechniques && (branchSlugs.length || batchNames.length)) {
    throw new ApiError(
      400,
      'Public technique library videos must stay global. Remove branch and batch restrictions before enabling the technique library toggle.'
    )
  }

  return {
    id: String(payload.id || `${slugify(title) || 'video'}-${randomUUID().slice(0, 8)}`).trim(),
    title,
    description: String(payload.description || '').trim(),
    category: String(payload.category || 'techniques').trim().toLowerCase() || 'techniques',
    duration_label: String(payload.durationLabel || payload.duration_label || '').trim(),
    youtube_id: youtubeId,
    branch_slugs: branchSlugs,
    batch_names: batchNames,
    belt_levels: normalizeTextList(payload.beltLevels || payload.belt_levels).map((belt) => normalizeBeltLevel(belt)),
    is_featured: Boolean(payload.isFeatured),
    is_published: payload.isPublished === undefined ? true : Boolean(payload.isPublished),
    show_in_techniques: showInTechniques,
    sort_order: Number(payload.sortOrder || 0),
    updated_at: new Date().toISOString(),
  }
}

function normaliseBranchTimetablePayload(payload: BranchTimetablePayload) {
  const branchSlug = String(payload.branchSlug || payload.branch_slug || '').trim()
  const driveUrl = String(payload.driveUrl || payload.drive_url || '').trim()

  if (!branchSlug) {
    throw new ApiError(400, 'Branch is required for the timetable.')
  }

  if (!driveUrl) {
    throw new ApiError(400, 'Drive URL is required for the timetable.')
  }

  return {
    id: String(payload.id || '').trim() || randomUUID(),
    branch_slug: branchSlug,
    title: String(payload.title || 'Official Timetable').trim() || 'Official Timetable',
    drive_url: driveUrl,
    image_url: String(payload.imageUrl || payload.image_url || '').trim() || null,
    month_label: String(payload.monthLabel || payload.month_label || '').trim() || null,
    effective_from: String(payload.effectiveFrom || payload.effective_from || '').trim() || null,
    effective_to: String(payload.effectiveTo || payload.effective_to || '').trim() || null,
    is_active: payload.isActive === undefined ? true : Boolean(payload.isActive),
    notes: String(payload.notes || '').trim(),
    updated_at: new Date().toISOString(),
  }
}

async function resolveBranchSlugForName(branchName?: string | null) {
  if (!branchName) return ''
  const cities = await getAllCitiesLive()
  return (
    findClassBranchByName(cities, branchName)?.slug ||
    findClassBranchBySlug(cities, branchName)?.slug ||
    slugify(branchName)
  )
}

function matchesAudienceFilter(values: string[], candidate: string) {
  if (!values.length) return true
  if (!candidate) return false
  return values.includes(candidate.trim().toLowerCase())
}

function matchesVideoAudience(
  video: PortalVideoRecord,
  context: { branchSlug: string; batch: string; belt: string }
) {
  return (
    matchesAudienceFilter(video.branchSlugs, context.branchSlug) &&
    matchesAudienceFilter(video.batchNames, context.batch) &&
    matchesAudienceFilter(video.beltLevels, context.belt)
  )
}

function sortPortalVideos(videos: PortalVideoRecord[]) {
  return [...videos].sort((a, b) => {
    const featuredDiff = Number(b.isFeatured) - Number(a.isFeatured)
    if (featuredDiff !== 0) return featuredDiff

    const orderDiff = Number(a.sortOrder || 0) - Number(b.sortOrder || 0)
    if (orderDiff !== 0) return orderDiff

    return a.title.localeCompare(b.title)
  })
}

export async function getAllPortalVideosAdmin() {
  if (!isSupabaseReady()) return []

  try {
    const { data, error } = await supabaseAdmin
      .from('portal_videos')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('title', { ascending: true })

    if (error) throw error
    return (data || []).map(mapPortalVideoRow)
  } catch (error) {
    console.warn('[portal-content] Failed to load portal videos:', error)
    return []
  }
}

export async function getPortalVideosForAthlete(context: {
  branchName?: string | null
  batch?: string | null
  belt?: string | null
}) {
  const allVideos = await getAllPortalVideosAdmin()
  const branchSlug = await resolveBranchSlugForName(context.branchName)
  const batch = String(context.batch || '').trim().toLowerCase()
  const belt = normalizeBeltLevel(context.belt)

  return sortPortalVideos(
    allVideos.filter(
      (video) =>
        video.isPublished &&
        matchesVideoAudience(video, {
          branchSlug,
          batch,
          belt,
        })
    )
  )
}

export async function getProtectedPortalVideosForAthlete(context: {
  branchName?: string | null
  batch?: string | null
  belt?: string | null
}) {
  return getPortalVideosForAthlete(context)
}

export async function getTechniqueLibraryVideos(filters: {
  beltLevel?: string | null
  category?: string | null
} = {}) {
  if (!isPublicTechniqueVideosEnabled()) {
    return []
  }

  const beltLevel = normalizeBeltLevel(filters.beltLevel)
  const category = String(filters.category || '').trim().toLowerCase()

  return sortPortalVideos(
    (await getAllPortalVideosAdmin()).filter((video) => {
      if (!video.isPublished || !video.showInTechniques) return false
      if (video.branchSlugs.length || video.batchNames.length) return false
      if (beltLevel && !video.beltLevels.includes(beltLevel)) return false
      if (category && video.category !== category) return false
      return true
    })
  )
}

export async function createPortalVideo(payload: PortalVideoPayload) {
  ensureSupabaseForPortalContent()
  const normalized = normalisePortalVideoPayload(payload)

  const { data, error } = await supabaseAdmin
    .from('portal_videos')
    .insert({
      ...normalized,
      created_at: new Date().toISOString(),
    })
    .select('*')
    .single()

  if (error) handlePortalContentError(error, 'portal_videos')
  return mapPortalVideoRow(data)
}

export async function updatePortalVideo(id: string, payload: PortalVideoPayload) {
  ensureSupabaseForPortalContent()

  const normalized = normalisePortalVideoPayload({
    ...payload,
    id,
  })

  const { data, error } = await supabaseAdmin
    .from('portal_videos')
    .update(normalized)
    .eq('id', id)
    .select('*')
    .single()

  if (error) handlePortalContentError(error, 'portal_videos')
  return mapPortalVideoRow(data)
}

export async function deletePortalVideo(id: string) {
  ensureSupabaseForPortalContent()
  const { error } = await supabaseAdmin.from('portal_videos').delete().eq('id', id)
  if (error) handlePortalContentError(error, 'portal_videos')
}

export async function getAllBranchTimetablesAdmin() {
  if (!isSupabaseReady()) return []

  try {
    const { data, error } = await supabaseAdmin
      .from('branch_timetables')
      .select('*')
      .order('is_active', { ascending: false })
      .order('effective_from', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map(mapTimetableRow)
  } catch (error) {
    console.warn('[portal-content] Failed to load branch timetables:', error)
    return []
  }
}

export async function getActiveTimetableForBranchName(branchName?: string | null) {
  const branchSlug = await resolveBranchSlugForName(branchName)
  if (!branchSlug || !isSupabaseReady()) return null

  try {
    const { data, error } = await supabaseAdmin
      .from('branch_timetables')
      .select('*')
      .eq('branch_slug', branchSlug)
      .eq('is_active', true)
      .order('effective_from', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error

    const today = new Date().toISOString().slice(0, 10)
    const rows = (data || []).map(mapTimetableRow)

    return (
      rows.find((row) => {
        const starts = !row.effectiveFrom || row.effectiveFrom <= today
        const ends = !row.effectiveTo || row.effectiveTo >= today
        return starts && ends
      }) ||
      rows[0] ||
      null
    )
  } catch (error) {
    console.warn('[portal-content] Failed to load active branch timetable:', error)
    return null
  }
}

export async function createBranchTimetable(payload: BranchTimetablePayload) {
  ensureSupabaseForPortalContent()
  const normalized = normaliseBranchTimetablePayload(payload)

  const { data, error } = await supabaseAdmin
    .from('branch_timetables')
    .insert({
      ...normalized,
      created_at: new Date().toISOString(),
    })
    .select('*')
    .single()

  if (error) handlePortalContentError(error, 'branch_timetables')
  return mapTimetableRow(data)
}

export async function updateBranchTimetable(id: string, payload: BranchTimetablePayload) {
  ensureSupabaseForPortalContent()
  const normalized = normaliseBranchTimetablePayload({
    ...payload,
    id,
  })

  const { data, error } = await supabaseAdmin
    .from('branch_timetables')
    .update(normalized)
    .eq('id', id)
    .select('*')
    .single()

  if (error) handlePortalContentError(error, 'branch_timetables')
  return mapTimetableRow(data)
}

export async function deleteBranchTimetable(id: string) {
  ensureSupabaseForPortalContent()
  const { error } = await supabaseAdmin.from('branch_timetables').delete().eq('id', id)
  if (error) handlePortalContentError(error, 'branch_timetables')
}
