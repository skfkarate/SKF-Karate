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

  it('sends authenticated login visits back to the requested portal page', async () => {
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
    const location = response.headers.get('location')

    expect(location).toBe('https://www.skfkarate.org/portal/fees?month=July&year=2026')
  })
})
