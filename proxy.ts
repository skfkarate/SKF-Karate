import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PORTAL_COOKIE_NAME = 'skf_portal_token'

type PortalJwtPayload = {
  skfId?: string
  role?: string
  exp?: number
}

function generateNonce() {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return btoa(String.fromCharCode(...bytes))
}

function buildContentSecurityPolicy(nonce: string) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://checkout.razorpay.com https://www.googletagmanager.com https://www.youtube.com https://www.youtube-nocookie.com https://s.ytimg.com`,
    "style-src 'self' 'unsafe-inline'",
    [
      "img-src 'self' data: blob:",
      'https://*.supabase.co',
      'https://*.googleusercontent.com',
      'https://images.unsplash.com',
      'https://picsum.photos',
      'https://img.youtube.com',
      'https://i.ytimg.com',
      'https://www.sportdata.org',
      'https://www.wkf.net',
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
    ].join(' '),
    "font-src 'self' data:",
    "media-src 'self' blob: https://*.supabase.co https:",
    [
      "connect-src 'self'",
      'https://*.supabase.co',
      'wss://*.supabase.co',
      'https://api.telegram.org',
      'https://checkout.razorpay.com',
      'https://api.razorpay.com',
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
      'https://region1.google-analytics.com',
      'https://www.youtube.com',
      'https://www.youtube-nocookie.com',
      'https://*.ingest.sentry.io',
    ].join(' '),
    "frame-src 'self' https://checkout.razorpay.com https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://drive.google.com",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    'upgrade-insecure-requests',
  ].join('; ')
}

function attachSecurityHeaders(
  response: NextResponse,
  csp: string,
  options: { clearPortalCookie?: boolean } = {}
) {
  response.headers.set('Content-Security-Policy', csp)
  if (options.clearPortalCookie) {
    response.cookies.set(PORTAL_COOKIE_NAME, '', {
      path: '/',
      maxAge: 0,
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    })
  }
  return response
}

function base64UrlToBytes(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return bytes
}

function decodeBase64UrlJson<T>(value: string): T | null {
  try {
    return JSON.parse(new TextDecoder().decode(base64UrlToBytes(value))) as T
  } catch {
    return null
  }
}

async function verifyPortalJwt(token: string | undefined): Promise<PortalJwtPayload | null> {
  const secret = process.env.JWT_SECRET
  if (!token || !secret) return null

  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const [encodedHeader, encodedPayload, encodedSignature] = parts
    const header = decodeBase64UrlJson<{ alg?: string }>(encodedHeader)
    if (header?.alg !== 'HS256') return null

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      base64UrlToBytes(encodedSignature),
      new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
    )

    if (!valid) return null

    const payload = decodeBase64UrlJson<PortalJwtPayload>(encodedPayload)
    if (!payload?.skfId || typeof payload.skfId !== 'string') return null
    if (payload.exp && payload.exp <= Math.floor(Date.now() / 1000)) return null

    return payload
  } catch {
    return null
  }
}

export async function proxy(request: NextRequest) {
  const nonce = generateNonce()
  const csp = buildContentSecurityPolicy(nonce)
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', csp)

  const pathname = request.nextUrl.pathname
  const host = request.headers.get('host')?.toLowerCase() || ''

  const portalToken = request.cookies.get(PORTAL_COOKIE_NAME)?.value
  const portalSession = await verifyPortalJwt(portalToken)
  const clearPortalCookie = Boolean(portalToken && !portalSession)
  if (portalSession?.skfId) {
    requestHeaders.set('x-skf-id', portalSession.skfId)
  }

  const isPortalLoginPage = pathname === '/portal/login'
  const isPortalRoute = pathname.startsWith('/portal')

  const adminToken =
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-next-auth.session-token')?.value
  const isAdminLoginPage = pathname === '/admin/login'
  const isAdminRoute = pathname.startsWith('/admin')
  const isFeeLoginPage = pathname === '/fee/login'
  const isFeeRoute = pathname.startsWith('/fee')
  const isFeeHost =
    host === 'fee.skfkarate.org' ||
    host === 'fee.skfkkarate.org' ||
    host.startsWith('fee.')

  if (isFeeHost && pathname === '/') {
    return attachSecurityHeaders(NextResponse.redirect(new URL('/fee', request.url)), csp)
  }

  if (isFeeHost && isAdminRoute) {
    const mappedPath =
      pathname === '/admin' || pathname === '/admin/dashboard'
        ? '/fee'
        : pathname === '/admin/login'
          ? '/fee/login'
          : pathname.replace(/^\/admin/, '/fee')

    const target = new URL(request.url)
    target.pathname = mappedPath
    return attachSecurityHeaders(NextResponse.redirect(target), csp)
  }

  if (isPortalRoute) {
    if (!portalSession && !isPortalLoginPage) {
      return attachSecurityHeaders(NextResponse.redirect(new URL('/portal/login', request.url)), csp, {
        clearPortalCookie,
      })
    }

    if (portalSession && isPortalLoginPage) {
      return attachSecurityHeaders(NextResponse.redirect(new URL('/portal/dashboard', request.url)), csp)
    }
  }

  if (isFeeRoute) {
    if (!adminToken && !isFeeLoginPage) {
      return attachSecurityHeaders(NextResponse.redirect(new URL('/fee/login', request.url)), csp)
    }

    if (adminToken && isFeeLoginPage) {
      return attachSecurityHeaders(NextResponse.redirect(new URL('/fee', request.url)), csp)
    }
  }

  if (isAdminRoute) {
    if (!adminToken && !isAdminLoginPage) {
      return attachSecurityHeaders(NextResponse.redirect(new URL('/admin/login', request.url)), csp)
    }

    if (adminToken && isAdminLoginPage) {
      return attachSecurityHeaders(NextResponse.redirect(new URL('/admin/dashboard', request.url)), csp)
    }
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  return attachSecurityHeaders(response, csp, { clearPortalCookie })
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icon.png|manifest.json|robots.txt|sitemap.xml|sitemap-0.xml|.*\\..*).*)',
  ],
}
