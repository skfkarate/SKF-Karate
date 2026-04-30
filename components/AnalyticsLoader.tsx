'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import FirstPartyAnalyticsTracker from '@/components/FirstPartyAnalyticsTracker'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

function hasAnalyticsConsent() {
  const consentString = localStorage.getItem('skf_cookie_consent')
  if (!consentString) return false

  try {
    const consent = JSON.parse(consentString)
    return Boolean(consent.analytics)
  } catch {
    return false
  }
}

type AnalyticsLoaderProps = {
  nonce?: string
}

export default function AnalyticsLoader({ nonce }: AnalyticsLoaderProps) {
  const [consented, setConsented] = useState(false)

  useEffect(() => {
    const syncConsent = () => setConsented(hasAnalyticsConsent())
    const id = window.setTimeout(syncConsent, 0)

    window.addEventListener('skf_consent_updated', handleStorage)
    function handleStorage() {
      syncConsent()
    }

    return () => {
      window.clearTimeout(id)
      window.removeEventListener('skf_consent_updated', handleStorage)
    }
  }, [])

  if (!consented) return null

  const gaId = process.env.NEXT_PUBLIC_GA_ID || ''

  return (
    <>
      <FirstPartyAnalyticsTracker />
      {gaId ? (
        <Script
          nonce={nonce}
          src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          strategy="afterInteractive"
          onLoad={() => {
            window.dataLayer = window.dataLayer || []
            window.gtag = (...args: unknown[]) => {
              window.dataLayer?.push(args)
            }
            window.gtag('js', new Date())
            window.gtag('config', gaId)
          }}
        />
      ) : null}
    </>
  )
}
