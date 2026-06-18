import JsonLdScript from '@/components/JsonLdScript'
import { buildBreadcrumbJsonLd, buildFaqJsonLd, buildSeoMetadata } from '@/data/constants/seo'

export const metadata = buildSeoMetadata(
  '/contact',
  'Contact SKF Karate for karate classes, trial bookings, kids martial arts, adult self-defense training, branch details, fees, and instructor guidance today.'
)

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd('Contact', '/contact')
  const faqJsonLd = buildFaqJsonLd([
    {
      question: 'What age can my child start training?',
      answer:
        'We accept students starting from age 5. Early training builds foundational motor skills, focus, and discipline.',
    },
    {
      question: 'Do I need any prior martial arts experience?',
      answer:
        'Not at all. Our beginner batches are designed specifically for zero-experience individuals of all ages.',
    },
    {
      question: 'What are the training fees?',
      answer:
        'Fees vary slightly by branch and program (group vs personal training). Please book a free trial and our Sensei will discuss the structure during your visit.',
    },
    {
      question: 'What gear do I need for the first class?',
      answer:
        'Just comfortable athletic wear (track pants and a t-shirt). Once enrolled, you will need to purchase the official SKF Karate Gi.',
    },
    {
      question: 'Are the certificates valid globally?',
      answer:
        'Yes. As a World Karate Federation (WKF) affiliated academy, our black belt grading and tournament certificates carry immense global recognition.',
    },
  ])

  return (
    <>
      <JsonLdScript data={breadcrumbJsonLd} />
      <JsonLdScript data={faqJsonLd} />
      {children}
    </>
  )
}
