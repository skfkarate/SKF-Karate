import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import './profile.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CookieConsent from './components/CookieConsent'
import SessionProvider from '@/components/SessionProvider'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-body',
})

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-heading',
})

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
    description: 'Premier karate training academy with belt grading, tournament pathways, and structured training for all ages.',
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
    description: 'Premier karate training academy with structured classes, belt grading, and competition pathways.',
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
    logo: `${siteUrl}/logo/SKF%20logo.png`,
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
      addressLocality: 'Bangalore',
      addressRegion: 'Karnataka',
      addressCountry: 'IN',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-90199-71726',
      contactType: 'customer service',
      email: 'contact@skfkarate.org',
    },
    sameAs: [
      'https://www.facebook.com/share/1DG1UZ3vKp/?mibextid=wwXIfr',
      'https://www.instagram.com/skf_karate',
      'https://www.youtube.com/@skfkarate',
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
      target: `${siteUrl}/student?q={search_term_string}`,
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
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        <SessionProvider>
          <a href="#main-content" className="skip-to-content">
            Skip to content
          </a>
          <JsonLd />
          <Navbar />
          <main id="main-content">{children}</main>
          <Footer />
          <CookieConsent />
        </SessionProvider>
      </body>
    </html>
  )
}
