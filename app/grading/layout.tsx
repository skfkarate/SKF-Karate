import JsonLdScript from '@/components/JsonLdScript'
import { buildBreadcrumbJsonLd, buildSeoMetadata } from '@/data/constants/seo'

export const metadata = buildSeoMetadata(
  '/grading',
  'Explore the SKF Karate belt grading path from white belt to black belt with kyu, dan, kata, kumite, kihon, and traditional karate standards online today.'
)

function JsonLd() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What age can children start karate at SKF?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Children can begin karate training at SKF Karate from as young as 5 years old. Our kids\' program is designed for all ages with age-appropriate techniques.',
        },
      },
      {
        '@type': 'Question',
        name: 'How long does it take to get a black belt?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'At SKF Karate, the average time to reach black belt is 4–5 years of consistent training, following the WKF curriculum.',
        },
      },
    ],
  }

  return <JsonLdScript data={faqSchema} />
}

export default function GradingLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd('Grading', '/grading')

  return (
    <>
      <JsonLdScript data={breadcrumbJsonLd} />
      <JsonLd />
      {children}
    </>
  )
}
