'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import {
  upsertProduct,
  type SaveShopProductInput,
} from '@/lib/server/repositories/shop'
import { SHOP_PRODUCTS_CACHE_TAG } from '@/lib/shop/cache'

export async function saveProductDetails(product: SaveShopProductInput) {
  try {
    const savedProduct = await upsertProduct(product)

    // Product edits must refresh both admin views and the cached public shop catalog.
    revalidatePath('/admin/shop/products')
    revalidatePath('/admin/shop')
    revalidatePath('/shop')
    revalidatePath(`/shop/${savedProduct.id}`)
    revalidateTag(SHOP_PRODUCTS_CACHE_TAG, 'max')

    return { success: true, product: savedProduct }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Database update failed.',
    }
  }
}
