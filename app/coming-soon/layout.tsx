import type { ReactNode } from 'react'

import { buildNoIndexMetadata } from '@/data/constants/seo'

export const metadata = buildNoIndexMetadata(
  '/coming-soon',
  'SKF Karate coming soon page for upcoming karate classes, training features, events, shop updates, and association services.'
)

export default function ComingSoonLayout({ children }: { children: ReactNode }) {
  return children
}
