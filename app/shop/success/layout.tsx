import type { ReactNode } from 'react'

import { buildNoIndexMetadata } from '@/data/constants/seo'

export const metadata = buildNoIndexMetadata(
  '/shop/success',
  'SKF Karate shop order success page for submitted martial arts uniforms, belts, and equipment requests.'
)

export default function ShopSuccessLayout({ children }: { children: ReactNode }) {
  return children
}
