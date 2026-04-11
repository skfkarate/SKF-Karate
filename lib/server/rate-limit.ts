const globalBuckets = globalThis.__skfRateLimitBuckets || new Map()

if (!globalThis.__skfRateLimitBuckets) {
  globalThis.__skfRateLimitBuckets = globalBuckets
}

function getBucket(name) {
  const bucketName = name || 'default'
  const existing = globalBuckets.get(bucketName)

  if (existing) {
    return existing
  }

  const bucket = new Map()
  globalBuckets.set(bucketName, bucket)
  return bucket
}

function pruneExpiredEntries(bucket, now) {
  for (const [key, entry] of bucket.entries()) {
    if (entry.resetAt <= now) {
      bucket.delete(key)
    }
  }
}

export function checkRateLimit(name, key, { limit, windowMs }) {
  const now = Date.now()
  const bucket = getBucket(name)
  const safeKey = key || 'unknown'

  pruneExpiredEntries(bucket, now)

  const current = bucket.get(safeKey)
  if (!current) {
    const resetAt = now + windowMs
    bucket.set(safeKey, { count: 1, resetAt })

    return {
      allowed: true,
      remaining: Math.max(limit - 1, 0),
      retryAfter: Math.max(1, Math.ceil(windowMs / 1000)),
      resetAt,
    }
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
      resetAt: current.resetAt,
    }
  }

  current.count += 1
  bucket.set(safeKey, current)

  return {
    allowed: true,
    remaining: Math.max(limit - current.count, 0),
    retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    resetAt: current.resetAt,
  }
}
