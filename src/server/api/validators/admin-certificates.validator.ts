import { z } from 'zod'

import { programTypeSchema } from '@/src/server/api/validators/programs.validator'

export const certificateProgramCreateSchema = z.object({
  name: z.string().trim().min(2).max(160),
  type: programTypeSchema,
  branch: z.string().trim().max(160).optional(),
})

export const certificateTemplateQuerySchema = z.object({
  programId: z.string().trim().min(1).max(120).optional(),
})

export const certificateTemplateFieldSchema = z.object({
  id: z.string().trim().min(1).max(120),
  label: z.string().trim().min(1).max(120),
  value: z.string().max(500).optional().default(''),
  x: z.coerce.number().min(0).max(100),
  y: z.coerce.number().min(0).max(100),
  fontSize: z.coerce.number().min(1).max(200),
  fontFamily: z.string().trim().min(1).max(120),
  color: z.string().trim().regex(/^#[0-9a-fA-F]{3,8}$/),
  align: z.enum(['left', 'center', 'right']),
  bold: z.boolean().optional().default(false),
})

export const certificateTemplateSaveSchema = z.object({
  programId: z.string().trim().min(1).max(120),
  beltLevel: z.string().trim().max(120).nullable().optional(),
  templateImageUrl: z.string().trim().url().max(2048),
  fields: z.array(certificateTemplateFieldSchema).max(100),
  useQrCode: z.boolean().optional().default(true),
})

export const enrollmentBulkUpdateSchema = z.object({
  enrollmentIds: z.array(z.string().trim().min(1).max(120)).min(1).max(500),
  action: z.enum(['complete', 'unlock', 'revoke']),
})

export const enrollmentPatchSchema = z.object({
  belt_level: z.string().trim().max(120).optional(),
  completion_date: z.string().trim().max(40).optional(),
  issuer_name: z.string().trim().max(160).optional(),
}).refine((value) => Object.keys(value).length > 0, {
  message: 'No valid fields to update',
})

export const enrollmentCompleteSchema = z.object({
  completionDate: z.string().trim().max(40).optional(),
  issuerName: z.string().trim().max(160).optional(),
})

export const enrollmentCreateSchema = z.object({
  skfId: z.string().trim().min(1).max(80),
  programId: z.string().trim().min(1).max(120),
  beltLevel: z.string().trim().max(120).nullable().optional(),
  completionDate: z.string().trim().max(40).nullable().optional(),
  issuerName: z.string().trim().max(160).nullable().optional(),
})

export const enrollmentNotifySchema = z.object({
  enrollmentIds: z.array(z.string().trim().min(1).max(120)).min(1).max(500),
})

export const programTemplateSaveSchema = z.object({
  background_url: z.string().trim().url().max(2048),
  text_configs: z.record(z.string(), z.unknown()),
  width_px: z.coerce.number().int().min(100).max(10000).optional(),
  height_px: z.coerce.number().int().min(100).max(10000).optional(),
})

export type CertificateProgramCreateInput = z.infer<typeof certificateProgramCreateSchema>
export type CertificateTemplateQuery = z.infer<typeof certificateTemplateQuerySchema>
export type CertificateTemplateSaveInput = z.infer<typeof certificateTemplateSaveSchema>
export type EnrollmentBulkUpdateInput = z.infer<typeof enrollmentBulkUpdateSchema>
export type EnrollmentPatchInput = z.infer<typeof enrollmentPatchSchema>
export type EnrollmentCompleteInput = z.infer<typeof enrollmentCompleteSchema>
export type EnrollmentCreateInput = z.infer<typeof enrollmentCreateSchema>
export type EnrollmentNotifyInput = z.infer<typeof enrollmentNotifySchema>
export type ProgramTemplateSaveInput = z.infer<typeof programTemplateSaveSchema>
