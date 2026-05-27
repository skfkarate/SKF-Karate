'use client'

import { useEffect, useState } from 'react'
import type { MetricType } from 'web-vitals'
import { getCookieConsent } from '@/lib/cookies/consent'

const VITALS_ENDPOINT = '/api/vitals'

function sendMetric(metric: MetricType) {
  if (!hasAnalyticsConsent()) return

  const body = JSON.stringify({
    id: metric.id,
    name: metric.name,
    value: metric.value,
    delta: metric.delta,
    rating: metric.rating,
    navigationType: metric.navigationType,
    path: window.location.pathname,
  })

  void fetch(VITALS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => null)
}

function hasAnalyticsConsent() {
  return Boolean(getCookieConsent()?.analytics)
}

export default function WebVitals() {
  const [consented, setConsented] = useState(false)

  useEffect(() => {
    const syncConsent = () => setConsented(hasAnalyticsConsent())

    syncConsent()
    window.addEventListener('skf_consent_updated', syncConsent)

    return () => {
      window.removeEventListener('skf_consent_updated', syncConsent)
    }
  }, [])

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !consented) return

    let cancelled = false

    void import('web-vitals').then(({ onCLS, onFCP, onFID, onINP, onLCP, onTTFB }) => {
      if (cancelled) return

      onCLS(sendMetric)
      onFCP(sendMetric)
      onFID(sendMetric)
      onINP(sendMetric)
      onLCP(sendMetric)
      onTTFB(sendMetric)
    })

    return () => {
      cancelled = true
    }
  }, [consented])

  return null
}
