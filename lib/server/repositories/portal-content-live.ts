import { randomUUID } from 'node:crypto'

import { findClassBranchByName, findClassBranchBySlug } from '@/lib/classes/catalog'
import { ApiError } from '@/lib/server/api'
import { isSupabaseReady, supabaseAdmin } from '@/lib/server/supabase'

import { getAllCitiesLive } from './classes-live'

type PortalVideoRow = Record<string, any>
type TimetableRow = Record<string, any>

export type PortalVideoRecord = {
  id: string
  title: string
  description: string
  category: string
  durationLabel: string
  provider: string
  sourceUrl: string
  playbackUrl: string
  thumbnailUrl: string
  playbackMode: 'video' | 'iframe'
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

function extractGoogleDriveFileId(value: string) {
  const text = String(value || '').trim()
  if (!text) return null

  const directMatch = text.match(/\/file\/d\/([^/]+)/i)
  if (directMatch) return directMatch[1]

  const openMatch = text.match(/[?&]id=([^&]+)/i)
  if (openMatch) return openMatch[1]

  const ucMatch = text.match(/uc\?(?:[^#]*&)??id=([^&]+)/i)
  if (ucMatch) return ucMatch[1]

  return null
}

function extractYouTubeVideoId(value: string) {
  const text = String(value || '').trim()
  if (!text) return null

  const watchMatch = text.match(/[?&]v=([^&]+)/i)
  if (watchMatch) return watchMatch[1]

  const shortMatch = text.match(/youtu\.be\/([^?&/]+)/i)
  if (shortMatch) return shortMatch[1]

  const embedMatch = text.match(/youtube\.com\/embed\/([^?&/]+)/i)
  if (embedMatch) return embedMatch[1]

  return null
}

function buildGoogleDrivePlayback(fileId: string) {
  return {
    playbackUrl: `https://drive.google.com/file/d/${fileId}/preview`,
    playbackMode: 'iframe' as const,
  }
}

function resolvePlayback(sourceUrl: string, provider?: string, explicitPlaybackUrl?: string | null) {
  const normalizedProvider = String(provider || 'google-drive').trim().toLowerCase()
  const preferredUrl = String(explicitPlaybackUrl || '').trim()

  if (preferredUrl) {
    return {
      playbackUrl: preferredUrl,
      playbackMode: preferredUrl.includes('drive.google.com') ? ('iframe' as const) : ('video' as const),
    }
  }

  if (normalizedProvider === 'google-drive') {
    const fileId = extractGoogleDriveFileId(sourceUrl)
    if (fileId) {
      return buildGoogleDrivePlayback(fileId)
    }
  }

  const youtubeId = extractYouTubeVideoId(sourceUrl)
  if (normalizedProvider === 'youtube' || youtubeId) {
    return {
      playbackUrl: `https://www.youtube.com/embed/${youtubeId}`,
      playbackMode: 'iframe' as const,
    }
  }

  return {
    playbackUrl: sourceUrl,
    playbackMode: 'video' as const,
  }
}

function mapPortalVideoRow(row: PortalVideoRow): PortalVideoRecord {
  const sourceUrl = String(row.source_url || '').trim()
  const playback = resolvePlayback(sourceUrl, row.provider, row.playback_url)
  const youtubeId = extractYouTubeVideoId(sourceUrl)

  return {
    id: String(row.id),
    title: String(row.title || '').trim(),
    description: String(row.description || '').trim(),
    category: String(row.category || 'techniques').trim().toLowerCase(),
    durationLabel: String(row.duration_label || '').trim(),
    provider: String(row.provider || 'google-drive').trim().toLowerCase(),
    sourceUrl,
    playbackUrl: playback.playbackUrl,
    playbackMode: playback.playbackMode,
    thumbnailUrl:
      String(row.thumbnail_url || '').trim() ||
      (youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : ''),
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

function handlePortalContentError(error: any, entityLabel: string): never {
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

function normalisePortalVideoPayload(payload: Record<string, any>) {
  const title = String(payload.title || '').trim()
  const sourceUrl = String(payload.sourceUrl || payload.source_url || '').trim()

  if (!title) {
    throw new ApiError(400, 'Video title is required.')
  }

  if (!sourceUrl) {
    throw new ApiError(400, 'Video source URL is required.')
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
    provider: String(payload.provider || 'google-drive').trim().toLowerCase() || 'google-drive',
    source_url: sourceUrl,
    playback_url: String(payload.playbackUrl || payload.playback_url || '').trim() || null,
    thumbnail_url: String(payload.thumbnailUrl || payload.thumbnail_url || '').trim() || null,
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

function normaliseBranchTimetablePayload(payload: Record<string, any>) {
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

export async function getTechniqueLibraryVideos(filters: {
  beltLevel?: string | null
  category?: string | null
} = {}) {
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

export async function createPortalVideo(payload: Record<string, any>) {
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

export async function updatePortalVideo(id: string, payload: Record<string, any>) {
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

export async function createBranchTimetable(payload: Record<string, any>) {
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

export async function updateBranchTimetable(id: string, payload: Record<string, any>) {
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
