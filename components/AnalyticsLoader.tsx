'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

export default function AnalyticsLoader() {
  const [consented, setConsented] = useState(false)

  useEffect(() => {
    // Check initial consent status
    const consentString = localStorage.getItem('skf_cookie_consent')
    if (consentString) {
      try {
        const consent = JSON.parse(consentString)
        if (consent.analytics) setConsented(true)
      } catch (e) {}
    }

    // Listen to changes if they happen in the same window
    const handleStorage = () => {
      const consentStr = localStorage.getItem('skf_cookie_consent')
      if (consentStr) {
        try {
          const consent = JSON.parse(consentStr)
          if (consent.analytics) setConsented(true)
        } catch (e) {}
      }
    }

    window.addEventListener('skf_consent_updated', handleStorage)
    return () => window.removeEventListener('skf_consent_updated', handleStorage)
  }, [])

  if (!consented) return null

  const gaId = process.env.NEXT_PUBLIC_GA_ID || ''
  if (!gaId) return null

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  )
}
