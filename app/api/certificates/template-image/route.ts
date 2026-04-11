export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  if (!url) return new Response('Missing url', { status: 400 })
  
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch image')
    
    const buffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/png'
    
    return new Response(buffer, {
      headers: { 
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600'
      }
    })
  } catch (error) {
    console.error('Template image proxy error:', error)
    return new Response('Failed to load template image', { status: 500 })
  }
}
