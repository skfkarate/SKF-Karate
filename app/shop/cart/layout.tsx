import type { ReactNode } from 'react'

import { buildNoIndexMetadata } from '@/data/constants/seo'

export const metadata = buildNoIndexMetadata(
  '/shop/cart',
  'SKF Karate shopping cart for selected karate uniforms, belts, gear, and training equipment.'
)

export default function ShopCartLayout({ children }: { children: ReactNode }) {
  return children
}
