import type { ReactNode } from 'react'

import { buildNoIndexMetadata } from '@/data/constants/seo'

export const metadata = buildNoIndexMetadata(
  '/verify',
  'SKF Karate certificate verification for authentic karate grading, program, tournament, and association records.'
)

export default function VerifyLayout({ children }: { children: ReactNode }) {
  return children
}
