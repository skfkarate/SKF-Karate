'use server'

import { updateShopOrderStatus } from '@/lib/server/repositories/shop'
import { revalidatePath } from 'next/cache'

export async function mutateOrderStatus(orderId: string, status: string) {
  const order = await updateShopOrderStatus(orderId, status)

  if (order) {
    revalidatePath('/admin/shop')
    revalidatePath('/shop/orders')
  }

  return {
    success: Boolean(order),
    order,
  }
}
