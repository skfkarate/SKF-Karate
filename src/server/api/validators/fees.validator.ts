import { z } from 'zod'

const yearSchema = z.coerce.number().int().min(2020).max(2100)
const skfIdSchema = z.string().trim().min(1).max(64)
const monthSchema = z.string().trim().min(3).max(20)
const feeTypeSchema = z.enum([
  'monthly',
  'admission',
  'dress',
  'credit_adjustment',
  'belt_exam',
  'tournament',
  'event',
  'other',
]).default('monthly')
const booleanQuerySchema = z.preprocess((value) => {
  if (value === 'true' || value === '1') return true
  if (value === 'false' || value === '0') return false
  return value
}, z.boolean())
const feeStatusSchema = z.enum([
  'all',
  'paid',
  'due',
  'overdue',
  'pending_verification',
  'break',
  'waived',
  'rejected',
  'available',
  'used',
  'cancelled',
])

export const portalFeesQuerySchema = z.object({
  year: yearSchema.optional(),
})

export const portalFeePaymentSchema = z.object({
  month: monthSchema.optional(),
  year: yearSchema.optional(),
})

export const adminTrainingFeeQuerySchema = z.object({
  year: yearSchema.optional(),
  month: monthSchema.optional(),
  status: z.enum(['all', 'paid', 'due', 'overdue', 'pending_verification', 'break', 'waived', 'rejected']).optional(),
  branch: z.string().trim().max(160).optional(),
  search: z.string().trim().max(160).optional(),
})

const adminMarkPaidActionSchema = z.object({
  action: z.literal('mark_paid'),
  skfId: skfIdSchema,
  month: monthSchema,
  year: yearSchema,
  paymentMethod: z.string().trim().max(80).optional(),
  paymentReference: z.string().trim().max(120).optional(),
  receiptId: z.string().trim().max(120).optional(),
})

const adminMarkDueActionSchema = z.object({
  action: z.literal('mark_due'),
  skfId: skfIdSchema,
  month: monthSchema,
  year: yearSchema,
})

const adminSyncStudentActionSchema = z.object({
  action: z.literal('sync_student'),
  skfId: skfIdSchema,
  year: yearSchema.optional(),
})

const adminSyncAllActionSchema = z.object({
  action: z.literal('sync_all'),
  year: yearSchema.optional(),
})

export const adminTrainingFeeActionSchema = z.discriminatedUnion('action', [
  adminMarkPaidActionSchema,
  adminMarkDueActionSchema,
  adminSyncStudentActionSchema,
  adminSyncAllActionSchema,
])

export type PortalFeesQueryInput = z.infer<typeof portalFeesQuerySchema>
export type PortalFeePaymentInput = z.infer<typeof portalFeePaymentSchema>
export type AdminTrainingFeeQueryInput = z.infer<typeof adminTrainingFeeQuerySchema>
export type AdminTrainingFeeActionInput = z.infer<typeof adminTrainingFeeActionSchema>

export const feeConsoleQuerySchema = z.object({
  year: yearSchema.optional(),
  month: monthSchema.optional(),
  status: feeStatusSchema.optional(),
  feeType: z.enum(['all', 'monthly', 'admission', 'dress', 'credit_adjustment', 'belt_exam', 'tournament', 'event', 'other']).optional(),
  city: z.string().trim().max(120).optional(),
  branch: z.string().trim().max(160).optional(),
  search: z.string().trim().max(160).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  comparePrevious: booleanQuerySchema.optional(),
})

const feeConsolePaymentMethodSchema = z.enum(['cash', 'upi_qr', 'bank_transfer', 'adjustment', 'manual']).default('manual')

export const feeConsoleLedgerActionSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('mark_paid'),
    skfId: skfIdSchema,
    month: monthSchema,
    year: yearSchema,
    feeType: feeTypeSchema,
    feeRecordId: z.string().uuid().optional(),
    amount: z.coerce.number().min(0).max(1000000).optional(),
    paymentMethod: feeConsolePaymentMethodSchema,
    paymentReference: z.string().trim().max(160).optional(),
    notes: z.string().trim().max(500).optional(),
  }),
  z.object({
    action: z.literal('mark_due'),
    skfId: skfIdSchema,
    month: monthSchema,
    year: yearSchema,
    feeType: feeTypeSchema,
    feeRecordId: z.string().uuid().optional(),
    reason: z.string().trim().max(500).optional(),
  }),
  z.object({
    action: z.literal('mark_break'),
    skfId: skfIdSchema,
    month: monthSchema,
    year: yearSchema,
    feeType: feeTypeSchema,
    feeRecordId: z.string().uuid().optional(),
    reason: z.string().trim().min(1).max(500),
  }),
  z.object({
    action: z.literal('mark_waived'),
    skfId: skfIdSchema,
    month: monthSchema,
    year: yearSchema,
    feeType: feeTypeSchema,
    feeRecordId: z.string().uuid().optional(),
    reason: z.string().trim().min(1).max(500),
  }),
  z.object({
    action: z.literal('mark_discontinued'),
    skfId: skfIdSchema,
    month: monthSchema.optional(),
    year: yearSchema.optional(),
    reason: z.string().trim().max(500).optional(),
  }),
  z.object({
    action: z.literal('resume_billing'),
    skfId: skfIdSchema,
    month: monthSchema,
    year: yearSchema,
    monthlyFee: z.coerce.number().min(0).max(1000000).optional(),
    reason: z.string().trim().max(500).optional(),
  }),
  z.object({
    action: z.literal('sync_student'),
    skfId: skfIdSchema,
    year: yearSchema.optional(),
  }),
  z.object({
    action: z.literal('sync_all'),
    year: yearSchema.optional(),
  }),
  z.object({
    action: z.literal('apply_credit'),
    creditId: z.string().trim().min(1).max(120),
    skfId: skfIdSchema,
    month: monthSchema,
    year: yearSchema,
    feeType: feeTypeSchema.default('monthly'),
  }),
])

export const feeConsoleBulkActionSchema = z.object({
  actions: z.array(feeConsoleLedgerActionSchema).min(1).max(100),
})

export const feeDataQualityFixSchema = z.object({
  action: z.enum(['sync_missing_monthly_rows', 'generate_missing_receipts', 'reconcile_due_amounts']),
  year: yearSchema.optional(),
  month: monthSchema.optional(),
  city: z.string().trim().max(120).optional(),
  branch: z.string().trim().max(160).optional(),
})

export const feeFollowupCreateSchema = z.object({
  skfId: skfIdSchema,
  feeType: feeTypeSchema,
  month: monthSchema,
  year: yearSchema,
  contactMethod: z.enum(['whatsapp', 'call', 'in_person', 'sms', 'other']),
  note: z.string().trim().max(500).optional(),
})

