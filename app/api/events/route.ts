import { NextResponse } from 'next/server'
import { getAllEvents } from '@/lib/server/repositories/events'

/**
 * Public events endpoint — returns all published events (standalone + tournaments).
 * Used by the portal events page and any client-side event consumers.
 */
export async function GET() {
  try {
    const events = getAllEvents()
    return NextResponse.json({ events })
  } catch (error) {
    console.error('[API] Failed to fetch public events:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
