import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

function requestFromIp(ip: string) {
  return new Request('https://example.test/api/auth/portal', {
    headers: {
      'x-forwarded-for': ip,
    },
  })
}

describe('portal auth rate limits', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('NODE_ENV', 'test')
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('allows normal login bursts from a shared network', async () => {
    const { applyRateLimit } = await import('@/src/server/lib/rate-limit')
    const ip = '203.0.113.25'

    for (let attempt = 0; attempt < 50; attempt += 1) {
      const result = await applyRateLimit(requestFromIp(ip), 'portalAuthIp', 'portal-login')
      expect(result.allowed).toBe(true)
    }
  })

  it('limits repeated attempts for the same student on one network', async () => {
    const { applyRateLimitForKey } = await import('@/src/server/lib/rate-limit')
    const keySuffix = 'student:test-student'

    for (let attempt = 0; attempt < 12; attempt += 1) {
      const result = await applyRateLimitForKey('portalAuthStudent', keySuffix)
      expect(result.allowed).toBe(true)
    }

    const blocked = await applyRateLimitForKey('portalAuthStudent', keySuffix)
    expect(blocked.allowed).toBe(false)
  })
})
