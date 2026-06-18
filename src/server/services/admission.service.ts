import type { Session } from 'next-auth'

import { buildAthletePayloadFromForm } from '@/lib/athletes/athlete-records'
import { getAllCitiesLive } from '@/lib/server/repositories/classes-live'
import {
  createAthleteLive,
  getAllAthletesLive,
  updateAthleteLive,
} from '@/lib/server/repositories/athletes-live'
import { revalidateAthleteSitePaths } from '@/lib/server/revalidation'
import { isSupabaseReady, supabaseAdmin } from '@/lib/server/supabase'
import { validateAthletePayload } from '@/lib/server/validation'
import { flattenClassBranches } from '@/lib/classes/catalog'
import { normaliseSkfId } from '@/lib/utils/registration'
import { retryWithBackoff } from '@/lib/utils/retry'
import {
  publicAdmissionSchema,
  type AdmissionApprovalFieldsInput,
  type AdmissionBranchSettingsInput,
  type AdmissionListQueryInput,
  type AdmissionPromoCodeInput,
  type PublicAdmissionInput,
} from '@/src/server/api/validators/admission.validator'
import { ConflictError, NotFoundError, ValidationError } from '@/src/server/lib/errors'
import { logger } from '@/src/server/lib/logger'
import { sendFeeTrackPushNotification } from '@/src/server/services/feetrack-push.service'
import { FeeOperationsService } from '@/src/server/services/fee-operations.service'
import { hasTelegramChannel, sendTelegramMessage } from '@/src/server/services/telegram.service'

const PROFILE_PHOTO_BUCKET = 'athlete-profile-photos'
const ADMISSION_PHOTO_BUCKET = 'admission-photos'
const PAYMENT_PROOF_BUCKET = 'fee-payment-proofs'
const MAX_ADMISSION_PHOTO_BYTES = 8 * 1024 * 1024
const MAX_ADMISSION_PAYMENT_PROOF_BYTES = 5 * 1024 * 1024
const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const BELTS = new Set(['white', 'yellow', 'orange', 'green', 'blue', 'brown', 'black'])
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

const BRANCH_ADMISSION_DEFAULTS: Record<string, {
  monthlyFee: number
  admissionFee: number
  dressFee: number
  dressCost: number
  batchOptions: string[]
  notes: string
}> = {
  'mp-sports-club': {
    monthlyFee: 2500,
    admissionFee: 2500,
    dressFee: 0,
    dressCost: 0,
    batchOptions: ['5:00 PM - 6:30 PM'],
    notes: 'Admission payment covers admission only. Dress is ordered through Shop. Monthly fee is collected in FeeTrack.',
  },
  herohalli: {
    monthlyFee: 500,
    admissionFee: 2000,
    dressFee: 0,
    dressCost: 0,
    batchOptions: ['6:00 AM - 7:00 AM'],
    notes: 'Admission payment is Rs. 2,000 and includes dress. Monthly fee is collected in FeeTrack.',
  },
}

type AdmissionRow = Record<string, unknown>
type PromoRow = Record<string, unknown>
type BranchSettingsRow = Record<string, unknown>

export type FeeQuote = {
  monthlyFee: number
  admissionFee: number
  dressFee: number
  joiningTotal: number
  promoSnapshot: Record<string, unknown>
  promoCodeId: string | null
  promoCode: string
}

type PhotoUpload = {
  buffer: Buffer
  filename: string
  mimeType: string
  size: number
}

export type AdmissionUploadResult = {
  bucket?: string
  path?: string
  filename?: string
  mimeType?: string
  size?: number
  status?: string
  uploadedAt?: string
}

function requireAdmissionDatabase() {
  if (!isSupabaseReady()) {
    throw new ValidationError(
      { database: ['Supabase is required for admissions.'] },
      'Admission database is not configured.'
    )
  }
}

function cleanText(value: unknown) {
  return String(value || '').trim()
}

function nullableText(value: unknown) {
  const text = cleanText(value)
  return text || null
}

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function boolValue(value: unknown) {
  return value === true || value === 'true' || value === 'on' || value === '1' || value === 'yes'
}

function normalizeAmount(value: unknown) {
  const amount = Number(value || 0)
  return Number.isFinite(amount) ? Math.max(0, amount) : 0
}

function normalizeNameKey(value: unknown) {
  return cleanText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeCode(value: unknown) {
  return cleanText(value).toUpperCase().replace(/[^A-Z0-9_-]+/g, '')
}

function escapeTelegramMarkdown(value: unknown) {
  return String(value || '').replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1')
}

function normalizePhone(value: unknown) {
  const digits = cleanText(value).replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2)
  return digits.slice(-10)
}

function actorName(session: Session | null) {
  return session?.user?.name || session?.user?.id || 'FeeTrack'
}

function todayIso() {
  return new Date().toISOString().split('T')[0]
}

function feeDefaultsForBranch(branchSlug: string, branchName?: string) {
  const defaults = BRANCH_ADMISSION_DEFAULTS[branchSlug]
  return {
    branchSlug,
    branchName: branchName || branchSlug,
    isEnabled: Boolean(defaults),
    showPublicCta: Boolean(defaults),
    defaultMonthlyFee: defaults?.monthlyFee || 0,
    defaultAdmissionFee: defaults?.admissionFee || 0,
    defaultDressFee: defaults?.dressFee || 0,
    defaultDressCost: defaults?.dressCost || 0,
    batchOptions: defaults?.batchOptions || [],
    notes: defaults?.notes || '',
    updatedAt: '',
  }
}

function monthNameFromDate(value: string) {
  const parsed = new Date(value)
  const index = Number.isFinite(parsed.getTime()) ? parsed.getMonth() : new Date().getMonth()
  return MONTHS[index] || MONTHS[new Date().getMonth()]
}

function parseJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((entry) => cleanText(entry)).filter(Boolean)
  if (typeof value !== 'string' || !value.trim()) return []

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.map((entry) => cleanText(entry)).filter(Boolean) : []
  } catch {
    return []
  }
}

