import { z } from 'zod'

const baseText = z.string().trim().max(1000)

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().optional().or(z.literal('')),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ()-]{10,20}$/),
  preferredTime: z.string().trim().max(80).optional().or(z.literal('')),
  interest: z.string().trim().max(80).optional().or(z.literal('')),
  message: baseText.optional().or(z.literal('')),
  website: z.string().trim().max(120).optional().or(z.literal('')),
})

export type ContactInput = z.infer<typeof contactSchema>
