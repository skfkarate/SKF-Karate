import { requireRole } from '@/lib/server/requireRole'
import { getVideosByBranchAndBatch, getVideoUrlById } from '@/lib/server/sheets'

export async function GET(request: Request, props: { params: Promise<{ videoId: string }> }) {
  const params = await props.params
  try {
    const jwt = await requireRole(['student'])
    
    // Verify this video is accessible to this student
    const videos = await getVideosByBranchAndBatch(jwt.branch!, jwt.batch!)
    const video = videos.find(v => v.videoId === params.videoId)
    if (!video) return Response.json({ error: 'Video not found or not accessible' }, { status: 403 })
    
    // Get the raw YouTube URL server-side ONLY
    const youtubeUrl = await getVideoUrlById(params.videoId)
    if (!youtubeUrl) return Response.json({ error: 'Video URL not found' }, { status: 404 })
    
    // Extract YouTube video ID and return ONLY the embed URL
    const youtubeIdMatch = youtubeUrl.match(/(?:v=|youtu\.be\/)([^&\s]+)/)
    if (!youtubeIdMatch) return Response.json({ error: 'Invalid video URL' }, { status: 500 })
    
    // modestbranding and rel=0 for premium feel
    const embedUrl = `https://www.youtube.com/embed/${youtubeIdMatch[1]}?rel=0&modestbranding=1&enablejsapi=1`
    
    return Response.json({ embedUrl })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return Response.json({ error: 'Unauthorized' }, { status: 401 })
    console.error('GET embed error:', error)
    return Response.json({ error: 'Failed to generate embed URL' }, { status: 500 })
  }
}
