import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import './profile.css'
import './_components/Footer.css'
import './_components/Navbar.css'
import './_components/TrialBookingModal.css'
import './_components/pages/home/HomeBookTrialCTA.css'
import './_components/pages/home/HomeContactPopup.css'
import './_components/pages/home/HomeSenseisTeaser.css'
import './_components/pages/home/HomeStatsCounter.css'
import ClientLayoutWrapper from '@/app/_components/ClientLayoutWrapper'
import SessionProvider from '@/app/_components/providers/SessionProvider'
import Navbar from '@/app/_components/Navbar'
import Footer from '@/app/_components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'
import BackToTop from '@/components/BackToTop'
import TrialBookingModal from '@/app/_components/TrialBookingModal'

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

import { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://skfkarate.org'),
  manifest: '/manifest.json',
  title: { default: 'SKF Karate — Bangalore', template: '%s | SKF Karate' },
  description: 'SKF Karate (Sportkarate Federation) — Premier karate classes in Koramangala, Whitefield, and JP Nagar, Bangalore. WKF-affiliated. All ages welcome.',
  keywords: ['SKF karate', 'karate Bangalore', 'karate classes Koramangala', 'karate Whitefield', 'WKF karate', 'sportkarate federation'],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://skfkarate.org',
    siteName: 'SKF Karate',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'SKF Karate Bangalore' }]
  },
  twitter: { card: 'summary_large_image', site: '@skfkarate' },
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION || '' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } }
}


import { Providers } from '@/app/providers'
import AnalyticsLoader from '@/components/AnalyticsLoader'
import CookieConsent from '@/components/CookieConsent'
export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        <Providers>
          <SessionProvider>
            <a href="#main-content" className="skip-to-content">
              Skip to content
            </a>
            <ClientLayoutWrapper 
              navbar={<Navbar />} 
              footer={<Footer />}
              whatsappButton={<WhatsAppButton />}
              backToTop={<BackToTop />}
            >
              {children}
            </ClientLayoutWrapper>
            <TrialBookingModal />
            <CookieConsent />
          </SessionProvider>
        </Providers>
        <AnalyticsLoader />
      </body>
    </html>
  )
}
