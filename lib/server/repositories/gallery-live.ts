import { randomUUID } from 'node:crypto'

import { GALLERY_CATEGORIES } from '@/data/constants/categories'
import { galleryPhotos as seedGalleryPhotos } from '@/data/seed/gallery'
import { ApiError } from '@/lib/server/api'
import { isSupabaseReady, supabaseAdmin } from '@/lib/server/supabase'
import { logger } from '@/src/server/lib/logger'

export const GALLERY_BUCKET = 'gallery-photos'

type GalleryPhotoRow = {
  id?: unknown
  src?: unknown
  title?: unknown
  cat?: unknown
  pinned?: unknown
  is_published?: unknown
  sort_order?: unknown
  storage_path?: unknown
  event_id?: unknown
  event_date?: unknown
  created_at?: unknown
  updated_at?: unknown
}

type GalleryPhotoPayload = {
  id?: unknown
  src?: unknown
  title?: unknown
  cat?: unknown
  category?: unknown
  pinned?: unknown
  isPublished?: unknown
  is_published?: unknown
  sortOrder?: unknown
  sort_order?: unknown
  storagePath?: unknown
  storage_path?: unknown
  eventId?: unknown
  event_id?: unknown
  eventDate?: unknown
  event_date?: unknown
}

type DatabaseWriteError = {
  code?: string
  message?: string
}

export type GalleryPhotoRecord = {
  id: string
  src: string
  title: string
  cat: string
  pinned: boolean
  isPublished: boolean
  sortOrder: number
  storagePath: string
  eventId: string
  eventDate: string
  createdAt: string
  updatedAt: string
  source: 'live' | 'seed'
  isSeed: boolean
}

export const GALLERY_CATEGORY_OPTIONS = [...GALLERY_CATEGORIES]

function slugify(value: unknown) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeCategory(value: unknown) {
  const requested = String(value || '').trim()
  const match = GALLERY_CATEGORY_OPTIONS.find((category) => slugify(category) === slugify(requested))
  return match || 'In Dojo'
}

function mapGalleryRow(row: GalleryPhotoRow): GalleryPhotoRecord {
  return {
    id: String(row.id || ''),
    src: String(row.src || '').trim(),
    title: String(row.title || '').trim(),
    cat: normalizeCategory(row.cat),
    pinned: Boolean(row.pinned),
    isPublished: row.is_published === undefined ? true : Boolean(row.is_published),
    sortOrder: Number(row.sort_order || 0),
    storagePath: String(row.storage_path || '').trim(),
    eventId: String(row.event_id || '').trim(),
    eventDate: String(row.event_date || '').trim(),
    createdAt: String(row.created_at || ''),
    updatedAt: String(row.updated_at || ''),
    source: 'live',
    isSeed: false,
  }
}

function mapSeedPhoto(photo: (typeof seedGalleryPhotos)[number]): GalleryPhotoRecord {
  return {
    id: photo.id,
    src: photo.src,
    title: photo.title,
    cat: normalizeCategory(photo.cat),
    pinned: Boolean(photo.pinned),
    isPublished: true,
    sortOrder: 5000,
    storagePath: '',
    eventId: '',
    eventDate: '',
    createdAt: '',
    updatedAt: '',
    source: 'seed',
    isSeed: true,
  }
}

function sortGalleryPhotos(photos: GalleryPhotoRecord[]) {
  return [...photos].sort((a, b) => {
    const pinnedDiff = Number(b.pinned) - Number(a.pinned)
    if (pinnedDiff !== 0) return pinnedDiff

    const orderDiff = Number(a.sortOrder || 0) - Number(b.sortOrder || 0)
    if (orderDiff !== 0) return orderDiff

    const dateDiff = Date.parse(b.createdAt || '') - Date.parse(a.createdAt || '')
    if (Number.isFinite(dateDiff) && dateDiff !== 0) return dateDiff

    return a.title.localeCompare(b.title)
  })
}

function withSeedFallback(livePhotos: GalleryPhotoRecord[], includeSeeds: boolean) {
  if (!includeSeeds) return sortGalleryPhotos(livePhotos)

  const seen = new Set(livePhotos.flatMap((photo) => [photo.id, photo.src].filter(Boolean)))
  const seeds = seedGalleryPhotos
    .map(mapSeedPhoto)
    .filter((photo) => !seen.has(photo.id) && !seen.has(photo.src))

  return sortGalleryPhotos([...livePhotos, ...seeds])
}

function ensureSupabaseForGallery() {
  if (!isSupabaseReady()) {
    throw new ApiError(503, 'Supabase is not configured for gallery uploads.')
  }
}

function handleGalleryError(error: DatabaseWriteError): never {
  if (error?.code === 'PGRST205' || error?.code === '42P01') {
    throw new ApiError(
      500,
      'Supabase schema is incomplete: missing "gallery_photos" table. Run database/migrations/026_gallery_photos.sql in the connected Supabase project.'
    )
  }

  throw new ApiError(500, error?.message || 'Unable to persist gallery photo.')
}

