import { checkRateLimit as checkMemoryRateLimit } from '@/lib/server/rate-limit'
import { checkRateLimit as checkRedisRateLimit } from '@/lib/server/rate-limit-redis'
import { env, hasEnv } from '@/src/server/config/env'

type RateLimitWindow = `${number}${'s' | 'm' | 'h'}`

type RateLimitTier = {
  name: string
  limit: number
  window: RateLimitWindow
}

const RATE_LIMITS = {
  public: { name: 'public', limit: 60, window: '1m' },
  authed: { name: 'authed', limit: 300, window: '1m' },
  write: { name: 'write', limit: 30, window: '1m' },
  contact: { name: 'contact', limit: 3, window: '15m' },
  lookup: { name: 'lookup', limit: 5, window: '1m' },
  certificateLookup: { name: 'certificateLookup', limit: 20, window: '5m' },
  auth: { name: 'auth', limit: 5, window: '15m' },
  sensitive: { name: 'sensitive', limit: 3, window: '1h' },
  upload: { name: 'upload', limit: 10, window: '1h' },
} as const satisfies Record<string, RateLimitTier>

function windowToMs(window: RateLimitWindow): number {
  const amount = Number.parseInt(window, 10)

  if (window.endsWith('h')) return amount * 60 * 60 * 1000
  if (window.endsWith('m')) return amount * 60 * 1000
  return amount * 1000
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')

  if (forwardedFor) {
    const [ip] = forwardedFor.split(',')
    return ip?.trim() || 'unknown'
  }

  return request.headers.get('x-real-ip')?.trim() || 'unknown'
}

export async function applyRateLimit(
  request: Request,
  tier: keyof typeof RATE_LIMITS,
  keySuffix?: string
) {
  const config = RATE_LIMITS[tier]
  const key = `${getClientIp(request)}${keySuffix ? `:${keySuffix}` : ''}`
  const params = {
    limit: config.limit,
    windowMs: windowToMs(config.window),
  }
  const hasPersistentRateLimit = hasEnv('UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN')

  if (env.NODE_ENV === 'production' && !hasPersistentRateLimit) {
    return {
      allowed: false,
      headers: {
        'X-RateLimit-Limit': String(config.limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Date.now() + params.windowMs),
        'Retry-After': String(Math.max(1, Math.ceil(params.windowMs / 1000))),
      },
    }
  }

  const result = hasPersistentRateLimit
    ? await checkRedisRateLimit(config.name, key, params)
    : checkMemoryRateLimit(config.name, key, params)

  return {
    allowed: result.allowed,
    headers: {
      'X-RateLimit-Limit': String(config.limit),
      'X-RateLimit-Remaining': String(result.remaining),
      'X-RateLimit-Reset': String(result.resetAt),
      'Retry-After': String(result.retryAfter),
    },
  }
}
