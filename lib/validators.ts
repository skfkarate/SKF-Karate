import { z } from 'zod'

const optionalEmail = z
  .string()
  .trim()
  .max(160)
  .refine((value) => !value || z.email().safeParse(value).success, 'Enter a valid email address')

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .refine((value) => !value || z.url().safeParse(value).success, 'Enter a valid URL')

const optionalPhone = z
  .string()
  .trim()
  .max(20)
  .refine((value) => !value || /^(?:\+91)?[0-9]{10}$/.test(value), 'Use 10 digits, with optional +91')

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
  branch: z.string().min(1).max(120),
  batch: z.string().min(1).max(50),
  belt: z.enum(['white', 'yellow', 'orange', 'green', 'blue', 'brown', 'black']),
  gender: z.enum(['male', 'female', 'other']).default('male'),
  parentName: z.string().trim().max(100).default(''),
  phone: optionalPhone.default(''),
  email: optionalEmail.default(''),
  photoUrl: optionalUrl.default(''),
  monthlyFee: z.coerce.number().min(0).max(10000),
  photoConsent: z.boolean().default(false),
  isPublic: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  status: z.enum(['Active', 'Inactive']).default('Active'),
  enrolledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
})

export const editStudentSchema = createStudentSchema.partial()