function mapApplication(row: AdmissionRow) {
  const feeSetup = objectValue(row.fee_setup)
  const paymentProof = objectValue(feeSetup.paymentProof)
  const admissionPhoto = objectValue(feeSetup.admissionPhoto)

  return {
    id: cleanText(row.id),
    branchSlug: cleanText(row.branch_slug),
    branchName: cleanText(row.branch_name),
    preferredBatch: cleanText(row.preferred_batch),
    expectedJoinDate: cleanText(row.expected_join_date),
    studentName: cleanText(row.student_name),
    studentDob: cleanText(row.student_dob),
    studentGender: cleanText(row.student_gender),
    schoolClass: cleanText(row.school_class),
    guardianName: cleanText(row.guardian_name),
    guardianRelationship: cleanText(row.guardian_relationship),
    guardianPhone: cleanText(row.guardian_phone),
    guardianWhatsapp: cleanText(row.guardian_whatsapp),
    guardianEmail: cleanText(row.guardian_email),
    secondaryGuardianName: cleanText(row.secondary_guardian_name),
    secondaryGuardianRelationship: cleanText(row.secondary_guardian_relationship),
    secondaryGuardianPhone: cleanText(row.secondary_guardian_phone),
    emergencyName: cleanText(row.emergency_name),
    emergencyRelationship: cleanText(row.emergency_relationship),
    emergencyPhone: cleanText(row.emergency_phone),
    hasMedicalCondition: Boolean(row.has_medical_condition),
    medicalDetails: cleanText(row.medical_details),
    medications: cleanText(row.medications),
    specialRequirements: cleanText(row.special_requirements),
    hasPreviousTraining: Boolean(row.has_previous_training),
    martialArtsStyle: cleanText(row.martial_arts_style),
    trainingDuration: cleanText(row.training_duration),
    previousDojo: cleanText(row.previous_dojo),
    currentBelt: cleanText(row.current_belt),
    trainingNotes: cleanText(row.training_notes),
    referralSource: cleanText(row.referral_source),
    referrerName: cleanText(row.referrer_name),
    referrerContact: cleanText(row.referrer_contact),
    photoConsent: Boolean(row.photo_consent),
    dataConsent: Boolean(row.data_consent),
    participationConsent: Boolean(row.participation_consent),
    accuracyConsent: Boolean(row.accuracy_consent),
    promoCodeId: cleanText(row.promo_code_id),
    promoCode: cleanText(row.promo_code),
    promoSnapshot: row.promo_snapshot || {},
    quotedMonthlyFee: normalizeAmount(row.quoted_monthly_fee),
    quotedAdmissionFee: normalizeAmount(row.quoted_admission_fee),
    quotedDressFee: normalizeAmount(row.quoted_dress_fee),
    quotedJoiningTotal: normalizeAmount(row.quoted_joining_total),
    parentPhotoDriveFileId: cleanText(row.parent_photo_drive_file_id),
    parentPhotoDriveUrl: cleanText(row.parent_photo_drive_url),
    parentPhotoFilename: cleanText(admissionPhoto.filename) || cleanText(row.parent_photo_filename),
    parentPhotoMimeType: cleanText(admissionPhoto.mimeType) || cleanText(row.parent_photo_mime_type),
    admissionPhotoPath: cleanText(admissionPhoto.path),
    admissionPhotoUrl: '',
    admissionPhotoFilename: cleanText(admissionPhoto.filename) || cleanText(row.parent_photo_filename),
    admissionPhotoMimeType: cleanText(admissionPhoto.mimeType) || cleanText(row.parent_photo_mime_type),
    admissionPhotoSize: normalizeAmount(admissionPhoto.size || row.parent_photo_size),
    admissionPhotoUploadedAt: cleanText(admissionPhoto.uploadedAt),
    admissionPhotoStatus: cleanText(admissionPhoto.status) || (cleanText(admissionPhoto.path) ? 'submitted' : ''),
    paymentProofId: cleanText(paymentProof.proofId),
    paymentProofPath: cleanText(paymentProof.path),
    paymentProofUrl: '',
    paymentProofFilename: cleanText(paymentProof.filename),
    paymentProofMimeType: cleanText(paymentProof.mimeType),
    paymentProofSize: normalizeAmount(paymentProof.size),
    paymentProofUploadedAt: cleanText(paymentProof.uploadedAt),
    paymentProofStatus: cleanText(paymentProof.status) || 'submitted',
    duplicateWarnings: Array.isArray(row.duplicate_warnings) ? row.duplicate_warnings : [],
    status: cleanText(row.status) || 'pending',
    reviewNote: cleanText(row.review_note),
    rejectionReason: cleanText(row.rejection_reason),
    reviewedBy: cleanText(row.reviewed_by),
    reviewedAt: cleanText(row.reviewed_at),
    approvedSkfId: cleanText(row.approved_skf_id),
    finalPhotoUrl: cleanText(row.final_photo_url),
    feeSetup,
    createdAt: cleanText(row.created_at),
    updatedAt: cleanText(row.updated_at),
  }
}

type AdmissionApplicationMapped = ReturnType<typeof mapApplication>

function mapPromo(row: PromoRow) {
  return {
    id: cleanText(row.id),
    code: cleanText(row.code),
    name: cleanText(row.name),
    branchSlug: cleanText(row.branch_slug),
    status: cleanText(row.status) || 'active',
    discountType: cleanText(row.discount_type),
    discountValue: normalizeAmount(row.discount_value),
    appliesTo: cleanText(row.applies_to),
    validFrom: cleanText(row.valid_from),
    validUntil: cleanText(row.valid_until),
    maxUses: row.max_uses === null || row.max_uses === undefined ? null : Number(row.max_uses),
    maxUsesPerPhone:
      row.max_uses_per_phone === null || row.max_uses_per_phone === undefined
        ? null
        : Number(row.max_uses_per_phone),
    notes: cleanText(row.notes),
    createdAt: cleanText(row.created_at),
    updatedAt: cleanText(row.updated_at),
  }
}

function mapBranchSettings(row: BranchSettingsRow) {
  return {
    branchSlug: cleanText(row.branch_slug),
    branchName: cleanText(row.branch_name),
    isEnabled: row.is_enabled !== false,
    showPublicCta: Boolean(row.show_public_cta),
    defaultMonthlyFee: normalizeAmount(row.default_monthly_fee),
    defaultAdmissionFee: normalizeAmount(row.default_admission_fee),
    defaultDressFee: normalizeAmount(row.default_dress_fee),
    defaultDressCost: normalizeAmount(row.default_dress_cost),
    batchOptions: parseJsonArray(row.batch_options),
    notes: cleanText(row.notes),
    updatedAt: cleanText(row.updated_at),
  }
}

async function readImageFile(
  file?: File | null,
  options: {
    field?: string
    label?: string
    maxBytes?: number
    required?: boolean
  } = {}
): Promise<PhotoUpload | null> {
  const field = options.field || 'photo'
  const label = options.label || 'Photo'
  const maxBytes = options.maxBytes || MAX_ADMISSION_PHOTO_BYTES

  if ((!file || file.size === 0) && options.required) {
    throw new ValidationError({ [field]: [`${label} is required.`] })
  }

  if (!file || file.size === 0) return null
  const mimeType = file.type || 'application/octet-stream'

  if (!IMAGE_MIME_TYPES.has(mimeType)) {
    throw new ValidationError({ [field]: [`${label} must be a JPG, PNG, or WebP image.`] })
  }

  if (file.size > maxBytes) {
    throw new ValidationError({ [field]: [`${label} must be ${Math.round(maxBytes / 1024 / 1024)} MB or smaller.`] })
  }

  const arrayBuffer = await file.arrayBuffer()
  return {
    buffer: Buffer.from(arrayBuffer),
    filename: file.name || 'student-photo',
    mimeType,
    size: file.size,
  }
}

async function resolveBranch(branchSlug: string) {
  const classes = await getAllCitiesLive()
  const branch = flattenClassBranches(classes).find((entry) => entry.slug === branchSlug)
  if (!branch) throw new NotFoundError('Admission branch')
  return branch
}

async function getBranchSettings(branchSlug: string, branchName?: string) {
  requireAdmissionDatabase()
  const { data, error } = await supabaseAdmin
    .from('admission_branch_settings')
    .select('*')
    .eq('branch_slug', branchSlug)
    .maybeSingle()

  if (error) throw error
  if (data) return mapBranchSettings(data)

  return feeDefaultsForBranch(branchSlug, branchName)
}

