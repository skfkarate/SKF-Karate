import { z } from 'zod'

const optionalText = (max = 500) =>
  z.preprocess(
    (value) => {
      if (value === null) return undefined
      if (typeof value === 'string' && value.trim() === '') return undefined
      return value
    },
    z.string().trim().max(max).optional()
  )

const phoneSchema = z
  .string()
  .trim()
  .min(10)
  .max(20)
  .refine((value) => {
    const digits = value.replace(/\D/g, '')
    return digits.length === 10 || (digits.length === 12 && digits.startsWith('91'))
  }, 'Use a valid 10 digit Indian mobile number.')

const optionalPhoneSchema = z.preprocess(
  (value) => {
    if (value === null) return undefined
    if (typeof value === 'string' && value.trim() === '') return undefined
    return value
  },
  phoneSchema.optional()
)

const optionalEmail = z.preprocess(
  (value) => {
    if (value === null) return undefined
    if (typeof value === 'string' && value.trim() === '') return undefined
    return value
  },
  z.email().max(180).optional()
)

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD.')

const optionalDate = z.preprocess(
  (value) => {
    if (value === null) return undefined
    if (typeof value === 'string' && value.trim() === '') return undefined
    return value
  },
  dateSchema.optional()
)

export const publicAdmissionSchema = z.object({
  branchSlug: z.string().trim().min(1).max(120),
  preferredBatch: optionalText(120),
  expectedJoinDate: optionalDate,

  studentName: z.string().trim().min(2).max(120),
  studentDob: dateSchema,
  studentGender: z.enum(['male', 'female', 'other']).default('male'),
  schoolClass: z.string().trim().min(2, 'School name is required').max(120),

  guardianName: z.string().trim().min(2).max(120),
  guardianRelationship: z.string().trim().min(2).max(80),
  guardianPhone: phoneSchema,
  guardianWhatsapp: phoneSchema,
  guardianEmail: optionalEmail,
  secondaryGuardianName: optionalText(120),
  secondaryGuardianRelationship: optionalText(80),
  secondaryGuardianPhone: optionalPhoneSchema,

  emergencyName: z.string().trim().min(2).max(120),
  emergencyRelationship: z.string().trim().min(2).max(80),
  emergencyPhone: phoneSchema,

  hasMedicalCondition: z.boolean().default(false),
  medicalDetails: optionalText(1000),
  medications: optionalText(1000),
  specialRequirements: optionalText(1000),

  hasPreviousTraining: z.boolean().default(false),
  martialArtsStyle: optionalText(120),
  trainingDuration: optionalText(120),
  previousDojo: optionalText(160),
  currentBelt: optionalText(80),
  trainingNotes: optionalText(1000),

  promoCode: optionalText(80),
  referralSource: optionalText(160),
  referrerName: optionalText(120),
  referrerContact: optionalText(120),

  photoConsent: z.boolean().default(false),
  dataConsent: z.boolean().refine(Boolean, 'Data storage consent is required.'),
  participationConsent: z.boolean().refine(Boolean, 'Participation consent is required.'),
  accuracyConsent: z.boolean().refine(Boolean, 'Information accuracy confirmation is required.'),
})

export const admissionListQuerySchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'all']).default('pending'),
  branchSlug: optionalText(120),
  search: optionalText(160),
  limit: z.coerce.number().int().min(1).max(200).default(100),
})

export const admissionRejectSchema = z.object({
  applicationId: z.string().uuid(),
  reason: z.string().trim().min(2).max(500),
})

export const admissionApprovalFieldsSchema = z.object({
  applicationId: z.string().uuid(),
  monthlyFee: z.coerce.number().min(0).max(1000000),
  admissionFee: z.coerce.number().min(0).max(1000000),
  dressFee: z.coerce.number().min(0).max(1000000),
  dressCost: z.coerce.number().min(0).max(1000000),
  billingStartDate: dateSchema,
  batch: optionalText(120),
  belt: z.enum(['white', 'yellow', 'orange', 'green', 'blue', 'brown', 'black']).default('white'),
  isPublic: z.boolean().default(true),
  paymentVerified: z.boolean().refine(Boolean, 'Payment verification is required before approval.'),
  photoAction: z.enum(['upload_new']).default('upload_new'),
  reviewNote: optionalText(500),
})

export const admissionPromoCodeSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().trim().min(2).max(80),
  name: optionalText(120),
  branchSlug: optionalText(120).nullable().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  discountType: z.enum(['percent', 'fixed', 'fee_override', 'admission_waiver']),
  discountValue: z.coerce.number().min(0).max(1000000),
  appliesTo: z.enum(['monthly', 'admission', 'dress', 'joining_total']).default('monthly'),
  validFrom: dateSchema.optional().or(z.literal('')).nullable().optional(),
  validUntil: dateSchema.optional().or(z.literal('')).nullable().optional(),
  maxUses: z.coerce.number().int().min(1).max(1000000).nullable().optional(),
  maxUsesPerPhone: z.coerce.number().int().min(1).max(1000000).nullable().optional(),
  notes: optionalText(500),
})

export const admissionBranchSettingsSchema = z.object({
  branchSlug: z.string().trim().min(1).max(120),
  branchName: z.string().trim().min(1).max(160),
  isEnabled: z.boolean().default(true),
  showPublicCta: z.boolean().default(false),
  defaultMonthlyFee: z.coerce.number().min(0).max(1000000),
  defaultAdmissionFee: z.coerce.number().min(0).max(1000000),
  defaultDressFee: z.coerce.number().min(0).max(1000000),
  defaultDressCost: z.coerce.number().min(0).max(1000000),
  batchOptions: z.array(z.string().trim().min(1).max(120)).max(20).default([]),
  notes: optionalText(500),
})

export type PublicAdmissionInput = z.infer<typeof publicAdmissionSchema>
export type AdmissionListQueryInput = z.infer<typeof admissionListQuerySchema>
export type AdmissionRejectInput = z.infer<typeof admissionRejectSchema>
export type AdmissionApprovalFieldsInput = z.infer<typeof admissionApprovalFieldsSchema>
export type AdmissionPromoCodeInput = z.infer<typeof admissionPromoCodeSchema>
export type AdmissionBranchSettingsInput = z.infer<typeof admissionBranchSettingsSchema>
