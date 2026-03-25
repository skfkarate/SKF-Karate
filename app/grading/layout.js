export const metadata = {
  title: 'Karate Belt Grading System & Syllabus | SKF Karate',
  description: 'Understand the traditional karate belt system from white to black belt. Prepare for your next grading examination with SKF Karate.',
}

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

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
    />
  )
}

export default function GradingLayout({ children }) {
  return (
    <>
      <JsonLd />
      {children}
    </>
  )
}
