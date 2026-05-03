import type { ReactNode } from 'react'

import { buildNoIndexMetadata } from '@/data/constants/seo'

export const metadata = buildNoIndexMetadata(
  '/shop/checkout',
  'SKF Karate checkout for uniforms, belts, protective gear, and martial arts training equipment orders.'
)

export default function ShopCheckoutLayout({ children }: { children: ReactNode }) {
  return children
}
