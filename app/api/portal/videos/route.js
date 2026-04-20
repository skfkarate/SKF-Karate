import { NextResponse } from 'next/server'
import { getPortalSession } from '@/lib/server/auth_legacy'
import { getVideosByBranchAndBatch } from '@/lib/server/sheets'

export async function GET(request) {
  try {
    // 1. Authenticate Student Session
    const session = getPortalSession(request)
    if (!session || !session.skfId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use branch and batch from JWT if available
    const branch = session.branch || request.nextUrl.searchParams.get('branch')
    const batch = session.batch || request.nextUrl.searchParams.get('batch')

    if (!branch) {
      return NextResponse.json({ error: 'Branch is required to fetch videos' }, { status: 400 })
    }

    // 2. Fetch accessible videos
    const videos = await getVideosByBranchAndBatch(branch, batch)

    return NextResponse.json({ videos })
  } catch (error) {
    console.error('[API] Video fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
  }
}
