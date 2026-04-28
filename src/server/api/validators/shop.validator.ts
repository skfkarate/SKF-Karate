import { z } from 'zod'

export const shopCheckoutSchema = z.object({
  amount: z.coerce.number().positive().max(1_000_000),
})

export type ShopCheckoutInput = z.infer<typeof shopCheckoutSchema>
