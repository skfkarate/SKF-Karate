import { NextResponse } from 'next/server'

import {
  createSenseiLive,
  deleteSenseiLive,
  getAllSenseisLive,
  getSenseiByIdLive,
  updateSenseiLive,
} from '@/lib/server/repositories/senseis-live'
import {
  revalidateClassesSitePaths,
  revalidateAthleteSitePaths,
  revalidateSenseiSitePaths,
} from '@/lib/server/revalidation'
import { syncBelowThirdDanSenseiAthletes } from '@/lib/server/sensei-athlete-sync'
import { adminSenseiMutationBodySchema } from '@/src/server/api/validators/admin-general.validator'
import { withRoute } from '@/src/server/lib/route'

export const GET = withRoute(
  { auth: { type: 'admin', roles: ['admin', 'instructor'] }, rateLimit: { tier: 'authed' } },
  async () => {
    const senseis = await getAllSenseisLive()
    return NextResponse.json({ senseis })
  }
)

export const POST = withRoute(
  {
    auth: { type: 'admin', roles: ['admin', 'instructor'] },
    bodySchema: adminSenseiMutationBodySchema,
    rateLimit: { tier: 'write' },
  },
  async ({ body }) => {
    const operation = String(body?.operation || '').trim().toLowerCase()
    const payload = body?.payload || {}
    const targetId = String(body?.id || payload?.id || '').trim()

    let revalidateSlug = ''

    if (operation === 'create') {
      const created = await createSenseiLive(payload)
      revalidateSlug = created?.slug || ''
    } else if (operation === 'update') {
      const updated = await updateSenseiLive(targetId, payload)
      if (!updated) {
        return NextResponse.json({ error: 'Sensei not found.' }, { status: 404 })
      }
      revalidateSlug = updated.slug
    } else if (operation === 'delete') {
      const existing = await getSenseiByIdLive(targetId)
      if (!existing) {
        return NextResponse.json({ error: 'Sensei not found.' }, { status: 404 })
      }
      revalidateSlug = existing.slug
      await deleteSenseiLive(targetId)
    } else {
      return NextResponse.json({ error: 'Unsupported sensei operation.' }, { status: 400 })
    }

    revalidateSenseiSitePaths(revalidateSlug || undefined)
    revalidateClassesSitePaths()
    const athleteSync = await syncBelowThirdDanSenseiAthletes({ revalidate: false })
    for (const registrationNumber of athleteSync.registrationNumbers) {
      revalidateAthleteSitePaths(registrationNumber)
    }

    const senseis = await getAllSenseisLive()
    return NextResponse.json({ success: true, senseis })
  }
)
