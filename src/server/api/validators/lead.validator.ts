import { z } from 'zod'

export const leadSchema = z.object({
  studentName: z.string().trim().min(2).max(100),
  parentPhone: z.string().trim().regex(/^\+91[0-9]{10}$/),
  childAge: z.coerce.number().int().min(4).max(60),
  branch: z.string().trim().min(1).max(160),
  preferredBatch: z.string().trim().min(2).max(120),
  hearAboutUs: z.string().trim().max(160).optional().or(z.literal('')),
})

export type LeadInput = z.infer<typeof leadSchema>
