import { NextResponse } from 'next/server'
import { createEventRecordLive, getAllEventsAdminLive } from '@/lib/server/repositories/events-live'
import { getAuthorizedApiSession } from '@/lib/server/auth/session'
import {
  createErrorResponse,
  readJsonBody,
} from '@/lib/server/api'
import {
  validateEventPayload,
  validateTournamentPayload,
} from '@/lib/server/validation'
import {
  revalidateEventSitePaths,
  revalidateTournamentSitePaths,
} from '@/lib/server/revalidation'

export async function GET(request: Request) {
  try {
    const session = await getAuthorizedApiSession(['admin', 'instructor'])
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const events = await getAllEventsAdminLive()
    return NextResponse.json({ events })
  } catch (error) {
    return createErrorResponse(error, 'Unable to fetch events.')
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthorizedApiSession(['admin', 'instructor'])
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await readJsonBody(request)
    const payload =
      body?.type === 'tournament'
        ? { ...validateTournamentPayload(body), type: 'tournament' }
        : validateEventPayload(body)
    const newEvent = await createEventRecordLive(payload)

    if (newEvent.type === 'tournament') {
      revalidateTournamentSitePaths(newEvent)
    } else {
      revalidateEventSitePaths(newEvent)
    }

    return NextResponse.json({ success: true, event: newEvent }, { status: 201 })
  } catch (error) {
    return createErrorResponse(error, 'Unable to create the event.')
  }
}
