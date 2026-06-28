import type { ReactNode } from 'react'

import JsonLdScript from '@/components/JsonLdScript'
import { buildBreadcrumbJsonLd, buildSeoMetadata } from '@/data/constants/seo'

export const metadata = buildSeoMetadata(
  '/book-trial',
  "Book a free SKF Karate trial class in Bangalore (Herohalli, MPSC) or Kunigal. India's #1 karate association — karate for kids, adults, self-defense, kata, kumite, and fitness coaching.",
  { title: "Book Free Trial | SKF Karate | Best Karate Classes in Bangalore & Karnataka" }
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
