import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PORTAL_COOKIE_NAME = 'skf_portal_token'
const FEETRACK_HOST = 'fees.skfkarate.org'
const DEFAULT_CANONICAL_HOST = 'www.skfkarate.org'

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

function getCanonicalHost() {
  try {
    const configuredUrl = new URL(process.env.NEXT_PUBLIC_APP_URL || `https://${DEFAULT_CANONICAL_HOST}`)
    return configuredUrl.host.toLowerCase()
  } catch {
    return DEFAULT_CANONICAL_HOST
  }
}

function getAlternateCanonicalHost(canonicalHost: string) {
  return canonicalHost.startsWith('www.')
    ? canonicalHost.slice(4)
    : `www.${canonicalHost}`
}

function buildContentSecurityPolicy(nonce: string) {
  const isDev = process.env.NODE_ENV !== 'production'
  const scriptSources = [
    "'self'",
    `'nonce-${nonce}'`,
    'https://www.googletagmanager.com',
    'https://www.youtube.com',
    'https://www.youtube-nocookie.com',
    'https://s.ytimg.com',
  ]

  if (isDev) scriptSources.push("'unsafe-eval'")

  return [
    "default-src 'self'",
    `script-src ${scriptSources.join(' ')}`,
    "style-src 'self'",
    `style-src-elem 'self' 'nonce-${nonce}'`,
    "style-src-attr 'unsafe-inline'",
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
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
      'https://region1.google-analytics.com',
      'https://www.youtube.com',
      'https://www.youtube-nocookie.com',
      'https://*.ingest.sentry.io',
    ].join(' '),
    "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://drive.google.com https://www.google.com https://maps.google.com",
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

function isLegacyFeeHost(host: string) {
  return host === 'fee.skfkarate.org' || host === 'fee.skfkkarate.org' || host.startsWith('fee.')
}

function isLoopbackHost(host: string) {
  const hostname = host.split(':')[0]
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0' || hostname === '[::1]'
}

function buildCanonicalRedirectUrl(request: NextRequest, host: string) {
  const canonicalHost = getCanonicalHost()
  const target = new URL(request.url)
  const forwardedProto = request.headers.get('x-forwarded-proto')?.toLowerCase()

  if (process.env.NODE_ENV === 'production' && forwardedProto === 'http') {
    target.protocol = 'https:'
  }

  if (host === getAlternateCanonicalHost(canonicalHost)) {
    target.protocol = 'https:'
    target.host = canonicalHost
  }

  return target
}

function shouldRedirectToCanonical(request: NextRequest, host: string) {
  if (isLoopbackHost(host)) return false

  const canonicalHost = getCanonicalHost()
  const forwardedProto = request.headers.get('x-forwarded-proto')?.toLowerCase()
  return (
    host === getAlternateCanonicalHost(canonicalHost) ||
    (process.env.NODE_ENV === 'production' && forwardedProto === 'http')
  )
}

function buildFeeTrackRedirectUrl(request: NextRequest) {
  const target = new URL(request.url)
  target.protocol = 'https:'
  target.host = FEETRACK_HOST

  if (target.pathname === '/' || target.pathname === '/fee' || target.pathname === '/fee/login') {
    target.pathname = '/'
  } else if (target.pathname.startsWith('/fee/')) {
    target.pathname = target.pathname.slice('/fee'.length) || '/'
  }

  return target
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
  requestHeaders.set('Content-Security-Policy', csp)
  requestHeaders.set('x-nonce', nonce)

  const pathname = request.nextUrl.pathname
  requestHeaders.set('x-skf-pathname', pathname)
  const host = request.headers.get('host')?.toLowerCase() || ''

  if (isLegacyFeeHost(host)) {
    return attachSecurityHeaders(NextResponse.redirect(buildFeeTrackRedirectUrl(request), 308), csp)
  }

  if (shouldRedirectToCanonical(request, host)) {
    return attachSecurityHeaders(NextResponse.redirect(buildCanonicalRedirectUrl(request, host), 308), csp)
  }

  const portalToken = request.cookies.get(PORTAL_COOKIE_NAME)?.value
  const portalSession = await verifyPortalJwt(portalToken)
  const clearPortalCookie = Boolean(portalToken && !portalSession)
  if (portalSession?.skfId) {
    requestHeaders.set('x-skf-id', portalSession.skfId)
  }

  const isPortalLoginPage = pathname === '/portal/login'
  const isPortalRoute = pathname.startsWith('/portal')

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
