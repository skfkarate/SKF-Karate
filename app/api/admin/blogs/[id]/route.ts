import { NextResponse } from 'next/server'

import {
  deleteBlogPostLive,
  getBlogPostByIdAdminLive,
  updateBlogPostLive,
} from '@/lib/server/repositories/blogs-live'
import { revalidateBlogSitePaths } from '@/lib/server/revalidation'
import { looseObjectSchema } from '@/src/server/api/validators/admin-general.validator'
import { NotFoundError } from '@/src/server/lib/errors'
import { withRoute } from '@/src/server/lib/route'

export const PUT = withRoute(
  {
    auth: { type: 'admin', roles: ['admin', 'instructor'] },
    bodySchema: looseObjectSchema,
    rateLimit: { tier: 'write' },
  },
  async ({ body, params }) => {
    const existing = await getBlogPostByIdAdminLive(params.id)
    if (!existing) throw new NotFoundError('Blog post')

    const post = await updateBlogPostLive(
      params.id,
      body as Parameters<typeof updateBlogPostLive>[1]
    )
    if (!post) throw new NotFoundError('Blog post')

    revalidateBlogSitePaths(existing.slug)
    revalidateBlogSitePaths(post.slug)

    return NextResponse.json({ success: true, post })
  }
)

export const DELETE = withRoute(
  { auth: { type: 'admin', roles: ['admin', 'instructor'] }, rateLimit: { tier: 'write' } },
  async ({ params }) => {
    const existing = await getBlogPostByIdAdminLive(params.id)
    if (!existing) throw new NotFoundError('Blog post')

    await deleteBlogPostLive(params.id)
    revalidateBlogSitePaths(existing.slug)

    return NextResponse.json({ success: true })
  }
)

export const PATCH = PUT
