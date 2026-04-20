import { NextResponse } from 'next/server'
import { getAllEventsAdmin, createEventRecord } from '@/lib/server/repositories/events'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/server/auth/options'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const events = getAllEventsAdmin()
    return NextResponse.json({ events })
  } catch (error) {
    console.error('[API] Failed to fetch events:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const newEvent = createEventRecord(body)

    return NextResponse.json({ success: true, event: newEvent })
  } catch (error: any) {
    console.error('[API] Failed to create event:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
