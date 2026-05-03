import type { ReactNode } from 'react'

import JsonLdScript from '@/components/JsonLdScript'
import { buildBreadcrumbJsonLd, buildSeoMetadata } from '@/data/constants/seo'

export const metadata = buildSeoMetadata(
  '/summer-camp/enroll',
  'Enroll in SKF Karate summer camp for self-defense, nunchaku weapon training, fitness, discipline, and karate coaching for young students in Karnataka.'
)

export default function SummerCampEnrollLayout({ children }: { children: ReactNode }) {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd('Summer Camp Enrollment', '/summer-camp/enroll')

  return (
    <>
      <JsonLdScript data={breadcrumbJsonLd} />
      {children}
    </>
  )
}
