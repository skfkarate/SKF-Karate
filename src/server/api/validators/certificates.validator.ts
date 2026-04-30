import { z } from 'zod'

export const certificateDataQuerySchema = z.object({
  skfId: z.string().trim().min(1).max(80).optional(),
})

export const publicCertificatesQuerySchema = z.object({
  skfId: z.string().trim().min(1).max(80),
})

export const certificateSearchQuerySchema = z.object({
  id: z.string().trim().regex(/^[a-zA-Z0-9_-]{6,120}$/),
})

export type CertificateDataQuery = z.infer<typeof certificateDataQuerySchema>
export type PublicCertificatesQuery = z.infer<typeof publicCertificatesQuerySchema>
export type CertificateSearchQuery = z.infer<typeof certificateSearchQuerySchema>
