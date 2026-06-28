import JsonLdScript from '@/components/JsonLdScript'
import { buildBreadcrumbJsonLd, buildSeoMetadata } from '@/data/constants/seo'

export const metadata = buildSeoMetadata(
  '/gallery',
  "Browse SKF Karate gallery — dojo training, kata practice, kumite tournaments, belt exams, camps, and student events across Karnataka and India. India's #1 karate association.",
  { title: "SKF Karate Gallery | Training Photos | Tournaments & Events | Karnataka" }
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
