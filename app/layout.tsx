import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import './profile.css'
import '@/components/skeletons/skeleton.css'
import './_components/Footer.css'
import './_components/Navbar.css'

import './_components/pages/home/HomeBookTrialCTA.css'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import ClientLayoutWrapper from '@/app/_components/ClientLayoutWrapper'
import Navbar from '@/app/_components/Navbar'
import Footer from '@/app/_components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'
import { SITE_CONFIG } from '@/data/constants/siteConfig'
import { buildSeoMetadata } from '@/data/constants/seo'

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
  ...buildSeoMetadata(
    '/',
    'SKF Karate offers professional karate classes in Karnataka with self-defense, kata, kumite, weapon training, kids programs, and adult coaching for all levels.'
  ),
  metadataBase: new URL(SITE_CONFIG.URL),
  manifest: '/manifest.json',
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION || '' },
}


import AnalyticsLoader from '@/components/AnalyticsLoader'
import CookieConsent from '@/components/CookieConsent'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        {/* Global Cinematic Orbs */}
        <div className="amb-orb amb-orb--1" />
        <div className="amb-orb amb-orb--2" />
        <div className="amb-orb amb-orb--3" />

        <ClientLayoutWrapper
          navbar={<Navbar />}
          footer={<Footer />}
          whatsappButton={<WhatsAppButton />}
        >
          {children}
        </ClientLayoutWrapper>

        <CookieConsent />
        <AnalyticsLoader />
      </body>
    </html>
  )
}