async function findPromoForBranch(code: string, branchSlug: string) {
  const codeKey = normalizeCode(code)
  if (!codeKey) return null

  const { data, error } = await supabaseAdmin
    .from('admission_promo_codes')
    .select('*')
    .eq('code_key', codeKey)
    .or(`branch_slug.eq.${branchSlug},branch_slug.is.null`)
    .eq('status', 'active')
    .order('branch_slug', { ascending: false, nullsFirst: false })
    .limit(1)

  if (error) throw error
  return data?.[0] || null
}

async function usageCount(promoId: string, guardianPhone?: string) {
  const total = await supabaseAdmin
    .from('admission_promo_redemptions')
    .select('id', { count: 'exact', head: true })
    .eq('promo_code_id', promoId)

  if (total.error) throw total.error

  let perPhone = 0
  if (guardianPhone) {
    const byPhone = await supabaseAdmin
      .from('admission_promo_redemptions')
      .select('id', { count: 'exact', head: true })
      .eq('promo_code_id', promoId)
      .eq('guardian_phone', guardianPhone)
    if (byPhone.error) throw byPhone.error
    perPhone = byPhone.count || 0
  }

  return { total: total.count || 0, perPhone }
}

async function buildFeeQuote(input: {
  settings: ReturnType<typeof mapBranchSettings>
  branchSlug: string
  promoCode?: string
  guardianPhone?: string
}): Promise<FeeQuote> {
  let monthlyFee = input.settings.defaultMonthlyFee
  let admissionFee = input.settings.defaultAdmissionFee
  let dressFee = input.settings.defaultDressFee
  let promoSnapshot: Record<string, unknown> = {}
  let promoCodeId: string | null = null
  let promoCode = ''

  const row = input.promoCode ? await findPromoForBranch(input.promoCode, input.branchSlug) : null
  if (input.promoCode && !row) {
    throw new ValidationError({ promoCode: ['Promo code is invalid for this branch.'] })
  }

  if (row) {
    const today = todayIso()
    const validFrom = cleanText(row.valid_from)
    const validUntil = cleanText(row.valid_until)
    if (validFrom && validFrom > today) {
      throw new ValidationError({ promoCode: ['Promo code is not active yet.'] })
    }
    if (validUntil && validUntil < today) {
      throw new ValidationError({ promoCode: ['Promo code has expired.'] })
    }

    const maxUses = row.max_uses === null || row.max_uses === undefined ? null : Number(row.max_uses)
    const maxUsesPerPhone =
      row.max_uses_per_phone === null || row.max_uses_per_phone === undefined
        ? null
        : Number(row.max_uses_per_phone)
    const shouldCheckUsage = Boolean(maxUses || (maxUsesPerPhone && input.guardianPhone))
    const usage = shouldCheckUsage
      ? await usageCount(cleanText(row.id), input.guardianPhone)
      : { total: 0, perPhone: 0 }

    if (maxUses && usage.total >= maxUses) {
      throw new ValidationError({ promoCode: ['Promo code usage limit has been reached.'] })
    }
    if (maxUsesPerPhone && usage.perPhone >= maxUsesPerPhone) {
      throw new ValidationError({ promoCode: ['This phone number has already used this promo code.'] })
    }

    const discountType = cleanText(row.discount_type)
    const appliesTo = cleanText(row.applies_to)
    const discountValue = normalizeAmount(row.discount_value)
    const applyDiscount = (amount: number) => {
      if (discountType === 'percent') return Math.max(0, amount - Math.round((amount * discountValue) / 100))
      if (discountType === 'fixed') return Math.max(0, amount - discountValue)
      if (discountType === 'fee_override') return discountValue
      return amount
    }

    if (discountType === 'admission_waiver') {
      admissionFee = 0
    } else if (appliesTo === 'monthly') {
      monthlyFee = applyDiscount(monthlyFee)
    } else if (appliesTo === 'admission') {
      admissionFee = applyDiscount(admissionFee)
    } else if (appliesTo === 'dress') {
      dressFee = applyDiscount(dressFee)
    }

    promoCodeId = cleanText(row.id)
    promoCode = cleanText(row.code)
    promoSnapshot = {
      id: promoCodeId,
      code: promoCode,
      branchSlug: cleanText(row.branch_slug) || 'all',
      discountType,
      discountValue,
      appliesTo,
      original: {
        monthlyFee: input.settings.defaultMonthlyFee,
        admissionFee: input.settings.defaultAdmissionFee,
        dressFee: input.settings.defaultDressFee,
      },
    }
  }

  let joiningTotal = admissionFee + dressFee
  if (row && cleanText(row.applies_to) === 'joining_total') {
    const discountValue = normalizeAmount(row.discount_value)
    const joiningTotalBeforeDiscount = joiningTotal
    const discountType = cleanText(row.discount_type)

    if (discountType === 'percent') {
      joiningTotal = Math.max(0, joiningTotal - Math.round((joiningTotal * discountValue) / 100))
    } else if (discountType === 'fixed') {
      joiningTotal = Math.max(0, joiningTotal - discountValue)
    } else if (discountType === 'fee_override') {
      joiningTotal = discountValue
    }

    promoSnapshot.joiningTotalBeforeDiscount = joiningTotalBeforeDiscount
    promoSnapshot.joiningTotalAfterDiscount = joiningTotal
  }

  return {
    monthlyFee,
    admissionFee,
    dressFee,
    joiningTotal,
    promoSnapshot,
    promoCodeId,
    promoCode,
  }
}

async function findDuplicateWarnings(input: {
  studentName: string
  studentDob: string
  guardianPhone: string
  guardianEmail?: string
  excludeApplicationId?: string
}) {
  const nameKey = normalizeNameKey(input.studentName)
  const warnings: Array<Record<string, unknown>> = []
  const athletes = await getAllAthletesLive()
  const exactAthlete = athletes.find((athlete) => {
    const fullName = `${athlete.firstName || ''} ${athlete.lastName || ''}`
    return normalizeNameKey(fullName) === nameKey && cleanText(athlete.dateOfBirth) === input.studentDob
  })

  if (exactAthlete) {
    throw new ConflictError('A student with this name and date of birth already exists.', {
      skfId: exactAthlete.skfId,
    })
  }

  const { data: sameDobAdmissions, error } = await supabaseAdmin
    .from('admission_applications')
    .select('id, student_name, student_dob, guardian_phone, guardian_email, branch_name, status')
    .eq('student_dob', input.studentDob)
    .in('status', ['pending', 'approved'])

  if (error) throw error

  for (const row of sameDobAdmissions || []) {
    if (cleanText(row.id) === input.excludeApplicationId) continue
    if (normalizeNameKey(row.student_name) === nameKey) {
      throw new ConflictError('An admission for this student is already pending or approved.', {
        applicationId: row.id,
      })
    }
  }

  const phone = normalizePhone(input.guardianPhone)
  if (phone) {
    const { data: samePhoneRows, error: phoneError } = await supabaseAdmin
      .from('admission_applications')
      .select('id, guardian_phone, branch_name, status')
      .eq('guardian_phone', phone)
      .in('status', ['pending', 'approved'])

    if (phoneError) throw phoneError

    const samePhone = (samePhoneRows || []).filter((row) => cleanText(row.id) !== input.excludeApplicationId)
    if (samePhone.length > 0) {
      warnings.push({
        type: 'same_guardian_phone',
        message: 'Another admission uses the same guardian phone.',
        count: samePhone.length,
      })
    }
  }

  const email = cleanText(input.guardianEmail).toLowerCase()
  if (email) {
    const { data: sameEmailRows, error: emailError } = await supabaseAdmin
      .from('admission_applications')
      .select('id, guardian_email, branch_name, status')
      .eq('guardian_email', email)
      .in('status', ['pending', 'approved'])

    if (emailError) throw emailError

    const sameEmail = (sameEmailRows || []).filter((row) => cleanText(row.id) !== input.excludeApplicationId)
    if (sameEmail.length > 0) {
      warnings.push({
        type: 'same_guardian_email',
        message: 'Another admission uses the same guardian email.',
        count: sameEmail.length,
      })
    }
  }

  return warnings
}

