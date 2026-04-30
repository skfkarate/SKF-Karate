import { NextResponse } from 'next/server'
import { addCategoryLive, getAllCategoriesLive } from '@/lib/server/repositories/categories-live'
import { adminCategoryBodySchema } from '@/src/server/api/validators/admin-general.validator'
import { withRoute } from '@/src/server/lib/route'

export const GET = withRoute(
  { auth: { type: 'admin', roles: ['admin', 'instructor'] }, rateLimit: { tier: 'authed' } },
  async () => {
    return NextResponse.json({ categories: await getAllCategoriesLive() })
  }
)

export const POST = withRoute(
  {
    auth: { type: 'admin', roles: ['admin', 'instructor'] },
    bodySchema: adminCategoryBodySchema,
    rateLimit: { tier: 'write' },
  },
  async ({ body }) => {
    const categories = await addCategoryLive(body.category)
    return NextResponse.json({ success: true, categories })
  }
)
