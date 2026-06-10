import { z } from 'zod'

export const skfIdQuerySchema = z.object({
  skfId: z.string().trim().min(1).max(80),
})

export const athleteSearchQuerySchema = z.object({
  q: z.string().trim().max(120).optional().default(''),
  featured: z.enum(['0', '1']).optional().default('0'),
  limit: z.coerce.number().int().min(1).max(24).optional().default(6),
})

export type SkfIdQuery = z.infer<typeof skfIdQuerySchema>
export type AthleteSearchQuery = z.infer<typeof athleteSearchQuerySchema>
