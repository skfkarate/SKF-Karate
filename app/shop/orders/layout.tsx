import type { ReactNode } from 'react'

import { buildNoIndexMetadata } from '@/data/constants/seo'

export const metadata = buildNoIndexMetadata(
  '/shop/orders',
  'SKF Karate order history for karate uniforms, belts, protective gear, and martial arts equipment.'
)

export default function ShopOrdersLayout({ children }: { children: ReactNode }) {
  return children
}
