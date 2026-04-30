import { z } from 'zod'

export const programTypeSchema = z.enum(['camp', 'belt_exam', 'training', 'tournament'])

export const adminProgramCreateSchema = z.object({
  name: z.string().trim().min(2).max(160),
  type: programTypeSchema.default('training'),
  branch: z.string().trim().max(160).optional(),
  hasBeltSubtypes: z.boolean().optional(),
})

export type AdminProgramCreateInput = z.infer<typeof adminProgramCreateSchema>
