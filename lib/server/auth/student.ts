import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { JWTPayload } from '@/types'

// ────────────────────────────────────────────────────────────────
// JWT_SECRET MUST be set in environment. No fallback allowed.
// A missing secret would allow anyone to forge session tokens.
// ────────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error(
    '[SKF Auth] JWT_SECRET env var is not set. ' +
    'Portal authentication cannot function safely. ' +
    'Set this in .env.local and Vercel environment variables.'
  )
}

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 12)
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash)
}

export function createStudentJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' })
}

export function verifyStudentJWT(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export const COOKIE_NAME = 'skf_portal_token'
