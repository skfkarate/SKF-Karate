import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import type { JWTPayload } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRY = '30d'
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60

export const COOKIE_NAME = 'skf_portal_token'

if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('[SKF Auth] JWT_SECRET is required for portal authentication.')
}

function getJwtSecret() {
  if (!JWT_SECRET) {
    throw new Error('[SKF Auth] JWT_SECRET is not configured.')
  }
  return JWT_SECRET
}

export async function hashPin(pin: string): Promise<string> {
  if (!/^\d{4}$/.test(pin)) {
    throw new Error('PIN must be exactly 4 digits')
  }
  return bcrypt.hash(pin, 12)
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash)
}

export function createJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRY })
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as JWTPayload
  } catch {
    return null
  }
}

export function buildPortalCookie(token: string): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${COOKIE_MAX_AGE}${secure}`
}

export function buildPortalCookieClear(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`
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
