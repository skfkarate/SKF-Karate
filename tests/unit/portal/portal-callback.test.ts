import { describe, expect, it } from 'vitest'

import { buildPortalLoginUrl, sanitizePortalCallbackUrl } from '@/lib/server/auth/portal-callback'

describe('portal login callback sanitizer', () => {
  it('keeps safe portal-relative callback URLs', () => {
    expect(sanitizePortalCallbackUrl('/portal/videos')).toBe('/portal/videos')
    expect(sanitizePortalCallbackUrl('/portal/fees')).toBe('/portal/fees')
    expect(sanitizePortalCallbackUrl('/portal/fees?month=July&year=2026')).toBe('/portal/fees?month=July&year=2026')
    expect(sanitizePortalCallbackUrl('/portal/points?page=2')).toBe('/portal/points?page=2')
    expect(sanitizePortalCallbackUrl(['/portal/journey?tab=belts', '/portal/dashboard'])).toBe('/portal/journey?tab=belts')
  })

  it('falls back for missing, external, and non-portal callback URLs', () => {
    expect(sanitizePortalCallbackUrl(undefined)).toBe('/portal/dashboard')
    expect(sanitizePortalCallbackUrl('')).toBe('/portal/dashboard')
    expect(sanitizePortalCallbackUrl('https://evil.example/portal/dashboard')).toBe('/portal/dashboard')
    expect(sanitizePortalCallbackUrl('//evil.example/portal/dashboard')).toBe('/portal/dashboard')
    expect(sanitizePortalCallbackUrl('/admin')).toBe('/portal/dashboard')
  })

  it('does not redirect authenticated athletes back into the login flow', () => {
    expect(sanitizePortalCallbackUrl('/portal/login')).toBe('/portal/dashboard')
    expect(sanitizePortalCallbackUrl('/portal/login/reset')).toBe('/portal/dashboard')
  })

  it('builds encoded login URLs for protected portal pages', () => {
    expect(buildPortalLoginUrl('/portal/fees?month=July&year=2026')).toBe(
      '/portal/login?callbackUrl=%2Fportal%2Ffees%3Fmonth%3DJuly%26year%3D2026'
    )
    expect(buildPortalLoginUrl('/admin')).toBe('/portal/login?callbackUrl=%2Fportal%2Fdashboard')
  })
})
