import { NextResponse } from 'next/server'

import { createErrorResponse, readJsonBody } from '@/lib/server/api'
import { getAuthorizedApiSession } from '@/lib/server/auth/session'
import {
  createBranchTimetable,
  createPortalVideo,
  deleteBranchTimetable,
  deletePortalVideo,
  getAllBranchTimetablesAdmin,
  getAllPortalVideosAdmin,
  updateBranchTimetable,
  updatePortalVideo,
} from '@/lib/server/repositories/portal-content-live'
import { revalidatePortalSitePaths } from '@/lib/server/revalidation'

export async function GET() {
  try {
    const session = await getAuthorizedApiSession(['admin', 'instructor'])
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [videos, timetables] = await Promise.all([
      getAllPortalVideosAdmin(),
      getAllBranchTimetablesAdmin(),
    ])

    return NextResponse.json({ videos, timetables })
  } catch (error) {
    return createErrorResponse(error, 'Unable to fetch portal content.')
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthorizedApiSession(['admin', 'instructor'])
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await readJsonBody(request)
    const entity = String(body?.entity || '').trim().toLowerCase()
    const operation = String(body?.operation || '').trim().toLowerCase()
    const payload = body?.payload || {}
    const targetId = String(body?.id || payload?.id || '').trim()

    if (entity === 'video') {
      if (operation === 'create') {
        await createPortalVideo(payload)
      } else if (operation === 'update') {
        await updatePortalVideo(targetId, payload)
      } else if (operation === 'delete') {
        await deletePortalVideo(targetId)
      } else {
        return NextResponse.json({ error: 'Unsupported portal video operation.' }, { status: 400 })
      }
    } else if (entity === 'timetable') {
      if (operation === 'create') {
        await createBranchTimetable(payload)
      } else if (operation === 'update') {
        await updateBranchTimetable(targetId, payload)
      } else if (operation === 'delete') {
        await deleteBranchTimetable(targetId)
      } else {
        return NextResponse.json({ error: 'Unsupported timetable operation.' }, { status: 400 })
      }
    } else {
      return NextResponse.json({ error: 'Unsupported portal content entity.' }, { status: 400 })
    }

    revalidatePortalSitePaths()

    const [videos, timetables] = await Promise.all([
      getAllPortalVideosAdmin(),
      getAllBranchTimetablesAdmin(),
    ])

    return NextResponse.json({ success: true, videos, timetables })
  } catch (error) {
    return createErrorResponse(error, 'Unable to update portal content.')
  }
}
