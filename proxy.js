import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

const PORTAL_COOKIE_NAME = 'skf_portal_token'

export async function proxy(req) {
  const { pathname } = req.nextUrl

  // ── Portal routes (student auth via JWT cookie) ──────────────────────
  if (pathname.startsWith('/portal')) {
    // Allow login page and portal auth API
    if (pathname === '/portal/login' || pathname.startsWith('/api/auth/portal')) {
      return NextResponse.next()
    }

    const token = req.cookies.get(PORTAL_COOKIE_NAME)?.value

    if (!token) {
      const loginUrl = req.nextUrl.clone()
      loginUrl.pathname = '/portal/login'
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Basic JWT structure check (3 dot-separated base64 segments)
    // Full verification happens in API routes via verifyJWT()
    const parts = token.split('.')
    if (parts.length !== 3) {
      const loginUrl = req.nextUrl.clone()
      loginUrl.pathname = '/portal/login'
      return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
  }

  // ── Admin routes (next-auth) ─────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (pathname === "/admin/login" || pathname.startsWith("/api/auth/")) {
      return NextResponse.next()
    }

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    if (!token) {
      const url = req.nextUrl.clone()
      url.pathname = "/admin/login"
      url.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(url)
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*"],
}
