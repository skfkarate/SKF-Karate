import { randomUUID } from 'node:crypto'

import { SEEDED_BLOG_POSTS } from '@/data/blogPosts'
import { ApiError } from '@/lib/server/api'
import { isSupabaseReady, supabaseAdmin } from '@/lib/server/supabase'

export type BlogPostStatus = 'draft' | 'published'

export type BlogPost = {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  coverImageUrl: string
  authorName: string
  status: BlogPostStatus
  isFeatured: boolean
  readMinutes: number
  sortOrder: number
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

type BlogPostInput = Partial<BlogPost>

type BlogPostDatabaseRow = {
  id?: string | null
  slug?: string | null
  title?: string | null
  excerpt?: string | null
  content?: string | null
  category?: string | null
  tags?: unknown
  cover_image_url?: string | null
  author_name?: string | null
  status?: string | null
  is_featured?: boolean | null
  read_minutes?: number | string | null
  sort_order?: number | string | null
  published_at?: string | null
  created_at?: string | null
  updated_at?: string | null
}

type DatabaseWriteError = {
  code?: string
  message?: string
}

function cloneBlogData<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function slugify(value: string) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
}

function isMissingBlogTableError(error: unknown) {
  if (!error || typeof error !== 'object') return false
  const code = 'code' in error ? String(error.code || '') : ''
  const message = 'message' in error ? String(error.message || '').toLowerCase() : ''

  return code === 'PGRST205' || code === '42P01' || message.includes('blog_posts')
}

function estimateReadMinutes(content: string) {
  const words = String(content || '').trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 210))
}

function normaliseTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag || '').trim()).filter(Boolean)
  }

  if (typeof value === 'string') {
    return value.split(',').map((tag) => tag.trim()).filter(Boolean)
  }

  return []
}

function normaliseStatus(value: unknown): BlogPostStatus {
  return value === 'draft' ? 'draft' : 'published'
}

function seededPosts(): BlogPost[] {
  const now = '2026-05-03T00:00:00.000Z'

  return SEEDED_BLOG_POSTS.map((post) => ({
    id: `blog_${post.slug}`,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    category: post.category,
    tags: post.tags,
    coverImageUrl: post.coverImageUrl,
    authorName: post.authorName,
    status: 'published',
    isFeatured: post.isFeatured,
    readMinutes: post.readMinutes || estimateReadMinutes(post.content),
    sortOrder: post.sortOrder,
    publishedAt: post.publishedAt,
    createdAt: post.publishedAt || now,
    updatedAt: post.publishedAt || now,
  }))
}

function mapBlogRowToRecord(row: BlogPostDatabaseRow): BlogPost {
  const content = String(row.content || '')

  return {
    id: String(row.id || ''),
    slug: String(row.slug || ''),
    title: String(row.title || ''),
    excerpt: String(row.excerpt || ''),
    content,
    category: String(row.category || 'Karate'),
    tags: normaliseTags(row.tags),
    coverImageUrl: String(row.cover_image_url || ''),
    authorName: String(row.author_name || 'SKF Karate'),
    status: normaliseStatus(row.status),
    isFeatured: Boolean(row.is_featured),
    readMinutes: Number(row.read_minutes || estimateReadMinutes(content)),
    sortOrder: Number(row.sort_order || 999),
    publishedAt: row.published_at || null,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  }
}

function mapBlogRecordToRow(record: BlogPost): Record<string, unknown> {
  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    excerpt: record.excerpt,
    content: record.content,
    category: record.category,
    tags: record.tags,
    cover_image_url: record.coverImageUrl || null,
    author_name: record.authorName || 'SKF Karate',
    status: record.status,
    is_featured: Boolean(record.isFeatured),
    read_minutes: record.readMinutes || estimateReadMinutes(record.content),
    sort_order: record.sortOrder,
    published_at: record.status === 'published'
      ? record.publishedAt || new Date().toISOString()
      : null,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
  }
}

function normaliseBlogPayload(
  input: BlogPostInput = {},
  existing: BlogPost | null = null
): BlogPost {
  const now = new Date().toISOString()
  const title = String(input.title ?? existing?.title ?? '').trim()
  const slug = slugify(String(input.slug ?? existing?.slug ?? title))
  const content = String(input.content ?? existing?.content ?? '').trim()
  const status = normaliseStatus(input.status ?? existing?.status ?? 'draft')

  return {
    id: existing?.id || input.id || `blog_${randomUUID()}`,
    slug,
    title,
    excerpt: String(input.excerpt ?? existing?.excerpt ?? '').trim(),
    content,
    category: String(input.category ?? existing?.category ?? 'Karate').trim() || 'Karate',
    tags: normaliseTags(input.tags ?? existing?.tags),
    coverImageUrl: String(input.coverImageUrl ?? existing?.coverImageUrl ?? '').trim(),
    authorName: String(input.authorName ?? existing?.authorName ?? 'SKF Karate').trim() || 'SKF Karate',
    status,
    isFeatured:
      typeof input.isFeatured === 'boolean'
        ? input.isFeatured
        : existing?.isFeatured ?? false,
    readMinutes: Number(input.readMinutes || existing?.readMinutes || estimateReadMinutes(content)),
    sortOrder: Number(input.sortOrder ?? existing?.sortOrder ?? 999),
    publishedAt:
      status === 'published'
        ? input.publishedAt || existing?.publishedAt || now
        : null,
    createdAt: existing?.createdAt || input.createdAt || now,
    updatedAt: now,
  }
}

