import { describe, expect, it } from 'vitest'

import {
  buildPreparedShopOrder,
  mergeCatalogProducts,
} from '@/lib/shop/logic'
import type { ShopProduct } from '@/lib/shop/types'

function createProduct(overrides: Partial<ShopProduct> = {}): ShopProduct {
  return {
    id: overrides.id || 'prd_test',
    name: overrides.name || 'Training Gloves',
    description: overrides.description || 'Protective kumite gloves.',
    category: overrides.category || 'gear',
    price: overrides.price ?? 1000,
    images: overrides.images || ['/gear.jpg'],
    variants: overrides.variants || [
      { id: 'prd_test_std', size: 'Standard', stock: 10, requiresApproval: false },
    ],
    rating: overrides.rating ?? 4.5,
    review_count: overrides.review_count ?? 12,
    requires_belt:
      overrides.requires_belt === undefined ? null : overrides.requires_belt,
    is_public: overrides.is_public ?? true,
    created_at: overrides.created_at || '2026-01-01T00:00:00.000Z',
    updated_at: overrides.updated_at || null,
  }
}

describe('shop logic', () => {
  it('merges seed-style catalog data with database overrides and additions', () => {
    const baseProducts = [
      createProduct({ id: 'prd_base', name: 'Base Gi', price: 2500 }),
      createProduct({ id: 'prd_keep', name: 'Keep Belt', category: 'belts' }),
    ]

    const overrideProducts = [
      createProduct({
        id: 'prd_base',
        name: 'Base Gi',
        price: 3100,
        is_public: false,
      }),
      createProduct({
        id: 'prd_new',
        name: 'New Duffel',
        category: 'merchandise',
        created_at: '2026-04-01T00:00:00.000Z',
      }),
    ]

    const merged = mergeCatalogProducts(baseProducts, overrideProducts)

    expect(merged.find((product) => product.id === 'prd_base')?.price).toBe(3100)
    expect(merged.find((product) => product.id === 'prd_base')?.is_public).toBe(false)
    expect(merged.some((product) => product.id === 'prd_keep')).toBe(true)
    expect(merged.some((product) => product.id === 'prd_new')).toBe(true)
  })

  it('blocks guest checkout for athlete-only products', () => {
    const product = createProduct({
      id: 'prd_locked',
      is_public: false,
      requires_belt: 'Blue',
    })

    expect(() =>
      buildPreparedShopOrder({
        catalog: [product],
        items: [{ productId: product.id, variantId: 'prd_test_std', quantity: 1 }],
        actor: { authenticated: false },
      })
    ).toThrow('requires an athlete login')
  })

  it('calculates promo and points discounts from the live catalog and flags approval orders', () => {
    const product = createProduct({
      id: 'prd_approval',
      price: 1000,
      variants: [
        { id: 'prd_approval_std', size: 'Standard', stock: 5, requiresApproval: true },
      ],
    })

    const prepared = buildPreparedShopOrder({
      catalog: [product],
      items: [{ productId: product.id, variantId: 'prd_approval_std', quantity: 2 }],
      actor: { authenticated: true, belt: 'Black' },
      availablePoints: 2000,
      requestedPoints: 2000,
      promoCode: 'SKF10',
    })

    expect(prepared.subtotal).toBe(2000)
    expect(prepared.promoDiscount).toBe(200)
    expect(prepared.pointsUsed).toBe(800)
    expect(prepared.pointsDiscount).toBe(200)
    expect(prepared.total).toBe(1600)
    expect(prepared.status).toBe('pending-approval')
  })

  it('rejects orders that exceed live stock', () => {
    const product = createProduct({
      id: 'prd_low_stock',
      variants: [{ id: 'prd_low_stock_std', size: 'Standard', stock: 1 }],
    })

    expect(() =>
      buildPreparedShopOrder({
        catalog: [product],
        items: [{ productId: product.id, variantId: 'prd_low_stock_std', quantity: 2 }],
        actor: { authenticated: true, belt: 'Brown' },
      })
    ).toThrow('Only 1 item(s) left')
  })
})
