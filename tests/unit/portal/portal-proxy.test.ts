import type { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'

import { createJWT } from '@/lib/server/auth/portal'
import { proxy } from '@/proxy'

function createProxyRequest(url: string, token?: string): NextRequest {
  const requestUrl = new URL(url)
  const headers = new Headers({
    host: requestUrl.host,
  })

  if (token) {
    headers.set('cookie', `skf_portal_token=${token}`)
  }

  return {
    url,
    headers,
    nextUrl: requestUrl,
    cookies: {
      get(name: string) {
        if (name !== 'skf_portal_token' || !token) return undefined
        return { name, value: token }
      },
    },
  } as NextRequest
}

describe('portal proxy redirects', () => {
  it('preserves the exact protected portal page as login callback', async () => {
    const response = await proxy(
      createProxyRequest('https://www.skfkarate.org/portal/fees?month=July&year=2026')
    )
    const location = response.headers.get('location')

    expect(location).toBeTruthy()
    const redirectUrl = new URL(location!)
    expect(redirectUrl.pathname).toBe('/portal/login')
    expect(redirectUrl.searchParams.get('callbackUrl')).toBe('/portal/fees?month=July&year=2026')
  })

  it('does not redirect authenticated users away from the login page', async () => {
    // Regression guard: redirecting authenticated users at the proxy AND on
    // the login page caused an infinite login<->dashboard ping-pong whenever
    // the two checks disagreed. The login PAGE alone owns that redirect now.
    const token = createJWT({
      skfId: 'SKF26MP001',
      role: 'student',
      branch: 'mp-sports-club',
      batch: null,
      belt: 'white',
      name: 'Test Student',
      parentPhone: null,
    })

    const response = await proxy(
      createProxyRequest(
        'https://www.skfkarate.org/portal/login?callbackUrl=%2Fportal%2Ffees%3Fmonth%3DJuly%26year%3D2026',
        token
      )
    )

    expect(response.headers.get('location')).toBeNull()
  })

  it('redirects expired portal sessions to login and clears the stale cookie', async () => {
    const token = createJWT({
      skfId: 'SKF26MP001',
      role: 'student',
      branch: 'mp-sports-club',
      batch: null,
      belt: 'white',
      name: 'Test Student',
      parentPhone: null,
    })
    const [header, payload] = token.split('.')
    const expiredToken = [
      header,
      Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 3600 })).toString('base64url'),
      payload,
    ].join('.')

    const response = await proxy(
      createProxyRequest('https://www.skfkarate.org/portal/dashboard', expiredToken)
    )
    const location = response.headers.get('location')

    expect(new URL(location!).pathname).toBe('/portal/login')
    const setCookie = response.headers.getSetCookie().join('; ')
    expect(setCookie).toContain('skf_portal_token=;')
  })
})
