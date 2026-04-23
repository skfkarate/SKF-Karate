'use server'

import { revalidatePath } from 'next/cache'
import {
  upsertProduct,
  type SaveShopProductInput,
} from '@/lib/server/repositories/shop'

export async function saveProductDetails(product: SaveShopProductInput) {
  try {
    const savedProduct = await upsertProduct(product)

    revalidatePath('/admin/shop/products')
    revalidatePath('/admin/shop')
    revalidatePath('/shop')
    revalidatePath(`/shop/${savedProduct.id}`)

    return { success: true, product: savedProduct }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Database update failed.',
    }
  }
}
