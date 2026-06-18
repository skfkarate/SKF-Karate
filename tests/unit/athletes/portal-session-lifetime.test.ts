import jwt, { type JwtPayload } from 'jsonwebtoken'
import { afterEach, describe, expect, it, vi } from 'vitest'

const PORTAL_SESSION_DAYS = 30
const PORTAL_SESSION_SECONDS = PORTAL_SESSION_DAYS * 24 * 60 * 60
const TEST_JWT_SECRET = 'a'.repeat(32)

describe('portal session lifetime', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('sets the portal cookie for 30 days', async () => {
    const { buildPortalCookie } = await import('@/lib/server/auth/portal')

    expect(buildPortalCookie('signed-token')).toContain(`Max-Age=${PORTAL_SESSION_SECONDS}`)
  })

  it('signs portal JWTs for 30 days', async () => {
    vi.stubEnv('JWT_SECRET', TEST_JWT_SECRET)
    const { createJWT } = await import('@/lib/server/auth/portal')

    const token = createJWT({
      skfId: 'SKF26MP001',
      role: 'student',
      branch: 'mp-sports-club',
      batch: null,
      belt: 'white',
      name: 'Test Student',
      parentPhone: null,
    })

    const decoded = jwt.decode(token) as JwtPayload | null

    expect(decoded?.iat).toBeDefined()
    expect(decoded?.exp).toBeDefined()
    expect(decoded!.exp! - decoded!.iat!).toBe(PORTAL_SESSION_SECONDS)
  })

  it('keeps the student auth helper aligned with the portal lifetime', async () => {
    vi.stubEnv('JWT_SECRET', TEST_JWT_SECRET)
    const { createStudentJWT } = await import('@/lib/server/auth/student')

    const token = createStudentJWT({
      skfId: 'SKF26MP001',
      role: 'student',
      branch: 'mp-sports-club',
      batch: null,
      belt: 'white',
      name: 'Test Student',
      parentPhone: null,
    })

    const decoded = jwt.decode(token) as JwtPayload | null

    expect(decoded?.iat).toBeDefined()
    expect(decoded?.exp).toBeDefined()
    expect(decoded!.exp! - decoded!.iat!).toBe(PORTAL_SESSION_SECONDS)
  })
})
