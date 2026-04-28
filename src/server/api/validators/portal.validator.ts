import { z } from 'zod'

export const portalAuthSchema = z.object({
  skfId: z.string().trim().min(1).max(40),
  dob: z.string().trim().min(8).max(20),
})

export const videoProgressSchema = z.object({
  videoId: z.string().trim().min(1).max(120),
  progressPercent: z.coerce.number().min(0).max(100),
})

export type PortalAuthInput = z.infer<typeof portalAuthSchema>
export type VideoProgressInput = z.infer<typeof videoProgressSchema>
