import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Extract the portal session token
  const token = request.cookies.get('skf_portal_token')?.value
  const isLoginPage = request.nextUrl.pathname === '/portal/login'
  const isPortalRoute = request.nextUrl.pathname.startsWith('/portal')

  // We only run deep middleware checks on /portal routes
  if (isPortalRoute) {
    if (!token && !isLoginPage) {
      // Unauthenticated, block access to secure pages and throw instantly to login (Stops FOUC)
      return NextResponse.redirect(new URL('/portal/login', request.url))
    }
    
    if (token && isLoginPage) {
      // Authenticated but trying to hit login, bypass to dashboard (Stops reverse FOUC)
      return NextResponse.redirect(new URL('/portal/dashboard', request.url))
    }
  }

  // Continue rendering normally for public routes and authorized portal access
  return NextResponse.next()
}

export const config = {
  // Only match paths starting with /portal to save execution time
  matcher: ['/portal/:path*']
}
