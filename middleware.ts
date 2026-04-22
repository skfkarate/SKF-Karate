import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Extract the portal session token
  const portalToken = request.cookies.get('skf_portal_token')?.value
  const isPortalLoginPage = request.nextUrl.pathname === '/portal/login'
  const isPortalRoute = request.nextUrl.pathname.startsWith('/portal')

  // Extract the admin NextAuth token (handles local and secure prod cookies)
  const adminToken = request.cookies.get('next-auth.session-token')?.value || request.cookies.get('__Secure-next-auth.session-token')?.value
  const isAdminLoginPage = request.nextUrl.pathname === '/admin/login'
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')

  // We only run deep middleware checks on /portal routes
  if (isPortalRoute) {
    if (!portalToken && !isPortalLoginPage) {
      // Unauthenticated, block access to secure pages and throw instantly to login (Stops FOUC)
      return NextResponse.redirect(new URL('/portal/login', request.url))
    }
    
    if (portalToken && isPortalLoginPage) {
      // Authenticated but trying to hit login, bypass to dashboard (Stops reverse FOUC)
      return NextResponse.redirect(new URL('/portal/dashboard', request.url))
    }
  }

  // We run deep middleware checks on /admin routes
  if (isAdminRoute) {
    if (!adminToken && !isAdminLoginPage) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    
    if (adminToken && isAdminLoginPage) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
  }

  // Continue rendering normally for public routes and authorized portal access
  return NextResponse.next()
}

export const config = {
  // Match portal and admin paths to save execution time
  matcher: ['/portal/:path*', '/admin/:path*']
}
