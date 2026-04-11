'use server'

import { updateShopOrderStatus } from '@/lib/server/sheets'
import { revalidatePath } from 'next/cache'

export async function mutateOrderStatus(orderId: string, status: string) {
    const success = await updateShopOrderStatus(orderId, status)
    if (success) {
        revalidatePath('/admin/shop')
    }
    return success
}
