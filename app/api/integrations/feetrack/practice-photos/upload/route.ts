import { revalidatePath } from 'next/cache'

import type { AuthUser } from '@/lib/server/auth/staff'
import { createPracticePhoto } from '@/lib/server/repositories/portal-content-live'
import { isSupabaseReady, supabaseAdmin } from '@/lib/server/supabase'
import { AppError, AuthenticationError, AuthorizationError, ValidationError } from '@/src/server/lib/errors'
import { logger } from '@/src/server/lib/logger'
import { timingSafeStringEqual } from '@/src/server/lib/security'
import { FeeOperationsService } from '@/src/server/services/fee-operations.service'

const MAX_PHOTO_BYTES = 8 * 1024 * 1024
const PRACTICE_BUCKET = 'portal-practice-images'
const WRITE_ROLES = new Set(['admin', 'instructor', 'fee_manager'])
const FEE_TRACK_ROLES = new Set(FeeOperationsService.roles)
const IMAGE_EXTENSIONS = new Map([['image/jpeg', 'jpg'], ['image/png', 'png'], ['image/webp', 'webp']])

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } })
}

function slugify(value: unknown) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'practice-photo'
}

function assertIntegrationAccess(request: Request, staff: AuthUser | null) {
  const expected = process.env.FEETRACK_API_KEY
  if (!expected || !timingSafeStringEqual(request.headers.get('x-feetrack-api-key') || '', expected)) throw new AuthenticationError('Invalid FeeTrack integration key.')
  if (!staff?.id || !staff.role || !FEE_TRACK_ROLES.has(staff.role)) throw new AuthenticationError('FeeTrack staff session is required.')
  if (!WRITE_ROLES.has(staff.role)) throw new AuthorizationError('Fee viewer access is read-only.')
}

export async function POST(request: Request) {
  try {
    const size = Number(request.headers.get('content-length') || 0)
    if (size > MAX_PHOTO_BYTES) throw new AppError('REQUEST_TOO_LARGE', 'Practice photo exceeds 8 MB.', 413)
    const form = await request.formData()
    const rawStaff = String(form.get('staff') || '')
    const staff = rawStaff ? JSON.parse(rawStaff) as AuthUser : null
    assertIntegrationAccess(request, staff)
    if (!isSupabaseReady()) throw new AppError('EXTERNAL_SERVICE_ERROR', 'Supabase storage is not configured for practice photos.', 503)

    const title = String(form.get('title') || '').trim()
    const folderId = String(form.get('folderId') || '').trim()
    const file = form.get('photo')
    if (!title) throw new ValidationError({ title: ['Photo title is required.'] })
    if (!folderId) throw new ValidationError({ folder: ['Choose a practice folder for this photo.'] })
    if (!(file instanceof File) || !file.size) throw new ValidationError({ photo: ['Upload a JPG, PNG, or WebP photo.'] })
    if (file.size > MAX_PHOTO_BYTES) throw new AppError('REQUEST_TOO_LARGE', 'Practice photo exceeds 8 MB.', 413)
    const extension = IMAGE_EXTENSIONS.get(file.type)
    if (!extension) throw new ValidationError({ photo: ['Upload a JPG, PNG, or WebP photo.'] })

    const storagePath = `${folderId}/${Date.now()}-${slugify(title)}.${extension}`
    const { error: uploadError } = await supabaseAdmin.storage.from(PRACTICE_BUCKET).upload(storagePath, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false })
    if (uploadError) throw new AppError('EXTERNAL_SERVICE_ERROR', uploadError.message || 'Unable to upload practice photo.', 503)

    try {
      const photo = await createPracticePhoto({
        folderId,
        title,
        description: String(form.get('description') || '').trim(),
        storagePath,
        branchSlugs: JSON.parse(String(form.get('branchSlugs') || '[]')),
        batchNames: JSON.parse(String(form.get('batchNames') || '[]')),
        beltLevels: JSON.parse(String(form.get('beltLevels') || '[]')),
        isPublished: String(form.get('isPublished') || 'true') !== 'false',
        sortOrder: Number(form.get('sortOrder') || 0),
      })
      revalidatePath('/portal/videos')
      return json({ success: true, data: { photo } })
    } catch (error) {
      await supabaseAdmin.storage.from(PRACTICE_BUCKET).remove([storagePath])
      throw error
    }
  } catch (error) {
    logger.warn('feetrack.practice_photo_upload_failed', { error })
    if (error instanceof AppError) return json({ success: false, error: error.message, code: error.code, details: error.details }, error.statusCode)
    return json({ success: false, error: error instanceof Error ? error.message : 'Practice photo upload failed.' }, 500)
  }
}
