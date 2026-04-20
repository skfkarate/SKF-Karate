/**
 * Redis-backed rate limiting using @upstash/ratelimit.
 *
 * Drop-in replacement for lib/server/rate-limit.ts.
 * Uses a sliding window algorithm for accurate rate limiting
 * across serverless invocations.
 *
 * Requires:
 *   UPSTASH_REDIS_REST_URL
 *   UPSTASH_REDIS_REST_TOKEN
 *
 * Usage: Same checkRateLimit(name, key, { limit, windowMs }) interface.
 */
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

const limiters = new Map<string, Ratelimit>()

function getLimiter(name: string, limit: number, windowMs: number): Ratelimit {
  const key = `${name}_${limit}_${windowMs}`
  const existing = limiters.get(key)
  if (existing) return existing

  const windowSec = Math.max(1, Math.ceil(windowMs / 1000))
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
    analytics: true,
    prefix: `skf_${name}_`,
  })
  limiters.set(key, limiter)
  return limiter
}

export async function checkRateLimit(
  name: string,
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
) {
  const limiter = getLimiter(name, limit, windowMs)
  const safeKey = key || 'unknown'
  const result = await limiter.limit(safeKey)

  return {
    allowed: result.success,
    remaining: result.remaining,
    retryAfter: result.success ? 0 : Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)),
    resetAt: result.reset,
  }
}
