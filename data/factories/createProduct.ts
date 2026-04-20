/**
 * Factory: createProduct
 */
import { generateId, isoNow } from './helpers'
import type { Product, ProductVariant } from '../seed/products'

type ProductInput = Partial<Product> & Pick<Product, 'name' | 'price' | 'category'>

export function createProduct(input: ProductInput): Product {
  return {
    id: input.id || generateId('prd'),
    name: input.name,
    description: input.description || `${input.name} — official SKF merchandise.`,
    category: input.category,
    price: input.price,
    images: input.images || [],
    variants: input.variants || [
      { id: `${generateId('var')}`, size: 'Standard', stock: 10 },
    ],
    rating: input.rating ?? 4.0,
    reviewCount: input.reviewCount ?? 0,
    createdAt: input.createdAt || isoNow(),
  }
}

export function createProductVariant(input: Partial<ProductVariant> & { size: string }): ProductVariant {
  return {
    id: input.id || generateId('var'),
    size: input.size,
    stock: input.stock ?? 10,
  }
}
