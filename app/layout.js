import './globals.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

const siteUrl = 'https://skfkarate.org'

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: 'SKF Karate',
  description: 'Join SKF Karate, the premier martial arts and self-defense academy. Best local karate classes, professional dojo training, black belt grading, and Summer Camp. Start your karate journey today.',
  keywords: [
    'SKF Karate', 'SKF', 'karate', 'martial arts', 'karate training',
    'Sports Karate-do', 'self defence', 'self defense', 'karate classes',
    'karate dojo', 'karate near me', 'karate academy', 'best karate academy',
    'kumite', 'kata', 'karate belt grading', 'black belt', 'karate for kids',
    'karate for beginners', 'summer camp karate', 'karate summer camp',
    'karate competition', 'martial arts training', 'fitness and self defence',
    'sports karate', 'WKF karate', 'karate association',
    'karate instructor', 'sensei', 'karate school',
  ],
  authors: [{ name: 'SKF Karate' }],
  creator: 'SKF Karate',
  publisher: 'Sports Karate-do Fitness & Self Defence Association®',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: siteUrl,
    siteName: 'SKF Karate',
    title: 'SKF Karate | Sports Karate-do Fitness & Self Defence Association®',
    description: 'Premier karate training academy. 500+ students, 20+ certified Senseis, 6 dojos. Summer Camp 2026 now open. Join the SKF family!',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SKF Karate — Sports Karate-do Fitness & Self Defence Association®',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SKF Karate | Sports Karate-do Fitness & Self Defence Association®',
    description: 'Premier karate training academy. 500+ students, 20+ certified Senseis. Summer Camp 2026 now open!',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    // Add your Google Search Console verification code here
    // google: 'your-verification-code',
  },
  category: 'sports',
  icons: {
    icon: '/logo/SKF logo.png',
    apple: '/logo/SKF logo.png',
  },
}

// JSON-LD Structured Data
function JsonLd() {
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    name: 'SKF Karate',
    alternateName: 'Sports Karate-do Fitness & Self Defence Association®',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description: 'Premier Sports Karate-Do association offering professional karate training, belt grading, competitive programs, and Summer Camp for all ages.',
    sport: 'Karate',
    foundingDate: '2010',
    numberOfEmployees: {
      '@type': 'QuantitativeValue',
      value: 20,
      unitText: 'certified instructors',
    },
    slogan: 'Nothing is Impossible',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'City Center',
      addressCountry: 'IN',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-000-000-0000',
      contactType: 'customer service',
      email: 'info@skfkarate.org',
    },
    sameAs: [
      'https://www.facebook.com/skfkarate',
      'https://www.instagram.com/skfkarate',
      'https://www.youtube.com/skfkarate',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Karate Training Programs',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Summer Camp 2026',
            description: 'Intensive month-long karate training camp for beginners to advanced karatekas.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Regular Karate Classes',
            description: 'Ongoing karate training for all age groups under certified Senseis.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Belt Grading Examinations',
            description: 'Kyu and Dan grading examinations following WKF standards.',
          },
        },
      ],
    },
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SKF Karate',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  )
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <JsonLd />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
