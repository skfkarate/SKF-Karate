import type { ReactNode } from 'react'

import JsonLdScript from '@/components/JsonLdScript'
import { buildBreadcrumbJsonLd, buildSeoMetadata } from '@/data/constants/seo'

export const metadata = buildSeoMetadata(
  '/book-trial',
  'Book a free SKF Karate trial class for kids or adults in Karnataka and start karate training, self-defense, kata, kumite, and fitness coaching nearby.'
)

export default function BookTrialLayout({ children }: { children: ReactNode }) {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd('Book Trial', '/book-trial')

  return (
    <>
      <JsonLdScript data={breadcrumbJsonLd} />
      {children}
    </>
  )
}
