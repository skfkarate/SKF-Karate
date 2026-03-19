import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function proxy(req) {
  const { pathname } = req.nextUrl

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

export const config = {
  matcher: ["/admin/:path*"],
}
