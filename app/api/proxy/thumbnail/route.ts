import { getAllPortalVideosAdmin } from '@/lib/server/repositories/portal-content-live'

function extractYouTubeVideoId(value: string) {
  const text = String(value || '').trim()
  if (!text) return null

  const watchMatch = text.match(/[?&]v=([^&]+)/i)
  if (watchMatch) return watchMatch[1]

  const shortMatch = text.match(/youtu\.be\/([^?&/]+)/i)
  if (shortMatch) return shortMatch[1]

  const embedMatch = text.match(/youtube\.com\/embed\/([^?&/]+)/i)
  if (embedMatch) return embedMatch[1]

  return null
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get('videoId')
    if (!videoId) return new Response('Missing videoId', { status: 400 })
    
    const video = (await getAllPortalVideosAdmin()).find((entry) => entry.id === videoId)
    if (!video) return new Response('Video not found', { status: 404 })

    const derivedThumbnailUrl =
      video.thumbnailUrl ||
      (() => {
        const youtubeId = extractYouTubeVideoId(video.sourceUrl) || extractYouTubeVideoId(video.playbackUrl)
        return youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : ''
      })()

    if (!derivedThumbnailUrl) return new Response('Thumbnail not available', { status: 404 })

    const response = await fetch(derivedThumbnailUrl)
    
    if (!response.ok) {
        return new Response('Failed to fetch thumbnail', { status: response.status })
    }
    
    const buffer = await response.arrayBuffer()
    
    return new Response(buffer, {
      headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=86400' }
    })
  } catch (error) {
    console.error('Thumbnail proxy error:', error)
    return new Response('Internal proxy error', { status: 500 })
  }
}