function sortBlogPosts(posts: BlogPost[]) {
  return [...posts].sort((a, b) => {
    const featuredDiff = Number(b.isFeatured) - Number(a.isFeatured)
    if (featuredDiff !== 0) return featuredDiff

    const orderDiff = Number(a.sortOrder || 999) - Number(b.sortOrder || 999)
    if (orderDiff !== 0) return orderDiff

    return new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime()
  })
}

async function readAllBlogPostsFromDatabase(): Promise<BlogPost[]> {
  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('published_at', { ascending: false })

  if (error) throw error
  return (data || []).map(mapBlogRowToRecord)
}

async function seedBlogPostsInDatabase(): Promise<BlogPost[]> {
  const seeds = seededPosts()
  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .upsert(seeds.map(mapBlogRecordToRow), { onConflict: 'slug' })
    .select('*')

  if (error) throw error
  return (data || []).map(mapBlogRowToRecord)
}

async function getBlogDataset(): Promise<BlogPost[]> {
  if (!isSupabaseReady()) {
    return cloneBlogData(seededPosts())
  }

  try {
    const posts = await readAllBlogPostsFromDatabase()
    if (posts.length > 0) return posts

    return await seedBlogPostsInDatabase()
  } catch (error) {
    if (!isMissingBlogTableError(error)) {
      console.warn('[blogs-live] Falling back to seeded blog posts:', error)
    }

    return cloneBlogData(seededPosts())
  }
}

async function hasBlogSlugLive(slug: string, excludeId: string | null = null) {
  const normalized = slugify(slug)
  const posts = await getBlogDataset()
  return posts.some((post) => post.slug === normalized && post.id !== excludeId)
}

function handleBlogWriteError(error: DatabaseWriteError): never {
  if (isMissingBlogTableError(error)) {
    throw new ApiError(
      500,
      'Supabase schema is incomplete: missing "blog_posts" table. Run database/migrations/013_blog_posts.sql.'
    )
  }

  if (error?.code === '23505') {
    throw new ApiError(409, 'A blog post with this slug already exists.')
  }

  throw new ApiError(500, error?.message || 'Unable to persist the blog post.')
}

export async function getAllBlogPostsAdminLive() {
  return sortBlogPosts(await getBlogDataset())
}

export async function getPublishedBlogPostsLive() {
  const posts = await getBlogDataset()
  return sortBlogPosts(posts.filter((post) => post.status === 'published'))
}

export async function getBlogPostBySlugLive(slug: string) {
  const normalized = slugify(slug)
  const posts = await getPublishedBlogPostsLive()
  return posts.find((post) => post.slug === normalized) || null
}

export async function getBlogPostByIdAdminLive(id: string) {
  const posts = await getBlogDataset()
  return posts.find((post) => post.id === id) || null
}

export async function createBlogPostLive(input: BlogPostInput) {
  if (!isSupabaseReady()) {
    handleBlogWriteError({ code: 'PGRST205', message: 'blog_posts table is not configured' })
  }

  const post = normaliseBlogPayload(input)
  if (!post.title || !post.slug || !post.content) {
    throw new ApiError(400, 'Title, slug, and content are required.')
  }

  if (await hasBlogSlugLive(post.slug)) {
    throw new ApiError(409, 'A blog post with this slug already exists.')
  }

  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .insert(mapBlogRecordToRow(post))
    .select('*')
    .single()

  if (error) handleBlogWriteError(error)

  return mapBlogRowToRecord(data)
}

export async function updateBlogPostLive(id: string, input: BlogPostInput) {
  if (!isSupabaseReady()) {
    handleBlogWriteError({ code: 'PGRST205', message: 'blog_posts table is not configured' })
  }

  const existing = await getBlogPostByIdAdminLive(id)
  if (!existing) return null

  const post = normaliseBlogPayload(input, existing)
  if (!post.title || !post.slug || !post.content) {
    throw new ApiError(400, 'Title, slug, and content are required.')
  }

  if (await hasBlogSlugLive(post.slug, id)) {
    throw new ApiError(409, 'A blog post with this slug already exists.')
  }

  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .update(mapBlogRecordToRow(post))
    .eq('id', id)
    .select('*')
    .single()

  if (error) handleBlogWriteError(error)

  return mapBlogRowToRecord(data)
}

export async function deleteBlogPostLive(id: string) {
  if (!isSupabaseReady()) {
    handleBlogWriteError({ code: 'PGRST205', message: 'blog_posts table is not configured' })
  }

  const { error } = await supabaseAdmin.from('blog_posts').delete().eq('id', id)
  if (error) handleBlogWriteError(error)

  return true
}
