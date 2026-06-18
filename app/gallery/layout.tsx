import JsonLdScript from '@/components/JsonLdScript'
import { buildBreadcrumbJsonLd, buildSeoMetadata } from '@/data/constants/seo'

export const metadata = buildSeoMetadata(
  '/gallery',
  'Browse SKF Karate gallery photos from dojo training, kata practice, kumite tournaments, belt exams, camps, demonstrations, and student events in India.'
)

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd('Gallery', '/gallery')

  return (
    <>
      <JsonLdScript data={breadcrumbJsonLd} />
      {children}
    </>
  )
}
