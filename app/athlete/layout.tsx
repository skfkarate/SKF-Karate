import type { ReactNode } from 'react'

import { buildNoIndexMetadata } from '@/data/constants/seo'

export const metadata = buildNoIndexMetadata(
  '/athlete/search',
  'SKF Karate athlete lookup for student profiles, belt records, branches, rankings, and verified karate training achievements.'
)

export default function AthleteLayout({ children }: { children: ReactNode }) {
  return children
}
