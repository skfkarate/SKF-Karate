import { NextRequest, NextResponse } from 'next/server'
import { verifyStudentJWT } from '@/lib/server/auth'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Protect portal routes (not the login page itself)
  if (pathname.startsWith('/portal') && !pathname.startsWith('/portal/login')) {
    const token = request.cookies.get('skf_student_token')?.value
    if (!token || !verifyStudentJWT(token)) {
      return NextResponse.redirect(new URL('/portal/login', request.url))
    }
  }
  
  // Admin routes remain on next-auth (already handled)
  return NextResponse.next()
}

export const config = {
  matcher: ['/portal/:path*']
}