async function uploadFinalProfilePhoto(skfId: string, photo: PhotoUpload) {
  const extension = admissionImageExtension(photo.mimeType)
  const normalizedSkfId = normaliseSkfId(skfId)
  const path = `${normalizedSkfId}/${normalizedSkfId}.${extension}`
  const { error } = await supabaseAdmin.storage.from(PROFILE_PHOTO_BUCKET).upload(path, photo.buffer, {
    contentType: photo.mimeType,
    upsert: true,
  })

  if (error) throw error

  const { data } = supabaseAdmin.storage.from(PROFILE_PHOTO_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

async function readSubmittedAdmissionPhoto(application: AdmissionApplicationMapped): Promise<PhotoUpload> {
  const meta = objectValue(application.feeSetup.admissionPhoto)
  const path = cleanText(application.admissionPhotoPath) || cleanText(meta.path)
  if (!path) {
    throw new ValidationError({
      finalPhoto: ['Submitted admission photo is not available. Upload a corrected profile photo instead.'],
    })
  }

  const { data, error } = await supabaseAdmin.storage.from(ADMISSION_PHOTO_BUCKET).download(path)
  if (error || !data) {
    throw new ValidationError({
      finalPhoto: ['Submitted admission photo could not be loaded. Upload a corrected profile photo instead.'],
    })
  }

  const arrayBuffer = await data.arrayBuffer()
  const mimeType = cleanText(application.admissionPhotoMimeType) || cleanText(meta.mimeType) || data.type || 'image/jpeg'
  if (!IMAGE_MIME_TYPES.has(mimeType)) {
    throw new ValidationError({
      finalPhoto: ['Submitted admission photo is not a supported image. Upload a corrected profile photo instead.'],
    })
  }

  return {
    buffer: Buffer.from(arrayBuffer),
    filename: cleanText(application.admissionPhotoFilename) || cleanText(meta.filename) || 'submitted-admission-photo',
    mimeType,
    size: Number(application.admissionPhotoSize || meta.size || data.size || 0),
  }
}

export function admissionImageExtension(mimeType: string) {
  if (mimeType === 'image/png') return 'png'
  if (mimeType === 'image/webp') return 'webp'
  return 'jpg'
}

export function buildAdmissionPaymentProofStoragePath(
  applicationId: string,
  proofId: string,
  mimeType: string
) {
  return `admissions/${applicationId}/${proofId}.${admissionImageExtension(mimeType)}`
}

export function buildAdmissionPhotoStoragePath(
  applicationId: string,
  photoId: string,
  mimeType: string
) {
  return `admissions/${applicationId}/parent-photo-${photoId}.${admissionImageExtension(mimeType)}`
}

export function buildAdmissionPhotoStoredMeta(input: {
  path: string
  proof: Pick<PhotoUpload, 'filename' | 'mimeType' | 'size'>
  uploadedAt?: string
}) {
  return {
    bucket: ADMISSION_PHOTO_BUCKET,
    path: input.path,
    filename: input.proof.filename,
    mimeType: input.proof.mimeType,
    size: input.proof.size,
    status: 'submitted',
    uploadedAt: input.uploadedAt || new Date().toISOString(),
  }
}

export function buildAdmissionPaymentProofInsertPayload(input: {
  proofId: string
  applicationId: string
  branchSlug: string
  branchName: string
  studentName: string
  guardianPhone: string
  amount: number
  proof: Pick<PhotoUpload, 'filename' | 'mimeType' | 'size'>
  quote: FeeQuote
  path?: string
}) {
  const path = input.path || buildAdmissionPaymentProofStoragePath(
    input.applicationId,
    input.proofId,
    input.proof.mimeType
  )
  const paymentReference = `Admission ${input.applicationId.slice(0, 8).toUpperCase()}`

  return {
    id: input.proofId,
    fee_record_id: null,
    payment_intent_id: null,
    skf_id: `ADMISSION-${input.applicationId.slice(0, 8).toUpperCase()}`,
    amount: input.amount,
    payment_reference: paymentReference,
    proof_path: path,
    proof_filename: input.proof.filename,
    metadata: {
      sourceType: 'admission_application',
      applicationId: input.applicationId,
      branchSlug: input.branchSlug,
      branchName: input.branchName,
      studentName: input.studentName,
      guardianPhone: input.guardianPhone,
      feeType: 'admission',
      quotedAdmissionFee: input.quote.admissionFee,
      quotedDressFee: input.quote.dressFee,
      quotedJoiningTotal: input.quote.joiningTotal,
      promoCode: input.quote.promoCode || null,
    },
  }
}

export function buildAdmissionPaymentProofStoredMeta(input: {
  proofId: string
  path: string
  amount: number
  paymentReference: string
  proof: Pick<PhotoUpload, 'filename' | 'mimeType' | 'size'>
  uploadedAt?: string
}) {
  return {
    proofId: input.proofId,
    bucket: PAYMENT_PROOF_BUCKET,
    path: input.path,
    amount: input.amount,
    paymentReference: input.paymentReference,
    filename: input.proof.filename,
    mimeType: input.proof.mimeType,
    size: input.proof.size,
    status: 'submitted',
    uploadedAt: input.uploadedAt || new Date().toISOString(),
  }
}

export function buildAdmissionApplicationInsertPayload(input: {
  applicationId: string
  branch: { slug: string; name: string }
  form: PublicAdmissionInput
  quote: FeeQuote
  admissionPhotoMeta?: AdmissionUploadResult | null
  photo?: Pick<PhotoUpload, 'filename' | 'mimeType' | 'size'> | null
  duplicateWarnings?: Array<Record<string, unknown>>
  paymentProofMeta?: Record<string, unknown> | null
}) {
  const { applicationId, branch, form, quote } = input
  const admissionPhoto = input.admissionPhotoMeta || {}
  const photo = input.photo || null
  const feeSetup: Record<string, unknown> = {}
  if (input.paymentProofMeta) feeSetup.paymentProof = input.paymentProofMeta
  if (input.admissionPhotoMeta) feeSetup.admissionPhoto = input.admissionPhotoMeta

  return {
    id: applicationId,
    branch_slug: branch.slug,
    branch_name: branch.name,
    preferred_batch: nullableText(form.preferredBatch),
    expected_join_date: form.expectedJoinDate || null,
    student_name: form.studentName,
    student_name_key: normalizeNameKey(form.studentName),
    student_dob: form.studentDob,
    student_gender: form.studentGender,
    school_class: nullableText(form.schoolClass),
    guardian_name: form.guardianName,
    guardian_relationship: form.guardianRelationship,
    guardian_phone: normalizePhone(form.guardianPhone),
    guardian_whatsapp: normalizePhone(form.guardianWhatsapp),
    guardian_email: nullableText(form.guardianEmail)?.toLowerCase() || null,
    secondary_guardian_name: nullableText(form.secondaryGuardianName),
    secondary_guardian_relationship: nullableText(form.secondaryGuardianRelationship),
    secondary_guardian_phone: form.secondaryGuardianPhone ? normalizePhone(form.secondaryGuardianPhone) : null,
    emergency_name: form.emergencyName,
    emergency_relationship: form.emergencyRelationship,
    emergency_phone: normalizePhone(form.emergencyPhone),
    has_medical_condition: form.hasMedicalCondition,
    medical_details: nullableText(form.medicalDetails),
    medications: nullableText(form.medications),
    special_requirements: nullableText(form.specialRequirements),
    has_previous_training: form.hasPreviousTraining,
    martial_arts_style: nullableText(form.martialArtsStyle),
    training_duration: nullableText(form.trainingDuration),
    previous_dojo: nullableText(form.previousDojo),
    current_belt: nullableText(form.currentBelt),
    training_notes: nullableText(form.trainingNotes),
    referral_source: nullableText(form.referralSource),
    referrer_name: nullableText(form.referrerName),
    referrer_contact: nullableText(form.referrerContact),
    photo_consent: form.photoConsent,
    data_consent: form.dataConsent,
    participation_consent: form.participationConsent,
    accuracy_consent: form.accuracyConsent,
    consent_given_at: new Date().toISOString(),
    promo_code_id: quote.promoCodeId,
    promo_code: quote.promoCode || nullableText(form.promoCode),
    promo_snapshot: quote.promoSnapshot,
    quoted_monthly_fee: quote.monthlyFee,
    quoted_admission_fee: quote.admissionFee,
    quoted_dress_fee: quote.dressFee,
    quoted_joining_total: quote.joiningTotal,
    parent_photo_drive_file_id: null,
    parent_photo_drive_url: null,
    parent_photo_filename: admissionPhoto.filename || photo?.filename || null,
    parent_photo_mime_type: admissionPhoto.mimeType || photo?.mimeType || null,
    parent_photo_size: admissionPhoto.size || photo?.size || null,
    duplicate_warnings: input.duplicateWarnings || [],
    fee_setup: feeSetup,
  }
}

async function recordAdmissionPhoto(input: {
  applicationId: string
  photo: PhotoUpload
}) {
  const photoId = crypto.randomUUID()
  const path = buildAdmissionPhotoStoragePath(input.applicationId, photoId, input.photo.mimeType)
  const { error } = await supabaseAdmin.storage.from(ADMISSION_PHOTO_BUCKET).upload(path, input.photo.buffer, {
    contentType: input.photo.mimeType,
    upsert: false,
  })

  if (error) throw error

  return buildAdmissionPhotoStoredMeta({
    path,
    proof: input.photo,
  })
}

async function removeAdmissionPhoto(path?: string) {
  const normalizedPath = cleanText(path)
  if (!normalizedPath) return

  try {
    await supabaseAdmin.storage.from(ADMISSION_PHOTO_BUCKET).remove([normalizedPath])
  } catch (error) {
    logger.warn('admission.photo_cleanup_failed', { path: normalizedPath, error })
  }
}

async function deleteAdmissionPhoto(meta?: Record<string, unknown> | null) {
  await removeAdmissionPhoto(cleanText(meta?.path))
}

function clearTemporaryAdmissionPhotoFields(feeSetup: Record<string, unknown>) {
  const next = { ...feeSetup }
  delete next.admissionPhoto
  return {
    feeSetup: next,
    columns: {
      parent_photo_drive_file_id: null,
      parent_photo_drive_url: null,
      parent_photo_filename: null,
      parent_photo_mime_type: null,
      parent_photo_size: null,
    },
  }
}

async function recordAdmissionPaymentProof(input: {
  applicationId: string
  branchSlug: string
  branchName: string
  studentName: string
  guardianPhone: string
  amount: number
  proof: PhotoUpload
  quote: FeeQuote
}) {
  const proof = input.proof
  const proofId = crypto.randomUUID()
  const path = buildAdmissionPaymentProofStoragePath(input.applicationId, proofId, proof.mimeType)
  const { error } = await supabaseAdmin.storage.from(PAYMENT_PROOF_BUCKET).upload(path, proof.buffer, {
    contentType: proof.mimeType,
    upsert: false,
  })

  if (error) throw error

  const proofPayload = buildAdmissionPaymentProofInsertPayload({
    proofId,
    applicationId: input.applicationId,
    branchSlug: input.branchSlug,
    branchName: input.branchName,
    studentName: input.studentName,
    guardianPhone: input.guardianPhone,
    amount: input.amount,
    proof,
    quote: input.quote,
    path,
  })

  const { data: insertedProof, error: insertError } = await supabaseAdmin
    .from('fee_payment_proofs')
    .insert(proofPayload)
    .select('id')
    .single()

  if (insertError) {
    await removeAdmissionPaymentProof(path)
    throw insertError
  }

  return buildAdmissionPaymentProofStoredMeta({
    proofId: cleanText(insertedProof?.id) || proofId,
    path,
    amount: input.amount,
    paymentReference: proofPayload.payment_reference,
    proof,
  })
}

async function removeAdmissionPaymentProof(path?: string) {
  const normalizedPath = cleanText(path)
  if (!normalizedPath) return

  try {
    await supabaseAdmin.storage.from(PAYMENT_PROOF_BUCKET).remove([normalizedPath])
  } catch (error) {
    logger.warn('admission.payment_proof_cleanup_failed', { path: normalizedPath, error })
  }
}

async function deleteAdmissionPaymentProof(meta?: Record<string, unknown> | null) {
  const proofId = cleanText(meta?.proofId)
  const path = cleanText(meta?.path)
  if (proofId) {
    try {
      await supabaseAdmin.from('fee_payment_proofs').delete().eq('id', proofId)
    } catch (error) {
      logger.warn('admission.payment_proof_row_cleanup_failed', { proofId, error })
    }
  }
  await removeAdmissionPaymentProof(path)
}

async function reviewAdmissionPaymentProof(input: {
  application: AdmissionApplicationMapped
  status: 'approved' | 'rejected'
  reviewedBy: string
  reviewNote?: string | null
  skfId?: string | null
}) {
  const meta = objectValue(input.application.feeSetup.paymentProof)
  const proofId = cleanText(meta.proofId)
  const path = cleanText(meta.path)
  const reviewedAt = new Date().toISOString()
  const reviewedMeta: Record<string, unknown> = {
    ...meta,
    status: input.status,
    reviewedBy: input.reviewedBy,
    reviewedAt,
    reviewNote: input.reviewNote || null,
    skfId: input.skfId || cleanText(meta.skfId) || null,
  }

  if (proofId) {
    try {
      const updatePayload: Record<string, unknown> = {
        status: input.status,
        reviewed_by: input.reviewedBy,
        reviewed_at: reviewedAt,
        review_note: input.reviewNote || null,
      }
      if (input.skfId) updatePayload.skf_id = normaliseSkfId(input.skfId)
      await supabaseAdmin.from('fee_payment_proofs').update(updatePayload).eq('id', proofId)
    } catch (error) {
      logger.warn('admission.payment_proof_review_update_failed', {
        applicationId: input.application.id,
        proofId,
        status: input.status,
        error,
      })
    }
  }

  if (path) {
    await removeAdmissionPaymentProof(path)
    reviewedMeta.storageDeletedAt = new Date().toISOString()
  }

  return reviewedMeta
}

async function attachPaymentProofUrls(applications: AdmissionApplicationMapped[]) {
  return Promise.all(applications.map(async (application) => {
    let nextApplication = application

    if (application.paymentProofPath && application.paymentProofStatus === 'submitted') {
      const { data, error } = await supabaseAdmin.storage
        .from(PAYMENT_PROOF_BUCKET)
        .createSignedUrl(application.paymentProofPath, 10 * 60)

      if (error) {
        logger.warn('admission.payment_proof_signed_url_failed', {
          applicationId: application.id,
          path: application.paymentProofPath,
          error,
        })
      } else {
        nextApplication = {
          ...nextApplication,
          paymentProofUrl: data.signedUrl || '',
        }
      }
    }

    if (application.admissionPhotoPath && application.admissionPhotoStatus === 'submitted') {
      const { data, error } = await supabaseAdmin.storage
        .from(ADMISSION_PHOTO_BUCKET)
        .createSignedUrl(application.admissionPhotoPath, 10 * 60)

      if (error) {
        logger.warn('admission.photo_signed_url_failed', {
          applicationId: application.id,
          path: application.admissionPhotoPath,
          error,
        })
      } else {
        nextApplication = {
          ...nextApplication,
          admissionPhotoUrl: data.signedUrl || '',
        }
      }
    }

    return nextApplication
  }))
}

async function sendAdmissionAlert(application: ReturnType<typeof mapApplication>) {
  if (!hasTelegramChannel('leads')) return

  const message = [
    '🔔 *New Admission in FeeTrack*',
    '',
    `*Student:* ${escapeTelegramMarkdown(application.studentName)}`,
    `*Branch:* ${escapeTelegramMarkdown(application.branchName)}`,
    `*Guardian:* ${escapeTelegramMarkdown(application.guardianName)}`,
    `*Reference:* ${escapeTelegramMarkdown(application.id.slice(0, 8).toUpperCase())}`,
    '',
    `Open FeeTrack > Admissions to review`,
  ].join('\n')

  try {
    await retryWithBackoff(async () => {
      const result = await sendTelegramMessage({
        channel: 'leads',
        text: message,
        parseMode: 'Markdown',
        timeoutMs: 5000,
      })
      if (!result.ok) throw new Error(result.error || 'Telegram admission alert failed')
    }, 2, 800)
  } catch (error) {
    logger.warn('admission.telegram_alert_failed', { applicationId: application.id, error })
  }
}

async function sendAdmissionPushAlert(application: ReturnType<typeof mapApplication>) {
  try {
    await sendFeeTrackPushNotification({
      title: 'New Admission Application',
      body: `${application.studentName} • ${application.branchName} • Rs. ${application.quotedJoiningTotal.toLocaleString('en-IN')}`,
      url: '/admissions',
      tag: `admission-${application.id}`,
    })
  } catch (error) {
    logger.warn('admission.push_alert_failed', { applicationId: application.id, error })
  }
}

async function recordApprovedJoiningFeesPaid(
  session: Session | null,
  input: {
    skfId: string
    billingStartDate: string
    admissionFee: number
    dressFee: number
    applicationId: string
  }
) {
  if (!session) return

  const year = new Date(input.billingStartDate).getFullYear()
  const month = monthNameFromDate(input.billingStartDate)
  const paymentReference = `Admission ${input.applicationId.slice(0, 8).toUpperCase()}`

  if (input.admissionFee > 0) {
    await FeeOperationsService.runLedgerAction(session, {
      action: 'mark_paid',
      skfId: input.skfId,
      feeType: 'admission',
      month,
      year,
      paymentMethod: 'upi_qr',
      paymentReference,
      notes: 'Recorded from verified admission approval.',
    })
  }

  if (input.dressFee > 0) {
    await FeeOperationsService.runLedgerAction(session, {
      action: 'mark_paid',
      skfId: input.skfId,
      feeType: 'dress',
      month,
      year,
      paymentMethod: 'upi_qr',
      paymentReference,
      notes: 'Recorded from verified admission approval.',
    })
  }
}

export class AdmissionService {
  static async getPublicBranchConfig(branchSlug: string) {
    const branch = await resolveBranch(branchSlug)
    const settings = await getBranchSettings(branch.slug, branch.name)
    const batchOptions = Array.from(new Set([branch.classTime, ...settings.batchOptions].map(cleanText).filter(Boolean)))
    return {
      branch: {
        slug: branch.slug,
        name: branch.name,
        cityName: branch.cityName,
        classTime: branch.classTime,
        address: branch.address,
        photos: branch.photos || [],
      },
      settings: {
        ...settings,
        branchName: branch.name,
        batchOptions,
      },
    }
  }

  static async previewFeeQuote(input: {
    branchSlug: string
    promoCode?: string
    guardianPhone?: string
  }) {
    const branch = await resolveBranch(input.branchSlug)
    const settings = await getBranchSettings(branch.slug, branch.name)
    const quote = await buildFeeQuote({
      settings,
      branchSlug: branch.slug,
      promoCode: input.promoCode,
      guardianPhone: normalizePhone(input.guardianPhone),
    })

    return {
      branchSlug: branch.slug,
      branchName: branch.name,
      quotedMonthlyFee: quote.monthlyFee,
      quotedAdmissionFee: quote.admissionFee,
      quotedDressFee: quote.dressFee,
      quotedJoiningTotal: quote.joiningTotal,
      promoCode: quote.promoCode,
      promoSnapshot: quote.promoSnapshot,
      notes: settings.notes,
    }
  }

  static async createApplication(
    input: PublicAdmissionInput,
    files: {
      studentPhoto?: File | null
      paymentProof?: File | null
    } = {}
  ) {
    requireAdmissionDatabase()
    const branch = await resolveBranch(input.branchSlug)
    const settings = await getBranchSettings(branch.slug, branch.name)
    if (!settings.isEnabled) {
      throw new ValidationError({ branch: ['This branch admission form is currently closed.'] })
    }

    const warnings = await findDuplicateWarnings({
      studentName: input.studentName,
      studentDob: input.studentDob,
      guardianPhone: input.guardianPhone,
      guardianEmail: input.guardianEmail,
    })
    const quote = await buildFeeQuote({
      settings,
      branchSlug: branch.slug,
      promoCode: input.promoCode,
      guardianPhone: normalizePhone(input.guardianPhone),
    })

    const photo = await readImageFile(files.studentPhoto, {
      field: 'studentPhoto',
      label: 'Student photo',
      required: true,
    })
    const paymentProof = await readImageFile(files.paymentProof, {
      field: 'paymentProof',
      label: 'Payment screenshot',
      maxBytes: MAX_ADMISSION_PAYMENT_PROOF_BYTES,
      required: true,
    })
    const applicationId = crypto.randomUUID()
    let admissionPhotoMeta: AdmissionUploadResult | null = null
    let paymentProofMeta: Record<string, unknown> | null = null

    try {
      admissionPhotoMeta = photo
        ? await recordAdmissionPhoto({
          applicationId,
          photo,
        })
        : null

      paymentProofMeta = paymentProof
        ? await recordAdmissionPaymentProof({
          applicationId,
          branchSlug: branch.slug,
          branchName: branch.name,
          studentName: input.studentName,
          guardianPhone: normalizePhone(input.guardianPhone),
          amount: quote.joiningTotal,
          proof: paymentProof,
          quote,
        })
        : null

      const payload = buildAdmissionApplicationInsertPayload({
        applicationId,
        branch,
        form: input,
        quote,
        admissionPhotoMeta,
        photo,
        duplicateWarnings: warnings,
        paymentProofMeta,
      })

      const { data, error } = await supabaseAdmin
        .from('admission_applications')
        .insert(payload)
        .select('*')
        .single()

      if (error) throw error

      const application = mapApplication(data)
      await sendAdmissionAlert(application)
      await sendAdmissionPushAlert(application)
      return application
    } catch (error) {
      await deleteAdmissionPaymentProof(paymentProofMeta)
      await deleteAdmissionPhoto(admissionPhotoMeta)
      throw error
    }
  }

  static async listApplications(query: AdmissionListQueryInput) {
    requireAdmissionDatabase()
    let request = supabaseAdmin
      .from('admission_applications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(query.limit)

    if (query.status !== 'all') request = request.eq('status', query.status)
    if (query.branchSlug) request = request.eq('branch_slug', query.branchSlug)

    const { data, error } = await request
    if (error) throw error

    const search = normalizeNameKey(query.search)
    const applications = (data || []).map(mapApplication).filter((application) => {
      if (!search) return true
      return normalizeNameKey(
        `${application.studentName} ${application.guardianName} ${application.guardianPhone} ${application.branchName}`
      ).includes(search)
    })

    return attachPaymentProofUrls(applications)
  }

  static async getApplication(applicationId: string) {
    requireAdmissionDatabase()
    const { data, error } = await supabaseAdmin
      .from('admission_applications')
      .select('*')
      .eq('id', applicationId)
      .maybeSingle()

    if (error) throw error
    if (!data) throw new NotFoundError('Admission application')
    const [application] = await attachPaymentProofUrls([mapApplication(data)])
    return application
  }

  static async rejectApplication(session: Session, applicationId: string, reason: string) {
    requireAdmissionDatabase()
    const { data, error } = await supabaseAdmin
      .from('admission_applications')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        reviewed_by: actorName(session),
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId)
      .eq('status', 'pending')
      .select('*')
      .maybeSingle()

    if (error) throw error
    if (!data) throw new NotFoundError('Pending admission application')
    const application = mapApplication(data)
    const reviewedProof = await reviewAdmissionPaymentProof({
      application,
      status: 'rejected',
      reviewedBy: actorName(session),
      reviewNote: reason,
    })
    const clearedPhoto = clearTemporaryAdmissionPhotoFields({
      ...application.feeSetup,
      paymentProof: reviewedProof,
    })
    await deleteAdmissionPhoto(objectValue(application.feeSetup.admissionPhoto))
    await supabaseAdmin
      .from('admission_applications')
      .update({
        ...clearedPhoto.columns,
        fee_setup: clearedPhoto.feeSetup,
        updated_at: new Date().toISOString(),
      })
      .eq('id', application.id)

    return {
      ...application,
      feeSetup: clearedPhoto.feeSetup,
      admissionPhotoPath: '',
      admissionPhotoUrl: '',
      paymentProofStatus: 'rejected',
      paymentProofUrl: '',
    }
  }

  static async approveApplication(
    session: Session,
    fields: AdmissionApprovalFieldsInput,
    finalPhotoFile?: File | null
  ) {
    requireAdmissionDatabase()
    const application = await AdmissionService.getApplication(fields.applicationId)
    if (application.status !== 'pending') {
      throw new ConflictError('Only pending admissions can be approved.')
    }

    const warnings = await findDuplicateWarnings({
      studentName: application.studentName,
      studentDob: application.studentDob,
      guardianPhone: application.guardianPhone,
      guardianEmail: application.guardianEmail,
      excludeApplicationId: application.id,
    })

    const belt = BELTS.has(cleanText(fields.belt).toLowerCase()) ? cleanText(fields.belt).toLowerCase() : 'white'
    const athletePayload = validateAthletePayload(
      buildAthletePayloadFromForm({
        name: application.studentName,
        dob: application.studentDob,
        gender: application.studentGender,
        branch: application.branchName,
        batch: fields.batch || application.preferredBatch,
        belt,
        enrolledDate: fields.billingStartDate,
        status: 'Active',
        parentName: application.guardianName,
        phone: application.guardianPhone,
        email: application.guardianEmail,
        monthlyFee: fields.monthlyFee,
        photoConsent: application.photoConsent,
        dataConsent: application.dataConsent,
        consentGivenAt: new Date().toISOString(),
        isPublic: fields.isPublic,
        isFeatured: false,
      })
    )

    const uploadedFinalPhoto = await readImageFile(finalPhotoFile, {
      field: 'finalPhoto',
      label: 'Final profile photo',
      required: fields.photoAction === 'upload_new',
    })
    const finalPhoto = uploadedFinalPhoto || await readSubmittedAdmissionPhoto(application)

    let athlete = await createAthleteLive(athletePayload)
    let finalPhotoUrl = ''

    if (finalPhoto) {
      finalPhotoUrl = await uploadFinalProfilePhoto(athlete.skfId, finalPhoto)
      const updated = await updateAthleteLive(athlete.id, {
        ...athlete,
        photoUrl: finalPhotoUrl,
        achievements: athlete.achievements as (Record<string, unknown> & { type?: string })[],
      } as Parameters<typeof updateAthleteLive>[1])
      if (updated) athlete = updated
    }

    const skfId = normaliseSkfId(athlete.skfId)
    await supabaseAdmin.from('auth_sessions').upsert(
      {
        skf_id: skfId,
        pin_hash: '',
        failed_attempts: 0,
        locked_until: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'skf_id' }
    )

    await supabaseAdmin.from('student_billing_profiles').upsert(
      {
        skf_id: skfId,
        billing_status: 'active',
        monthly_fee: fields.monthlyFee,
        admission_fee: fields.admissionFee,
        dress_fee: fields.dressFee,
        dress_cost: fields.dressCost,
        billing_start_date: fields.billingStartDate,
        branch_snapshot: application.branchName,
        notes: fields.reviewNote || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'skf_id' }
    )

    const billingStartYear = new Date(fields.billingStartDate).getFullYear()
    try {
      await FeeOperationsService.syncStudent(session, skfId, billingStartYear)
      await recordApprovedJoiningFeesPaid(session, {
        skfId,
        billingStartDate: fields.billingStartDate,
        admissionFee: fields.admissionFee,
        dressFee: fields.dressFee,
        applicationId: application.id,
      })
    } catch (error) {
      logger.error('admission.fee_sync_failed', { skfId, error })
      throw error
    }

    const feeSetup = {
      monthlyFee: fields.monthlyFee,
      admissionFee: fields.admissionFee,
      dressFee: fields.dressFee,
      dressCost: fields.dressCost,
      billingStartDate: fields.billingStartDate,
      batch: fields.batch || application.preferredBatch,
      belt,
      paymentVerified: fields.paymentVerified,
      joiningPaymentRecorded: true,
      photoAction: fields.photoAction,
      sourcePhotoDriveFileId: null,
      paymentProof: objectValue(application.feeSetup.paymentProof),
    }

    const { data, error } = await supabaseAdmin
      .from('admission_applications')
      .update({
        status: 'approved',
        reviewed_by: actorName(session),
        reviewed_at: new Date().toISOString(),
        review_note: fields.reviewNote || null,
        approved_skf_id: skfId,
        final_photo_url: finalPhotoUrl || null,
        fee_setup: feeSetup,
        duplicate_warnings: warnings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', application.id)
      .eq('status', 'pending')
      .select('*')
      .single()

    if (error) throw error

    const reviewedPaymentProof = await reviewAdmissionPaymentProof({
      application,
      status: 'approved',
      reviewedBy: actorName(session),
      reviewNote: fields.reviewNote || 'Admission payment verified during approval.',
      skfId,
    })
    const finalFeeSetup = {
      ...feeSetup,
      paymentProof: reviewedPaymentProof,
    }
    const clearedPhoto = clearTemporaryAdmissionPhotoFields(finalFeeSetup)
    await deleteAdmissionPhoto(objectValue(application.feeSetup.admissionPhoto))
    await supabaseAdmin
      .from('admission_applications')
      .update({
        ...clearedPhoto.columns,
        fee_setup: clearedPhoto.feeSetup,
        updated_at: new Date().toISOString(),
      })
      .eq('id', application.id)

    if (application.promoCodeId) {
      await supabaseAdmin.from('admission_promo_redemptions').insert({
        promo_code_id: application.promoCodeId,
        application_id: application.id,
        skf_id: skfId,
        branch_slug: application.branchSlug,
        guardian_phone: application.guardianPhone,
        discount_snapshot: application.promoSnapshot || {},
      })
    }

    revalidateAthleteSitePaths(skfId)
    return {
      application: mapApplication({
        ...data,
        ...clearedPhoto.columns,
        fee_setup: clearedPhoto.feeSetup,
      }),
      athlete,
      skfId,
    }
  }

  static async listPromos() {
    requireAdmissionDatabase()
    const { data, error } = await supabaseAdmin
      .from('admission_promo_codes')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data || []).map(mapPromo)
  }

  static async upsertPromo(session: Session, input: AdmissionPromoCodeInput) {
    requireAdmissionDatabase()
    const payload = {
      code: normalizeCode(input.code),
      code_key: normalizeCode(input.code),
      name: nullableText(input.name),
      branch_slug: nullableText(input.branchSlug),
      status: input.status,
      discount_type: input.discountType,
      discount_value: input.discountValue,
      applies_to: input.appliesTo,
      valid_from: input.validFrom || null,
      valid_until: input.validUntil || null,
      max_uses: input.maxUses || null,
      max_uses_per_phone: input.maxUsesPerPhone || null,
      notes: nullableText(input.notes),
      updated_by: actorName(session),
      updated_at: new Date().toISOString(),
    }

    if (!payload.code) {
      throw new ValidationError({ code: ['Promo code is required.'] })
    }

    const query = input.id
      ? supabaseAdmin
          .from('admission_promo_codes')
          .update(payload)
          .eq('id', input.id)
          .select('*')
          .single()
      : supabaseAdmin
          .from('admission_promo_codes')
          .insert({ ...payload, created_by: actorName(session) })
          .select('*')
          .single()

    const { data, error } = await query
    if (error) throw error
    return mapPromo(data)
  }

  static async listBranchSettings() {
    requireAdmissionDatabase()
    const { data, error } = await supabaseAdmin
      .from('admission_branch_settings')
      .select('*')
      .order('branch_name', { ascending: true })
    if (error) throw error
    return (data || []).map(mapBranchSettings)
  }

  static async updateBranchSettings(session: Session, input: AdmissionBranchSettingsInput) {
    requireAdmissionDatabase()
    const { data, error } = await supabaseAdmin
      .from('admission_branch_settings')
      .upsert(
        {
          branch_slug: input.branchSlug,
          branch_name: input.branchName,
          is_enabled: input.isEnabled,
          show_public_cta: input.showPublicCta,
          default_monthly_fee: input.defaultMonthlyFee,
          default_admission_fee: input.defaultAdmissionFee,
          default_dress_fee: input.defaultDressFee,
          default_dress_cost: input.defaultDressCost,
          batch_options: input.batchOptions,
          notes: nullableText(input.notes),
          updated_by: actorName(session),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'branch_slug' }
      )
      .select('*')
      .single()

    if (error) throw error
    return mapBranchSettings(data)
  }
}

export function admissionFormValue(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value : ''
}

export function admissionFormBoolean(formData: FormData, key: string) {
  return boolValue(formData.get(key))
}

export function parsePublicAdmissionFormData(formData: FormData) {
  return publicAdmissionSchema.parse({
    branchSlug: admissionFormValue(formData, 'branchSlug'),
    preferredBatch: admissionFormValue(formData, 'preferredBatch'),
    expectedJoinDate: admissionFormValue(formData, 'expectedJoinDate'),
    studentName: admissionFormValue(formData, 'studentName'),
    studentDob: admissionFormValue(formData, 'studentDob'),
    studentGender: admissionFormValue(formData, 'studentGender') || 'male',
    schoolClass: admissionFormValue(formData, 'schoolClass'),
    guardianName: admissionFormValue(formData, 'guardianName'),
    guardianRelationship: admissionFormValue(formData, 'guardianRelationship'),
    guardianPhone: admissionFormValue(formData, 'guardianPhone'),
    guardianWhatsapp: admissionFormValue(formData, 'guardianWhatsapp'),
    guardianEmail: admissionFormValue(formData, 'guardianEmail'),
    secondaryGuardianName: admissionFormValue(formData, 'secondaryGuardianName'),
    secondaryGuardianRelationship: admissionFormValue(formData, 'secondaryGuardianRelationship'),
    secondaryGuardianPhone: admissionFormValue(formData, 'secondaryGuardianPhone'),
    emergencyName: admissionFormValue(formData, 'emergencyName'),
    emergencyRelationship: admissionFormValue(formData, 'emergencyRelationship'),
    emergencyPhone: admissionFormValue(formData, 'emergencyPhone'),
    hasMedicalCondition: admissionFormBoolean(formData, 'hasMedicalCondition'),
    medicalDetails: admissionFormValue(formData, 'medicalDetails'),
    medications: admissionFormValue(formData, 'medications'),
    specialRequirements: admissionFormValue(formData, 'specialRequirements'),
    hasPreviousTraining: admissionFormBoolean(formData, 'hasPreviousTraining'),
    martialArtsStyle: admissionFormValue(formData, 'martialArtsStyle'),
    trainingDuration: admissionFormValue(formData, 'trainingDuration'),
    previousDojo: admissionFormValue(formData, 'previousDojo'),
    currentBelt: admissionFormValue(formData, 'currentBelt'),
    trainingNotes: admissionFormValue(formData, 'trainingNotes'),
    promoCode: admissionFormValue(formData, 'promoCode'),
    referralSource: admissionFormValue(formData, 'referralSource'),
    referrerName: admissionFormValue(formData, 'referrerName'),
    referrerContact: admissionFormValue(formData, 'referrerContact'),
    photoConsent: admissionFormBoolean(formData, 'photoConsent'),
    dataConsent: admissionFormBoolean(formData, 'dataConsent'),
    participationConsent: admissionFormBoolean(formData, 'participationConsent'),
    accuracyConsent: admissionFormBoolean(formData, 'accuracyConsent'),
  })
}
