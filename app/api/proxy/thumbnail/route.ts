import { getVideoUrlById } from '@/lib/server/sheets'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get('videoId')
    if (!videoId) return new Response('Missing videoId', { status: 400 })
    
    // Verify the videoId belongs to a real video in the sheet (prevent abuse)
    const youtubeUrl = await getVideoUrlById(videoId)
    if (!youtubeUrl) return new Response('Video not found', { status: 404 })

    // Extract the YouTube native ID
    const youtubeIdMatch = youtubeUrl.match(/(?:v=|youtu\.be\/)([^&\s]+)/)
    if (!youtubeIdMatch) return new Response('Invalid video URL mapping', { status: 500 })

    const thumbUrl = `https://img.youtube.com/vi/${youtubeIdMatch[1]}/hqdefault.jpg`
    const response = await fetch(thumbUrl)
    
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
