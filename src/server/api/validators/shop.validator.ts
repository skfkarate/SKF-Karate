import { z } from 'zod'

const shopCartItemSchema = z.object({
  productId: z.string().trim().min(1).max(120),
  variantId: z.string().trim().min(1).max(120),
  quantity: z.coerce.number().int().min(1).max(100),
})

export const shopCheckoutCreateOrderSchema = z.object({
  items: z.array(shopCartItemSchema).min(1).max(100),
  pointsUsed: z.coerce.number().int().min(0).max(100000).optional().default(0),
  promoCode: z.string().trim().max(80).optional(),
}).strict()

export const shopOrderAddressSchema = z.object({
  fullName: z.string().trim().min(2).max(160),
  phone: z.string().trim().regex(/^\+91[0-9]{10}$/),
  addressLine1: z.string().trim().min(5).max(240),
  addressLine2: z.string().trim().max(240).optional(),
  city: z.string().trim().min(2).max(120),
  state: z.string().trim().min(2).max(120),
  pincode: z.string().trim().regex(/^[0-9]{6}$/),
})

export const shopOrderBodySchema = z.object({
  razorpay_order_id: z.string().trim().min(1).max(120),
  razorpay_payment_id: z.string().trim().min(1).max(120),
  razorpay_signature: z.string().trim().min(32).max(256),
  items: z.array(shopCartItemSchema).min(1).max(100),
  pointsUsed: z.coerce.number().int().min(0).max(100000).optional().default(0),
  promoCode: z.string().trim().max(80).optional(),
  address: shopOrderAddressSchema.optional(),
}).strict()

export const razorpayWebhookSchema = z.object({
  event: z.string().trim().min(1).max(120),
  payload: z.object({
    payment: z.object({
      entity: z.object({
        id: z.string().trim().min(1).max(160),
        notes: z.object({
          skfId: z.string().trim().min(1).max(80),
          month: z.string().trim().min(1).max(40),
          year: z.string().trim().min(1).max(10),
        }),
      }),
    }),
  }).optional(),
}).passthrough()

export type ShopCheckoutCreateOrderInput = z.infer<typeof shopCheckoutCreateOrderSchema>
export type ShopCheckoutInput = ShopCheckoutCreateOrderInput
export type ShopOrderBody = z.infer<typeof shopOrderBodySchema>
export type RazorpayWebhookEvent = z.infer<typeof razorpayWebhookSchema>
