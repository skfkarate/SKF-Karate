'use client'

import { buildPortalLoginUrl, DEFAULT_PORTAL_CALLBACK } from '@/lib/portal/portal-callback'

export function getCurrentPortalCallbackUrl() {
  if (typeof window === 'undefined') return DEFAULT_PORTAL_CALLBACK
  return `${window.location.pathname}${window.location.search}`
}

export function getCurrentPortalLoginUrl() {
  return buildPortalLoginUrl(getCurrentPortalCallbackUrl())
}

export function redirectToCurrentPortalLogin() {
  if (typeof window === 'undefined') return
  window.location.assign(getCurrentPortalLoginUrl())
}
