import jwt from 'jsonwebtoken'
import type { JWTPayload } from '@/types'

import { requireEnv } from '@/src/server/config/env'

const PORTAL_SESSION_DAYS = 30
const JWT_EXPIRY = `${PORTAL_SESSION_DAYS}d`

function getJwtSecret(): string {
  return requireEnv('JWT_SECRET')
}

export function createStudentJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRY })
}

export function verifyStudentJWT(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as JWTPayload
  } catch {
    return null
  }
}

export const COOKIE_NAME = 'skf_portal_token'
