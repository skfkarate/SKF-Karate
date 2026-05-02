import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import './profile.css'
import '@/components/skeletons/skeleton.css'
import './_components/Footer.css'
import './_components/Navbar.css'

import './_components/pages/home/HomeBookTrialCTA.css'
import { headers } from 'next/headers'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import ClientLayoutWrapper from '@/app/_components/ClientLayoutWrapper'
import SessionProvider from '@/app/_components/providers/SessionProvider'
import Navbar from '@/app/_components/Navbar'
import Footer from '@/app/_components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'
import { absoluteMediaUrl, absoluteSiteUrl, SITE_CONFIG } from '@/data/constants/siteConfig'

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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.URL),
  manifest: '/manifest.json',
  title: 'SKF Karate',
  description: 'SKF Karate (Sportkarate Federation) — Premier karate classes in Bangalore, Kunigal, Tumkur, and Udupi. WKF-affiliated. All ages welcome.',
  keywords: ['SKF karate', 'karate Karnataka', 'karate Bangalore', 'WKF karate', 'sportkarate federation'],
  alternates: {
    canonical: absoluteSiteUrl('/'),
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    title: 'SKF Karate',
    description: 'Join the fastest-growing WKF-affiliated Karate academy in Karnataka. Train with champions.',
    url: absoluteSiteUrl('/'),
    siteName: 'SKF Karate',
    images: [{ url: absoluteMediaUrl(), width: 1200, height: 630, alt: 'SKF Karate students training in Karnataka' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@skfkarate',
    title: 'SKF Karate',
    description: 'WKF-affiliated karate classes for kids and adults across Karnataka.',
    images: [absoluteMediaUrl()],
  },
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION || '' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } }
}


import { Providers } from '@/app/providers'
import AnalyticsLoader from '@/components/AnalyticsLoader'
import CookieConsent from '@/components/CookieConsent'

export default async function RootLayout({ children }: { children: ReactNode }) {
  const nonce = (await headers()).get('x-nonce') || undefined

  return (
    <html lang="en" dir="ltr" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        {/* Global Cinematic Orbs */}
        <div className="amb-orb amb-orb--1" />
        <div className="amb-orb amb-orb--2" />
        <div className="amb-orb amb-orb--3" />

        <Providers>
          <SessionProvider>
            <ClientLayoutWrapper 
              navbar={<Navbar />} 
              footer={<Footer />}
              whatsappButton={<WhatsAppButton />}
            >
              {children}
            </ClientLayoutWrapper>

            <CookieConsent />
          </SessionProvider>
        </Providers>
        <AnalyticsLoader nonce={nonce} />
      </body>
    </html>
  )
}
