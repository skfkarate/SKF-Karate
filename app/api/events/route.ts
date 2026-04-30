import { NextResponse } from 'next/server'
import { getAllEventsLive } from '@/lib/server/repositories/events-live'
import { withRoute } from '@/src/server/lib/route'

/**
 * Public events endpoint — returns all published events (standalone + tournaments).
 * Used by the portal events page and any client-side event consumers.
 */
export const GET = withRoute(
  { rateLimit: { tier: 'public' }, cacheControl: 'public, max-age=300' },
  async () => {
    const events = await getAllEventsLive()
    return NextResponse.json({ events })
  }
)
