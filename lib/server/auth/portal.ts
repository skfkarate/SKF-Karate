import jwt from 'jsonwebtoken'

import type { JWTPayload } from '@/types'
import { env, requireEnv } from '@/src/server/config/env'
import { PORTAL_JWT_EXPIRY, PORTAL_SESSION_SECONDS } from '@/lib/server/auth/session-lifetime'

const COOKIE_MAX_AGE = PORTAL_SESSION_SECONDS

export const COOKIE_NAME = 'skf_portal_token'

function getJwtSecret(): string {
  return requireEnv('JWT_SECRET')
}

export function createJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: PORTAL_JWT_EXPIRY, issuer: 'skf-portal', audience: 'skf-athlete' })
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, getJwtSecret(), { issuer: 'skf-portal', audience: 'skf-athlete' }) as JWTPayload
  } catch {
    return null
  }
}

export function buildPortalCookie(token: string): string {
  const isSecure = env.NODE_ENV === 'production'
  const secureFlag = isSecure ? '; Secure' : ''
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}${secureFlag}`
}

export function buildPortalCookieClear(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
}

export function getPortalToken(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie') || ''
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`))
  return match ? match[1] : null
}

export function getPortalSession(request: Request): JWTPayload | null {
  const token = getPortalToken(request)
  if (!token) return null
  return verifyJWT(token)
}
