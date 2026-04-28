'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { consumeRouteTransition } from '@/components/navigation/routeTransitionTelemetry'

const VISITOR_STORAGE_KEY = 'skf_analytics_visitor_id'
const SESSION_STORAGE_KEY = 'skf_analytics_session_id'
const SESSION_LANDING_KEY = 'skf_analytics_landing_recorded'

function createId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`
}

function getVisitorId() {
  const existing = window.localStorage.getItem(VISITOR_STORAGE_KEY)
  if (existing) return existing

  const next = createId('visitor')
  window.localStorage.setItem(VISITOR_STORAGE_KEY, next)
  return next
}

function getSessionId() {
  const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY)
  if (existing) return existing

  const next = createId('session')
  window.sessionStorage.setItem(SESSION_STORAGE_KEY, next)
  return next
}

function isLandingView() {
  const recorded = window.sessionStorage.getItem(SESSION_LANDING_KEY)
  if (recorded === '1') return false

  window.sessionStorage.setItem(SESSION_LANDING_KEY, '1')
  return true
}

function sendAnalytics(payload: Record<string, unknown>) {
  const body = JSON.stringify(payload)

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' })
    navigator.sendBeacon('/api/analytics/track', blob)
    return
  }

  void fetch('/api/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => undefined)
}

export default function FirstPartyAnalyticsTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastTrackedPath = useRef<string>('')

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return

    const search = searchParams?.toString()
    const fullPath = search ? `${pathname}?${search}` : pathname

    if (lastTrackedPath.current === fullPath) {
      return
    }

    lastTrackedPath.current = fullPath

    const visitorId = getVisitorId()
    const sessionId = getSessionId()
    const landing = isLandingView()
    const pageGroup = pathname.startsWith('/portal') ? 'portal' : 'public'
    const transition = consumeRouteTransition(fullPath)

    sendAnalytics({
      eventType: 'page_view',
      path: fullPath,
      pageTitle: document.title,
      referrer: document.referrer || undefined,
      visitorId,
      sessionId,
      metadata: {
        landing,
        pageGroup,
        ...(transition ? { routeTransition: transition } : {}),
      },
    })
  }, [pathname, searchParams])

  return null
}
