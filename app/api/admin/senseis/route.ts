import { NextResponse } from 'next/server'

import { createErrorResponse, readJsonBody } from '@/lib/server/api'
import { getAuthorizedApiSession } from '@/lib/server/auth/session'
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

export async function GET() {
  try {
    const session = await getAuthorizedApiSession(['admin', 'instructor'])
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const senseis = await getAllSenseisLive()
    return NextResponse.json({ senseis })
  } catch (error) {
    return createErrorResponse(error, 'Unable to fetch senseis.')
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthorizedApiSession(['admin', 'instructor'])
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await readJsonBody(request)
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
  } catch (error) {
    return createErrorResponse(error, 'Unable to update senseis.')
  }
}
