import { getAllPortalVideosAdmin } from '@/lib/server/repositories/portal-content-live'
import { getYouTubeThumbnailUrl } from '@/lib/youtube'
import { videoIdQuerySchema } from '@/src/server/api/validators/admin-general.validator'
import { NotFoundError, ValidationError } from '@/src/server/lib/errors'
import { withRoute } from '@/src/server/lib/route'

const MAX_THUMBNAIL_BYTES = 2 * 1024 * 1024

function isAllowedThumbnailUrl(value: string) {
  try {
    const parsed = new URL(value)
    if (parsed.protocol !== 'https:') return false

    const allowedHosts = new Set([
      'img.youtube.com',
      'i.ytimg.com',
      'vumbnail.com',
    ])

    const mediaCdnOrigin = process.env.NEXT_PUBLIC_MEDIA_CDN_ORIGIN
    if (mediaCdnOrigin) {
      try {
        allowedHosts.add(new URL(mediaCdnOrigin).hostname)
      } catch {
        // Ignore invalid optional config and keep the stricter allow-list.
      }
    }

    return allowedHosts.has(parsed.hostname)
  } catch {
    return false
  }
}

export const GET = withRoute(
  {
    auth: { type: 'admin', roles: ['admin', 'instructor'] },
    querySchema: videoIdQuerySchema,
    rateLimit: { tier: 'authed' },
    cacheControl: 'public, max-age=86400',
  },
  async ({ query }) => {
    const video = (await getAllPortalVideosAdmin()).find((entry) => entry.id === query.videoId)
    if (!video) throw new NotFoundError('Video')

    const derivedThumbnailUrl = getYouTubeThumbnailUrl(video.youtubeId, 'hqdefault')

    if (!derivedThumbnailUrl) throw new NotFoundError('Thumbnail')
    if (!isAllowedThumbnailUrl(derivedThumbnailUrl)) {
      throw new ValidationError({ thumbnailUrl: ['Thumbnail host not allowed.'] })
    }

    const response = await fetch(derivedThumbnailUrl, {
      signal: AbortSignal.timeout(5000),
    })
    
    if (!response.ok) {
      return new Response('Failed to fetch thumbnail', { status: response.status })
    }

    const contentLength = Number(response.headers.get('content-length') || '0')
    if (contentLength > MAX_THUMBNAIL_BYTES) {
      throw new ValidationError({ thumbnailUrl: ['Thumbnail is too large.'] })
    }
    
    const buffer = await response.arrayBuffer()
    if (buffer.byteLength > MAX_THUMBNAIL_BYTES) {
      throw new ValidationError({ thumbnailUrl: ['Thumbnail is too large.'] })
    }
    
    return new Response(buffer, {
      headers: {
        'Content-Type': response.headers.get('content-type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400',
      }
    })
  }
)
