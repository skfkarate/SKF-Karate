import { NextResponse } from 'next/server'

import {
  createBranchLive,
  createCityLive,
  createSchoolLive,
  deleteBranchLive,
  deleteCityLive,
  deleteSchoolLive,
  getAllCitiesLive,
  getCityBySlugLive,
  updateBranchLive,
  updateCityLive,
  updateSchoolLive,
} from '@/lib/server/repositories/classes-live'
import { revalidateClassesSitePaths } from '@/lib/server/revalidation'
import { adminMutableContentBodySchema } from '@/src/server/api/validators/admin-general.validator'
import { withRoute } from '@/src/server/lib/route'

export const GET = withRoute(
  { auth: { type: 'admin', roles: ['admin', 'instructor'] }, rateLimit: { tier: 'authed' } },
  async () => {
    const cities = await getAllCitiesLive()
    return NextResponse.json({ cities })
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

    let citySlugForRevalidation = String(body?.citySlug || payload?.city || payload?.slug || '').trim()
    let branchSlugForRevalidation = String(body?.branchSlug || payload?.slug || '').trim()

    if (entity === 'city') {
      const targetSlug = String(body?.slug || payload?.slug || '').trim()

      if (operation === 'create') {
        const created = await createCityLive(payload)
        citySlugForRevalidation = created?.slug || citySlugForRevalidation
      } else if (operation === 'update') {
        const existing = targetSlug ? await getCityBySlugLive(targetSlug) : null
        const updated = await updateCityLive(targetSlug, payload)
        if (!updated) {
          return NextResponse.json({ error: 'City not found.' }, { status: 404 })
        }

        if (existing?.slug && existing.slug !== updated.slug) {
          revalidateClassesSitePaths({ citySlug: existing.slug })
        }

        citySlugForRevalidation = updated.slug
      } else if (operation === 'delete') {
        if (targetSlug) {
          revalidateClassesSitePaths({ citySlug: targetSlug })
        }
        await deleteCityLive(targetSlug)
      } else {
        return NextResponse.json({ error: 'Unsupported city operation.' }, { status: 400 })
      }
    } else if (entity === 'branch') {
      const targetSlug = String(body?.slug || payload?.slug || '').trim()

      if (operation === 'create') {
        const created = await createBranchLive(payload)
        citySlugForRevalidation = String(payload?.city || citySlugForRevalidation)
        branchSlugForRevalidation = created?.slug || branchSlugForRevalidation
      } else if (operation === 'update') {
        const currentCitySlug = String(body?.citySlug || '').trim()
        const updated = await updateBranchLive(targetSlug, payload)
        if (!updated) {
          return NextResponse.json({ error: 'Training centre not found.' }, { status: 404 })
        }

        if (currentCitySlug && targetSlug && (currentCitySlug !== updated.city || targetSlug !== updated.slug)) {
          revalidateClassesSitePaths({ citySlug: currentCitySlug, branchSlug: targetSlug })
        }

        citySlugForRevalidation = updated.city
        branchSlugForRevalidation = updated.slug
      } else if (operation === 'delete') {
        const cities = await getAllCitiesLive()
        const existingCity = cities.find((city) =>
          city.branches.some((branch) => branch.slug === targetSlug)
        )

        if (existingCity && targetSlug) {
          revalidateClassesSitePaths({ citySlug: existingCity.slug, branchSlug: targetSlug })
        }

        await deleteBranchLive(targetSlug)
      } else {
        return NextResponse.json({ error: 'Unsupported training centre operation.' }, { status: 400 })
      }
    } else if (entity === 'school') {
      const targetId = String(body?.id || payload?.id || '').trim()

      if (operation === 'create') {
        const created = await createSchoolLive(payload)
        citySlugForRevalidation = String(payload?.city || citySlugForRevalidation)
        void created
      } else if (operation === 'update') {
        const updated = await updateSchoolLive(targetId, payload)
        if (!updated) {
          return NextResponse.json({ error: 'School not found.' }, { status: 404 })
        }
        citySlugForRevalidation = updated.city
      } else if (operation === 'delete') {
        const cities = await getAllCitiesLive()
        const existingCity = cities.find((city) =>
          city.schools.some((school) => school.id === targetId)
        )

        if (existingCity) {
          revalidateClassesSitePaths({ citySlug: existingCity.slug })
        }

        await deleteSchoolLive(targetId)
      } else {
        return NextResponse.json({ error: 'Unsupported school operation.' }, { status: 400 })
      }
    } else {
      return NextResponse.json({ error: 'Unsupported classes entity.' }, { status: 400 })
    }

    revalidateClassesSitePaths({
      citySlug: citySlugForRevalidation || undefined,
      branchSlug: branchSlugForRevalidation || undefined,
    })

    const cities = await getAllCitiesLive()
    return NextResponse.json({ success: true, cities })
  }
)
