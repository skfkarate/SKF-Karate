import type { ShopProduct } from './types'

// Pin the Nunchaku storefront to the uploaded public assets regardless of stale catalog image URLs.
export const SHOP_IMAGE_FALLBACK = '/og-default.jpg'

export const NUNCHAKU_PRODUCT_IMAGES = [
  '/Shop/Weapons/Nunchaku/nunchaku1.png',
  '/Shop/Weapons/Nunchaku/nunchaku2.png',
] as const

const PRODUCT_IMAGE_OVERRIDES: Record<string, readonly string[]> = {
  'nunchaku-weapon': NUNCHAKU_PRODUCT_IMAGES,
}

export function normalizeShopImageUrl(image: unknown): string {
  const rawImage = String(image || '').trim()
  if (!rawImage) return ''

  if (/^https?:\/\//i.test(rawImage)) {
    return rawImage
  }

  if (rawImage.startsWith('//')) {
    return `https:${rawImage}`
  }

  const publicPath = rawImage.replace(/^\/?public\//i, '')
  return publicPath.startsWith('/') ? publicPath : `/${publicPath}`
}

export function getShopProductImages(product: Pick<ShopProduct, 'id' | 'images'>): string[] {
  const overrideImages = PRODUCT_IMAGE_OVERRIDES[product.id]
  if (overrideImages) {
    return overrideImages.map(normalizeShopImageUrl).filter(Boolean)
  }

  return product.images.map(normalizeShopImageUrl).filter(Boolean)
}

export function getShopProductPrimaryImage(
  product: Pick<ShopProduct, 'id' | 'images'>
): string {
  return getShopProductImages(product)[0] || SHOP_IMAGE_FALLBACK
}
