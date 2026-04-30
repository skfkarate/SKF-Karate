export const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/

export function extractYouTubeId(value: string | null | undefined) {
  const text = String(value || '').trim()
  if (!text) return null

  if (YOUTUBE_ID_PATTERN.test(text)) return text

  try {
    const parsed = new URL(text)

    if (parsed.hostname === 'youtu.be') {
      const id = parsed.pathname.split('/').filter(Boolean)[0]
      return id && YOUTUBE_ID_PATTERN.test(id) ? id : null
    }

    const watchId = parsed.searchParams.get('v')
    if (watchId && YOUTUBE_ID_PATTERN.test(watchId)) return watchId

    const pathParts = parsed.pathname.split('/').filter(Boolean)
    const embedIndex = pathParts.findIndex((part) => ['embed', 'shorts', 'live'].includes(part))
    const pathId = embedIndex >= 0 ? pathParts[embedIndex + 1] : null
    if (pathId && YOUTUBE_ID_PATTERN.test(pathId)) return pathId
  } catch {
    const matches = text.match(/[A-Za-z0-9_-]{11}/g) || []
    const id = matches.find((candidate) => YOUTUBE_ID_PATTERN.test(candidate))
    return id || null
  }

  return null
}

export function requireYouTubeId(value: string | null | undefined) {
  const youtubeId = extractYouTubeId(value)
  if (!youtubeId) {
    throw new Error('YouTube video ID must be exactly 11 characters.')
  }
  return youtubeId
}

export function getYouTubeThumbnailUrl(youtubeId: string, quality: 'maxresdefault' | 'hqdefault' = 'maxresdefault') {
  return `https://img.youtube.com/vi/${youtubeId}/${quality}.jpg`
}
