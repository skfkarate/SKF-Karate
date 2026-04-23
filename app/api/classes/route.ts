import { NextResponse } from 'next/server'

import { getAllCitiesLive } from '@/lib/server/repositories/classes-live'

export async function GET() {
  try {
    const cities = await getAllCitiesLive()
    return NextResponse.json({ cities })
  } catch (error) {
    console.error('[API] Failed to fetch classes:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
