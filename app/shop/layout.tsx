import type { ReactNode } from 'react'

import JsonLdScript from '@/components/JsonLdScript'
import { buildBreadcrumbJsonLd, buildSeoMetadata } from '@/data/constants/seo'

export const metadata = buildSeoMetadata(
  '/shop',
  "Shop official SKF Karate uniforms, belts, protective gear, training equipment, and martial arts essentials. India's #1 karate association official store.",
  { title: "SKF Karate Shop | Official Karate Gear & Equipment | India" }
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
