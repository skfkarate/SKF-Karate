import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import './profile.css'
import '@/components/skeletons/skeleton.css'
import './_components/Footer.css'
import './_components/Navbar.css'

import './_components/pages/home/HomeBookTrialCTA.css'
import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { headers } from 'next/headers'
import ClientLayoutWrapper from '@/app/_components/ClientLayoutWrapper'
import Navbar from '@/app/_components/Navbar'
import Footer from '@/app/_components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'
import { getCanonicalOrigin } from '@/data/constants/siteConfig'
import { buildSeoMetadata } from '@/data/constants/seo'

const bodyFont = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-body-google',
})

const headingFont = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-heading-google',
})

export const metadata: Metadata = {
  ...buildSeoMetadata(
    '/',
    'SKF Karate offers professional karate classes in Karnataka with self-defense, kata, kumite, weapon training, kids programs, and adult coaching for all levels.'
  ),
  metadataBase: new URL(getCanonicalOrigin()),
  manifest: '/manifest.json',
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION || '' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // User zoom is intentionally NOT disabled (no maximum-scale=1.0) to ensure accessibility
}


import AnalyticsLoader from '@/components/AnalyticsLoader'
import CookieConsent from '@/components/CookieConsent'
import ResourceHints from '@/components/ResourceHints'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'
import WebVitals from '@/components/WebVitals'
import { NonceProvider } from '@/components/NonceProvider'

export default async function RootLayout({ children }: { children: ReactNode }) {
	const nonce = (await headers()).get('x-nonce') || undefined

	return (
		<html lang="en" dir="ltr" className={`${bodyFont.variable} ${headingFont.variable}`}>
			<body>
				<NonceProvider nonce={nonce}>
					<ResourceHints />
					<a href="#main-content" className="skip-to-content">Skip to main content</a>
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
					<AnalyticsLoader nonce={nonce} />
					<ServiceWorkerRegistration />
					<WebVitals />
				</NonceProvider>
			</body>
		</html>
	)
}
