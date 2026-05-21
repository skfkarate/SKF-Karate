import localFont from 'next/font/local'
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

const bodyFont = localFont({
  src: [
    {
      path: '../public/fonts/Montserrat-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Montserrat-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
  variable: '--font-body-local',
})

const headingFont = localFont({
  src: [
    {
      path: '../public/fonts/Cinzel-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Cinzel-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
  variable: '--font-heading-local',
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
    <html lang="en" dir="ltr" className={`${bodyFont.variable} ${headingFont.variable}`}>
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
