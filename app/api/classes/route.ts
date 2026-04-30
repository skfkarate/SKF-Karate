import { NextResponse } from 'next/server'

import { getAllCitiesLive } from '@/lib/server/repositories/classes-live'
import { withRoute } from '@/src/server/lib/route'

export const GET = withRoute(
  { rateLimit: { tier: 'public' }, cacheControl: 'public, max-age=300' },
  async () => {
    const cities = await getAllCitiesLive()
    return NextResponse.json({ cities })
  }
)
