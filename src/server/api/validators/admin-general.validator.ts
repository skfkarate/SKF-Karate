import { z } from 'zod'

export const looseObjectSchema = z.object({}).passthrough()

export const adminSearchQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
})

export const idQuerySchema = z.object({
  id: z.string().trim().min(1).max(160),
})

export const videoIdQuerySchema = z.object({
  videoId: z.string().trim().min(1).max(160),
})

export const skfIdQuerySchema = z.object({
  skfId: z.string().trim().min(1).max(80),
})

export const athleteSearchQuerySchema = z.object({
  q: z.string().trim().max(120).optional().default(''),
  featured: z.enum(['0', '1']).optional().default('0'),
  limit: z.coerce.number().int().min(1).max(24).optional().default(6),
})

export const adminCategoryBodySchema = z.object({
  category: z.string().trim().min(1).max(120),
})

export const adminMutableContentBodySchema = z.object({
  entity: z.string().trim().min(1).max(80),
  operation: z.string().trim().min(1).max(80),
  payload: looseObjectSchema.optional().default({}),
  id: z.string().trim().max(120).optional(),
  slug: z.string().trim().max(160).optional(),
  citySlug: z.string().trim().max(160).optional(),
  branchSlug: z.string().trim().max(160).optional(),
})

export const adminSenseiMutationBodySchema = z.object({
  operation: z.enum(['create', 'update', 'delete']),
  payload: looseObjectSchema.optional().default({}),
  id: z.string().trim().max(120).optional(),
})

export const adminDeleteConfirmBodySchema = z.object({
  confirm: z.literal(true),
})

export type AdminSearchQuery = z.infer<typeof adminSearchQuerySchema>
export type IdQuery = z.infer<typeof idQuerySchema>
export type VideoIdQuery = z.infer<typeof videoIdQuerySchema>
export type SkfIdQuery = z.infer<typeof skfIdQuerySchema>
export type AthleteSearchQuery = z.infer<typeof athleteSearchQuerySchema>
export type AdminCategoryBody = z.infer<typeof adminCategoryBodySchema>
export type AdminMutableContentBody = z.infer<typeof adminMutableContentBodySchema>
export type AdminSenseiMutationBody = z.infer<typeof adminSenseiMutationBodySchema>
export type AdminDeleteConfirmBody = z.infer<typeof adminDeleteConfirmBodySchema>