function normalizeGalleryPayload(payload: GalleryPhotoPayload, existing?: GalleryPhotoRecord | null) {
  const title = String(payload.title ?? existing?.title ?? '').trim()
  const src = String(payload.src ?? existing?.src ?? '').trim()

  if (!title) throw new ApiError(400, 'Photo title is required.')
  if (!src) throw new ApiError(400, 'Photo image URL is required.')

  const eventId = String(payload.eventId ?? payload.event_id ?? existing?.eventId ?? '').trim() || null
  const eventDate = String(payload.eventDate ?? payload.event_date ?? existing?.eventDate ?? '').trim() || null

  return {
    id: String(payload.id || existing?.id || `gallery-${randomUUID()}`).trim(),
    src,
    title,
    cat: normalizeCategory(payload.cat ?? payload.category ?? existing?.cat),
    pinned: Boolean(payload.pinned ?? existing?.pinned ?? false),
    is_published: payload.isPublished === undefined && payload.is_published === undefined
      ? existing?.isPublished ?? true
      : Boolean(payload.isPublished ?? payload.is_published),
    sort_order: Number(payload.sortOrder ?? payload.sort_order ?? existing?.sortOrder ?? 0),
    storage_path: String(payload.storagePath ?? payload.storage_path ?? existing?.storagePath ?? '').trim() || null,
    event_id: eventId,
    event_date: eventDate,
    updated_at: new Date().toISOString(),
  }
}

async function getLiveGalleryPhotos(includeUnpublished: boolean) {
  if (!isSupabaseReady()) return []

  try {
    let query = supabaseAdmin
      .from('gallery_photos')
      .select('*')
      .order('pinned', { ascending: false })
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (!includeUnpublished) query = query.eq('is_published', true)

    const { data, error } = await query
    if (error) throw error
    return (data || []).map(mapGalleryRow).filter((photo) => photo.src)
  } catch (error) {
    logger.warn('gallery.photos_load_failed', { error })
    return []
  }
}

export async function getPublishedGalleryPhotos() {
  return withSeedFallback(await getLiveGalleryPhotos(false), true)
}

export async function getAllGalleryPhotosAdmin() {
  return withSeedFallback(await getLiveGalleryPhotos(true), true)
}

export async function getGalleryPhotoByIdAdmin(id: string) {
  if (!id || !isSupabaseReady()) return null

  const { data, error } = await supabaseAdmin
    .from('gallery_photos')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) handleGalleryError(error)
  return data ? mapGalleryRow(data) : null
}

export async function createGalleryPhoto(payload: GalleryPhotoPayload) {
  ensureSupabaseForGallery()
  const normalized = normalizeGalleryPayload(payload)

  const { data, error } = await supabaseAdmin
    .from('gallery_photos')
    .insert({
      ...normalized,
      created_at: new Date().toISOString(),
    })
    .select('*')
    .single()

  if (error) handleGalleryError(error)
  return mapGalleryRow(data)
}

export async function updateGalleryPhoto(id: string, payload: GalleryPhotoPayload) {
  ensureSupabaseForGallery()
  const existing = await getGalleryPhotoByIdAdmin(id)
  if (!existing) throw new ApiError(404, 'Gallery photo not found.')

  const normalized = normalizeGalleryPayload({ ...payload, id }, existing)
  const { data, error } = await supabaseAdmin
    .from('gallery_photos')
    .update(normalized)
    .eq('id', id)
    .select('*')
    .single()

  if (error) handleGalleryError(error)
  return mapGalleryRow(data)
}

export async function removeGalleryStoragePath(storagePath: string) {
  if (!storagePath || !isSupabaseReady()) return

  const { error } = await supabaseAdmin.storage.from(GALLERY_BUCKET).remove([storagePath])
  if (error) {
    logger.warn('gallery.storage_remove_failed', { storagePath, error })
  }
}

export async function deleteGalleryPhoto(id: string) {
  ensureSupabaseForGallery()
  const existing = await getGalleryPhotoByIdAdmin(id)
  if (!existing) throw new ApiError(404, 'Gallery photo not found.')
  if (existing.isSeed) throw new ApiError(400, 'Seed gallery photos cannot be deleted from FeeTrack.')

  const { error } = await supabaseAdmin.from('gallery_photos').delete().eq('id', id)
  if (error) handleGalleryError(error)

  await removeGalleryStoragePath(existing.storagePath)
  return existing
}

export async function getEventGalleryPhotos(eventId: string): Promise<GalleryPhotoRecord[]> {
  if (!eventId || !isSupabaseReady()) return []

  try {
    const { data, error } = await supabaseAdmin
      .from('gallery_photos')
      .select('*')
      .eq('event_id', eventId)
      .eq('is_published', true)
      .order('pinned', { ascending: false })
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map(mapGalleryRow).filter((photo) => photo.src)
  } catch (error) {
    logger.warn('gallery.event_photos_load_failed', { eventId, error })
    return []
  }
}

export async function getEventGalleryPhotosAdmin(eventId: string): Promise<GalleryPhotoRecord[]> {
  if (!eventId || !isSupabaseReady()) return []

  try {
    const { data, error } = await supabaseAdmin
      .from('gallery_photos')
      .select('*')
      .eq('event_id', eventId)
      .order('pinned', { ascending: false })
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map(mapGalleryRow).filter((photo) => photo.src)
  } catch (error) {
    logger.warn('gallery.event_photos_admin_load_failed', { eventId, error })
    return []
  }
}
