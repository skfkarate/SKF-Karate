export const cacheControl = {
  private: 'private, no-cache, no-store, must-revalidate',
  short: 'public, s-maxage=60, stale-while-revalidate=300',
  medium: 'public, s-maxage=3600, stale-while-revalidate=86400',
  long: 'public, s-maxage=86400, stale-while-revalidate=604800',
  forever: 'public, max-age=31536000, immutable',
} as const
