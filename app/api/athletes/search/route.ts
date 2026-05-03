import { NextResponse } from 'next/server'
import {
  getFeaturedAthleteSearchResultsLive,
  searchAthletesByNameLive,
} from '@/lib/server/repositories/athletes-live'
import { athleteSearchQuerySchema } from '@/src/server/api/validators/admin-general.validator'
import { withRoute } from '@/src/server/lib/route'

export const GET = withRoute(
  {
    querySchema: athleteSearchQuerySchema,
    rateLimit: { tier: 'lookup' },
    cacheControl: 'no-store',
  },
  async ({ query }) => {
  const featured = query.featured === '1'

  if (featured) {
    const results = await getFeaturedAthleteSearchResultsLive(
      query.limit
    )
    return NextResponse.json({ results })
  }

  if (!query.q || query.q.trim().length < 2) {
    return NextResponse.json({ results: [] })
  }

  const results = await searchAthletesByNameLive(query.q.trim())
  return NextResponse.json({ results: results })
  }
)
