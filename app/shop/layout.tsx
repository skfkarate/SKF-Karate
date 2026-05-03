import type { ReactNode } from 'react'

import JsonLdScript from '@/components/JsonLdScript'
import { buildBreadcrumbJsonLd, buildSeoMetadata } from '@/data/constants/seo'

export const metadata = buildSeoMetadata(
  '/shop',
  'Shop SKF Karate uniforms, belts, protective gear, training equipment, and martial arts essentials for kata, kumite, grading, and dojo practice in India.'
)

export default function ShopLayout({ children }: { children: ReactNode }) {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd('Shop', '/shop')

  return (
    <>
      <JsonLdScript data={breadcrumbJsonLd} />
      {children}
    </>
  )
}
