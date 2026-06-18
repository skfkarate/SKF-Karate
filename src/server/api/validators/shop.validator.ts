import { z } from 'zod'

import {
  isValidIndianMobileNumber,
  normalizeIndianMobileNumber,
  SHOP_PHONE_ERROR_MESSAGE,
} from '@/lib/shop/phone'

const shopCartItemSchema = z.object({
  productId: z.string().trim().min(1).max(120),
  variantId: z.string().trim().min(1).max(120),
  quantity: z.coerce.number().int().min(1).max(100),
})

export const shopOrderAddressSchema = z.object({
  fullName: z.string().trim().min(2).max(160),
  parentName: z.string().trim().min(1).max(160).nullish(),
  studentName: z.string().trim().min(1).max(160).nullish(),
  age: z.coerce.string().trim().max(10).nullish(),
  phone: z
    .string()
    .max(64, SHOP_PHONE_ERROR_MESSAGE)
    .refine(isValidIndianMobileNumber, SHOP_PHONE_ERROR_MESSAGE)
    .transform((value) => normalizeIndianMobileNumber(value) ?? value),
  addressLine1: z.string().trim().min(5).max(240),
  addressLine2: z.string().trim().max(240).nullish(),
  city: z.string().trim().min(2).max(120),
  state: z.string().trim().min(2).max(120),
  pincode: z.string().trim().regex(/^[0-9]{6}$/),
})

export const shopOrderBodySchema = z.object({
  paymentProofBase64: z.string().trim().min(1),
  paymentProofName: z.string().trim().max(255).nullish(),
  items: z.array(shopCartItemSchema).min(1).max(100),
  pointsUsed: z.coerce.number().int().min(0).max(100000).optional().default(0),
  promoCode: z.string().trim().max(80).nullish(),
  address: shopOrderAddressSchema.optional(),
}).strict()

export type ShopOrderBody = z.infer<typeof shopOrderBodySchema>
