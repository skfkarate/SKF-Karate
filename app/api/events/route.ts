import { NextResponse } from 'next/server'
import { getAllEventsLive } from '@/lib/server/repositories/events-live'

/**
 * Public events endpoint — returns all published events (standalone + tournaments).
 * Used by the portal events page and any client-side event consumers.
 */
export async function GET() {
  try {
    const events = await getAllEventsLive()
    return NextResponse.json({ events })
  } catch (error) {
    console.error('[API] Failed to fetch public events:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
