'use server'

import { revalidatePath } from 'next/cache'
import { upsertProduct, AdminProduct } from '@/lib/server/repositories/products'

export async function saveProductDetails(product: AdminProduct) {
    const success = await upsertProduct(product)
    
    if (success) {
        revalidatePath('/admin/shop/products')
        revalidatePath('/shop')
        return { success: true }
    }
    
    return { success: false, error: 'Database update failed.' }
}
