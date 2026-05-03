import BlogAdminClient from './BlogAdminClient'
import { getAllBlogPostsAdminLive } from '@/lib/server/repositories/blogs-live'
import { requireAdminSession } from '@/lib/utils/auth'
import './blog-admin.css'

export default async function AdminBlogsPage() {
  await requireAdminSession(['admin', 'instructor'])
  const posts = await getAllBlogPostsAdminLive()

  return <BlogAdminClient initialPosts={posts} />
}
