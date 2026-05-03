import { NextResponse } from 'next/server'

import {
  createBlogPostLive,
  getAllBlogPostsAdminLive,
} from '@/lib/server/repositories/blogs-live'
import { revalidateBlogSitePaths } from '@/lib/server/revalidation'
import { looseObjectSchema } from '@/src/server/api/validators/admin-general.validator'
import { withRoute } from '@/src/server/lib/route'

export const GET = withRoute(
  { auth: { type: 'admin', roles: ['admin', 'instructor'] }, rateLimit: { tier: 'authed' } },
  async () => {
    const posts = await getAllBlogPostsAdminLive()
    return NextResponse.json({ posts })
  }
)

export const POST = withRoute(
  {
    auth: { type: 'admin', roles: ['admin', 'instructor'] },
    bodySchema: looseObjectSchema,
    rateLimit: { tier: 'write' },
  },
  async ({ body }) => {
    const post = await createBlogPostLive(body as Parameters<typeof createBlogPostLive>[0])
    revalidateBlogSitePaths(post.slug)
    return NextResponse.json({ success: true, post }, { status: 201 })
  }
)
