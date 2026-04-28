import { Redis } from '@upstash/redis'

import { hasEnv } from '@/src/server/config/env'
import { logger } from '@/src/server/lib/logger'

const redis = hasEnv('UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN')
  ? Redis.fromEnv()
  : null

export async function cached<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  if (!redis) {
    return fetcher()
  }

  try {
    const existing = await redis.get<T>(key)

    if (existing !== null) {
      return existing
    }

    const fresh = await fetcher()
    await redis.set(key, fresh, { ex: ttlSeconds })
    return fresh
  } catch (error) {
    logger.warn('cache.read_failed', { key, error })
    return fetcher()
  }
}

export async function invalidateCache(key: string): Promise<void> {
  if (!redis) {
    return
  }

  try {
    await redis.del(key)
  } catch (error) {
    logger.warn('cache.invalidate_failed', { key, error })
  }
}

export async function pingCache(): Promise<'healthy' | 'degraded'> {
  if (!redis) {
    return 'degraded'
  }

  try {
    await redis.ping()
    return 'healthy'
  } catch (error) {
    logger.warn('cache.ping_failed', { error })
    return 'degraded'
  }
}
