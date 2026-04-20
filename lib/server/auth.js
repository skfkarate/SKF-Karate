import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET
const JWT_EXPIRY = '30d' // 30 days

if (!JWT_SECRET) {
  console.warn('[Auth] No JWT_SECRET or NEXTAUTH_SECRET found. Student auth will not work.')
}

// ─── PIN Hashing ─────────────────────────────────────────────────────────────

/**
 * Hash a 4-digit PIN using bcrypt (12 rounds).
 * @param {string} pin — exactly 4 digits
 * @returns {Promise<string>} bcrypt hash
 */
export async function hashPin(pin) {
  if (!/^\d{4}$/.test(pin)) {
    throw new Error('PIN must be exactly 4 digits')
  }
  return bcrypt.hash(pin, 12)
}

/**
 * Verify a PIN against a bcrypt hash.
 * @param {string} pin — plaintext PIN
 * @param {string} hash — bcrypt hash from DB
 * @returns {Promise<boolean>}
 */
export async function verifyPin(pin, hash) {
  return bcrypt.compare(pin, hash)
}

// ─── JWT ─────────────────────────────────────────────────────────────────────

/**
 * Create a signed JWT for a student/parent session.
 * @param {object} payload
 * @param {string} payload.skfId
 * @param {string} payload.role — 'student' | 'sensei' | 'branch_admin' | 'super_admin'
 * @param {string} [payload.branch]
 * @param {string} [payload.batch]
 * @param {string} [payload.belt]
 * @param {string} [payload.name]
 * @returns {string} signed JWT
 */
export function createJWT(payload) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not configured')
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY })
}

/**
 * Verify and decode a JWT.
 * @param {string} token
 * @returns {object|null} decoded payload, or null if invalid/expired
 */
export function verifyJWT(token) {
  if (!JWT_SECRET) return null
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

// ─── Cookie Helpers ─────────────────────────────────────────────────────────

const COOKIE_NAME = 'skf_portal_token'
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 // 30 days in seconds

/**
 * Build the Set-Cookie header value for the portal JWT.
 * @param {string} token — signed JWT
 * @returns {string}
 */
export function buildPortalCookie(token) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${COOKIE_MAX_AGE}${secure}`
}

/**
 * Build the Set-Cookie header to clear the portal token.
 * @returns {string}
 */
export function buildPortalCookieClear() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`
}

/**
 * Extract the portal JWT from a request's cookies.
 * @param {Request} request
 * @returns {string|null}
 */
export function getPortalToken(request) {
  const cookieHeader = request.headers.get('cookie') || ''
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`))
  return match ? match[1] : null
}

/**
 * Extract and verify the portal session from a request.
 * @param {Request} request
 * @returns {object|null} decoded JWT payload, or null if not authenticated
 */
export function getPortalSession(request) {
  const token = getPortalToken(request)
  if (!token) return null
  return verifyJWT(token)
}

export { COOKIE_NAME }
