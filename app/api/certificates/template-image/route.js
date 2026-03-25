import { NextResponse } from 'next/server'

/**
 * GET /api/certificates/template-image
 * Proxies a remote image URL to avoid CORS taint on the HTML Canvas.
 * Usage: /api/certificates/template-image?url=https://example.com/image.png
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return new NextResponse('Missing URL parameter', { status: 400 })
  }

  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      return new NextResponse(`Failed to fetch image: ${response.status}`, { status: response.status })
    }

    const contentType = response.headers.get('content-type')
    const arrayBuffer = await response.arrayBuffer()
    
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': contentType || 'image/png',
        'Cache-Control': 'public, max-age=86400', // Cache for a day
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (error) {
    console.error('[Template Proxy Error]', error)
    return new NextResponse('Internal Server Error fetching template image', { status: 500 })
  }
}
