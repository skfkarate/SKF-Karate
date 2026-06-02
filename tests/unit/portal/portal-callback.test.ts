import { describe, expect, it } from 'vitest'

import { sanitizePortalCallbackUrl } from '@/lib/server/auth/portal-callback'

describe('portal login callback sanitizer', () => {
  it('keeps safe portal-relative callback URLs', () => {
    expect(sanitizePortalCallbackUrl('/portal/videos')).toBe('/portal/videos')
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
})
