import { NextResponse } from 'next/server'

import { getPortalSession } from '@/lib/server/auth_legacy'
import { getAthleteByRegistrationNumberLive } from '@/lib/server/repositories/athletes-live'
import { getPortalVideosForAthlete } from '@/lib/server/repositories/portal-content-live'

export async function GET(request) {
  try {
    const session = getPortalSession(request)
    if (!session || !session.skfId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const athlete = await getAthleteByRegistrationNumberLive(session.skfId)
    if (!athlete) {
      return NextResponse.json({ error: 'Athlete not found' }, { status: 404 })
    }

    const videos = await getPortalVideosForAthlete({
      branchName: athlete.branchName || session.branch || '',
      batch: athlete.batch || session.batch || '',
      belt: athlete.currentBelt || session.belt || '',
    })

    return NextResponse.json({ videos })
  } catch (error) {
    console.error('[API] Video fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
  }
}
