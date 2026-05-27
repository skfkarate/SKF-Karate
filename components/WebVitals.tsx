'use client'

import { useEffect } from 'react'
import type { MetricType } from 'web-vitals'

const VITALS_ENDPOINT = '/api/vitals'

function sendMetric(metric: MetricType) {
  const body = JSON.stringify({
    id: metric.id,
    name: metric.name,
    value: metric.value,
    delta: metric.delta,
    rating: metric.rating,
    navigationType: metric.navigationType,
    path: window.location.pathname,
  })

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' })
    navigator.sendBeacon(VITALS_ENDPOINT, blob)
    return
  }

  void fetch(VITALS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => null)
}

export default function WebVitals() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return

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
  }, [])

  return null
}
