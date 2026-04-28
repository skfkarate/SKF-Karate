import { z } from 'zod'

const yearSchema = z.coerce.number().int().min(2020).max(2100)
const skfIdSchema = z.string().trim().min(1).max(64)
const monthSchema = z.string().trim().min(3).max(20)

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
  status: z.enum(['all', 'paid', 'due', 'overdue']).optional(),
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