const paymentProofBase64Schema = z.string()
  .trim()
  .regex(/^data:image\/(?:png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/)

export const portalFeeProofSchema = z.object({
  feeRecordIds: z.array(z.string().uuid()).max(12).optional(),
  month: monthSchema,
  year: yearSchema,
  feeType: feeTypeSchema,
  amount: z.coerce.number().min(1).max(1000000),
  paymentReference: z.string().trim().max(120).optional(),
  paymentProofBase64: paymentProofBase64Schema,
  paymentProofName: z.string().trim().max(255).optional(),
})

export const feeProofReviewSchema = z.object({
  note: z.string().trim().max(500).optional(),
})

export const feeCreditCreateSchema = z.object({
  skfId: skfIdSchema,
  amount: z.coerce.number().min(1).max(1000000),
  reason: z.string().trim().min(1).max(160),
  description: z.string().trim().max(500).optional(),
})

export const developmentFundExpenseSchema = z.object({
  month: monthSchema,
  year: yearSchema,
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(500).optional(),
  scope: z.string().trim().min(1).max(160).default('Both'),
  amount: z.coerce.number().min(1).max(1000000),
})

export const feeExtraIncomeSchema = z.object({
  month: monthSchema,
  year: yearSchema,
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(500).optional(),
  scope: z.string().trim().min(1).max(160).default('Both'),
  amount: z.coerce.number().min(1).max(1000000),
})

const eventFeeCategorySchema = z.enum(['belt_exam', 'tournament', 'event', 'other'])
const eventFeeTargetingModeSchema = z.enum(['branch_and_eligibility', 'participants_only', 'manual_selection'])
const eventFeePricingModeSchema = z.enum(['fixed', 'branch', 'belt', 'branch_belt', 'student'])

const branchPriceSchema = z.record(z.string().trim().min(1).max(160), z.coerce.number().min(0).max(1000000))

const studentOverrideSchema = z.object({
  skfId: skfIdSchema,
  amount: z.coerce.number().min(0).max(1000000).optional(),
  excluded: z.boolean().optional(),
  waived: z.boolean().optional(),
  reason: z.string().trim().max(300).optional(),
})

export const eventFeeConfigSchema = z.object({
  eventId: z.string().trim().min(1).max(120),
  feeCategory: eventFeeCategorySchema.default('event'),
  targetingMode: eventFeeTargetingModeSchema.default('branch_and_eligibility'),
  pricingMode: eventFeePricingModeSchema.default('fixed'),
  defaultAmount: z.coerce.number().min(0).max(1000000).default(0),
  dueDate: z.string().trim().max(40).optional(),
  branchScope: z.array(z.string().trim().min(1).max(160)).max(20).default([]),
  beltScope: z.array(z.string().trim().min(1).max(120)).max(40).default([]),
  branchPrices: branchPriceSchema.default({}),
  beltPrices: branchPriceSchema.default({}),
  branchBeltPrices: z.record(z.string().trim().min(1).max(220), z.coerce.number().min(0).max(1000000)).default({}),
  studentOverrides: z.array(studentOverrideSchema).max(500).default([]),
  notes: z.string().trim().max(1000).optional(),
})

export const eventFeePreviewSchema = z.object({
  eventId: z.string().trim().min(1).max(120),
  config: eventFeeConfigSchema.partial().optional(),
})

export const eventFeeGenerateSchema = z.object({
  eventId: z.string().trim().min(1).max(120),
  overrides: z.array(studentOverrideSchema).max(500).default([]),
})

export const eventFeeExpenseSchema = z.object({
  eventId: z.string().trim().min(1).max(120),
  title: z.string().trim().min(1).max(160),
  category: z.string().trim().max(80).default('event_expense'),
  amount: z.coerce.number().min(1).max(1000000),
  expenseDate: z.string().trim().max(40).optional(),
  branchScope: z.string().trim().min(1).max(160).default('Both'),
  allocationMethod: z.enum(['single_branch', 'student_branch', 'custom', 'overall']).default('student_branch'),
  allocations: z.record(z.string().trim().min(1).max(160), z.coerce.number().min(0).max(1000000)).default({}),
  paymentMethod: z.string().trim().max(80).optional(),
  vendor: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(500).optional(),
  proofUrl: z.string().trim().max(500).optional(),
})

export const eventFeeDepositSchema = z.object({
  eventId: z.string().trim().min(1).max(120),
  amount: z.coerce.number().min(1).max(1000000),
  depositDate: z.string().trim().max(40).optional(),
  branchScope: z.string().trim().min(1).max(160).default('Both'),
  method: z.string().trim().min(1).max(80).default('bank_deposit'),
  reference: z.string().trim().max(160).optional(),
  notes: z.string().trim().max(500).optional(),
})

const feeReminderTargetSchema = z.object({
  skfId: skfIdSchema,
  feeRecordId: z.string().uuid().optional(),
  feeType: feeTypeSchema,
  month: monthSchema,
  year: yearSchema,
  amount: z.coerce.number().min(0).max(1000000).optional(),
})

export const feeReminderSendSchema = z.object({
  channel: z.enum(['whatsapp', 'sms', 'email', 'in_app', 'manual']).default('whatsapp'),
  templateKey: z.string().trim().min(1).max(80).default('monthly_due'),
  targets: z.array(feeReminderTargetSchema).min(1).max(50),
  note: z.string().trim().max(500).optional(),
  markFollowup: z.boolean().default(true),
})

export type FeeConsoleQueryInput = z.infer<typeof feeConsoleQuerySchema>
export type FeeConsoleLedgerActionInput = z.infer<typeof feeConsoleLedgerActionSchema>
export type FeeConsoleBulkActionInput = z.infer<typeof feeConsoleBulkActionSchema>
export type FeeDataQualityFixInput = z.infer<typeof feeDataQualityFixSchema>
export type FeeFollowupCreateInput = z.infer<typeof feeFollowupCreateSchema>
export type PortalFeeProofInput = z.infer<typeof portalFeeProofSchema>
export type FeeCreditCreateInput = z.infer<typeof feeCreditCreateSchema>
export type DevelopmentFundExpenseInput = z.infer<typeof developmentFundExpenseSchema>
export type FeeExtraIncomeInput = z.infer<typeof feeExtraIncomeSchema>
export type EventFeeConfigInput = z.infer<typeof eventFeeConfigSchema>
export type EventFeePreviewInput = z.infer<typeof eventFeePreviewSchema>
export type EventFeeGenerateInput = z.infer<typeof eventFeeGenerateSchema>
export type EventFeeExpenseInput = z.infer<typeof eventFeeExpenseSchema>
export type EventFeeDepositInput = z.infer<typeof eventFeeDepositSchema>
export type FeeReminderSendInput = z.infer<typeof feeReminderSendSchema>
