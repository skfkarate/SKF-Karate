import { z } from 'zod'
import { BRANCH_SLUGS } from '@/data/constants/branches'

export const setPinSchema = z.object({
  skfId: z.string().min(3).max(20),
  pin: z.string().regex(/^\d{4}$/, 'PIN must be exactly 4 digits'),
  dob: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'DOB must be DD/MM/YYYY'),
})

export const pinLoginSchema = z.object({
  skfId: z.string().min(3).max(20),
  pin: z.string().regex(/^\d{4}$/, 'PIN must be exactly 4 digits'),
})

export const createStudentSchema = z.object({
  name: z.string().min(2).max(100),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  branch: z.enum(BRANCH_SLUGS),
  batch: z.string().min(3).max(50),
  belt: z.enum(['white', 'yellow', 'orange', 'green', 'blue', 'brown', 'black']),
  parentName: z.string().min(2).max(100),
  phone: z.string().regex(/^\+91[0-9]{10}$/, 'Must be +91 followed by 10 digits'),
  monthlyFee: z.coerce.number().min(0).max(10000),
  photoConsent: z.boolean().default(false),
  enrolledDate: z.string()
})

export const editStudentSchema = createStudentSchema.omit({
  dob: true,
  enrolledDate: true
}).partial()
