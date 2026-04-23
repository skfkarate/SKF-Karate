import { NextResponse } from 'next/server'

import { getAthleteByRegistrationNumberLive } from '@/lib/server/repositories/athletes-live'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const skfId = searchParams.get('skfId')

    if (!skfId) {
      return NextResponse.json({ success: false, error: 'skfId parameter is required' }, { status: 400 })
    }

    const athlete = await getAthleteByRegistrationNumberLive(skfId.trim().toUpperCase())

    if (!athlete) {
      return NextResponse.json({ success: false, error: 'Athlete not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      student: {
        name: [athlete.firstName, athlete.lastName].filter(Boolean).join(' ').trim(),
        parent: athlete.parentName || '',
        phone: athlete.phone || '',
        branch: athlete.branchName || '',
        batch: athlete.batch || '',
      },
    })
  } catch (error) {
    console.error('Lookup student error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
