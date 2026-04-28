import { z } from 'zod'

const legacyTemplateFieldSchema = z.record(
  z.string(),
  z.object({
    label: z.string().trim().max(120),
    x: z.coerce.number().min(0).max(5000),
    y: z.coerce.number().min(0).max(5000),
    fontSize: z.coerce.number().min(8).max(300),
    color: z.string().trim().max(32),
    align: z.enum(['left', 'center', 'right']).default('left'),
    fontFamily: z.string().trim().max(160).optional(),
  })
)

export const legacyProgramTemplateSchema = z.object({
  background_url: z.string().trim().url(),
  text_configs: legacyTemplateFieldSchema,
  width_px: z.coerce.number().int().min(200).max(6000).default(2000),
  height_px: z.coerce.number().int().min(200).max(6000).default(1414),
})

export type LegacyProgramTemplateInput = z.infer<typeof legacyProgramTemplateSchema>
