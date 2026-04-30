import { z } from 'zod'

import { POINT_RULES } from '@/lib/points/pointsService'

const pointReasonValues = Object.keys(POINT_RULES) as [keyof typeof POINT_RULES, ...(keyof typeof POINT_RULES)[]]

export const awardPointsBodySchema = z.object({
  skfId: z.string().trim().min(1).max(80),
  reason: z.enum(pointReasonValues),
  note: z.string().trim().max(500).optional(),
})

export const redeemPointsBodySchema = z.object({
  points: z.coerce.number().int().positive().max(100000),
  orderId: z.string().trim().max(120).optional(),
  reason: z.string().trim().min(1).max(80),
})

export const pointHistoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type AwardPointsBody = z.infer<typeof awardPointsBodySchema>
export type RedeemPointsBody = z.infer<typeof redeemPointsBodySchema>
export type PointHistoryQuery = z.infer<typeof pointHistoryQuerySchema>
