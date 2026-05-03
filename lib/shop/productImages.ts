import type { ShopProduct } from './types'

// Pin the Nunchaku storefront to the uploaded public assets regardless of stale catalog image URLs.
export const NUNCHAKU_PRODUCT_IMAGES = [
  '/Shop/Weapons/Nunchaku/nunchaku1.png',
  '/Shop/Weapons/Nunchaku/nunchaku2.png',
] as const

const PRODUCT_IMAGE_OVERRIDES: Record<string, readonly string[]> = {
  'nunchaku-weapon': NUNCHAKU_PRODUCT_IMAGES,
}

export function getShopProductImages(product: Pick<ShopProduct, 'id' | 'images'>): string[] {
  const overrideImages = PRODUCT_IMAGE_OVERRIDES[product.id]
  if (overrideImages) {
    return [...overrideImages]
  }

  return product.images
}
