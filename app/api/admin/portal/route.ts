import { NextResponse } from 'next/server'

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
import { adminMutableContentBodySchema } from '@/src/server/api/validators/admin-general.validator'
import { withRoute } from '@/src/server/lib/route'

export const GET = withRoute(
  { auth: { type: 'admin', roles: ['admin', 'instructor'] }, rateLimit: { tier: 'authed' } },
  async () => {
    const [videos, timetables] = await Promise.all([
      getAllPortalVideosAdmin(),
      getAllBranchTimetablesAdmin(),
    ])

    return NextResponse.json({ videos, timetables })
  }
)

export const POST = withRoute(
  {
    auth: { type: 'admin', roles: ['admin', 'instructor'] },
    bodySchema: adminMutableContentBodySchema,
    rateLimit: { tier: 'write' },
  },
  async ({ body }) => {
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
  }
)
