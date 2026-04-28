import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const host = request.headers.get('host')?.toLowerCase() || ''

  const portalToken = request.cookies.get('skf_portal_token')?.value
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
    return NextResponse.redirect(new URL('/fee', request.url))
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
    return NextResponse.redirect(target)
  }

  if (isPortalRoute) {
    if (!portalToken && !isPortalLoginPage) {
      return NextResponse.redirect(new URL('/portal/login', request.url))
    }

    if (portalToken && isPortalLoginPage) {
      return NextResponse.redirect(new URL('/portal/dashboard', request.url))
    }
  }

  if (isFeeRoute) {
    if (!adminToken && !isFeeLoginPage) {
      return NextResponse.redirect(new URL('/fee/login', request.url))
    }

    if (adminToken && isFeeLoginPage) {
      return NextResponse.redirect(new URL('/fee', request.url))
    }
  }

  if (isAdminRoute) {
    if (!adminToken && !isAdminLoginPage) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    if (adminToken && isAdminLoginPage) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/portal/:path*', '/admin/:path*', '/fee/:path*'],
}
