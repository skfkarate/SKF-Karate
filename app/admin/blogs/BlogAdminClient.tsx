'use client'

import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight,
  Eye,
  FileText,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from 'lucide-react'

import type { BlogPost } from '@/lib/server/repositories/blogs-live'

type BlogFormState = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  tags: string
  coverImageUrl: string
  authorName: string
  status: 'draft' | 'published'
  isFeatured: boolean
  readMinutes: number
  sortOrder: number
}

type BlogAdminClientProps = {
  initialPosts: BlogPost[]
}

const EMPTY_FORM: BlogFormState = {
  id: '',
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category: 'Karate',
  tags: '',
  coverImageUrl: '/gallery/Training.jpeg',
  authorName: 'SKF Karate',
  status: 'published',
  isFeatured: false,
  readMinutes: 3,
  sortOrder: 999,
}

function slugify(value: string) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function postToForm(post: BlogPost): BlogFormState {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    category: post.category,
    tags: post.tags.join(', '),
    coverImageUrl: post.coverImageUrl,
    authorName: post.authorName,
    status: post.status,
    isFeatured: post.isFeatured,
    readMinutes: post.readMinutes,
    sortOrder: post.sortOrder,
  }
}

function getErrorMessage(data: unknown, fallback: string) {
  if (data && typeof data === 'object') {
    if ('error' in data) {
      const error = data.error
      if (typeof error === 'string') return error
      if (error && typeof error === 'object' && 'message' in error) {
        return String(error.message || fallback)
      }
    }
  }

  return fallback
}

export default function BlogAdminClient({ initialPosts }: BlogAdminClientProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [form, setForm] = useState<BlogFormState>(EMPTY_FORM)
  const [query, setQuery] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const editing = Boolean(form.id)

  const summary = useMemo(() => {
    return {
      total: posts.length,
      published: posts.filter((post) => post.status === 'published').length,
      featured: posts.filter((post) => post.isFeatured).length,
      drafts: posts.filter((post) => post.status === 'draft').length,
    }
  }, [posts])

  const filteredPosts = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return posts

    return posts.filter((post) => {
      return [
        post.title,
        post.slug,
        post.category,
        post.excerpt,
        post.tags.join(' '),
      ].join(' ').toLowerCase().includes(normalized)
    })
  }, [posts, query])

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setError('')
  }

  const updateForm = <K extends keyof BlogFormState>(key: K, value: BlogFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const savePost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    const payload = {
      title: form.title,
      slug: form.slug || slugify(form.title),
      excerpt: form.excerpt,
      content: form.content,
      category: form.category,
      tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      coverImageUrl: form.coverImageUrl,
      authorName: form.authorName,
      status: form.status,
      isFeatured: form.isFeatured,
      readMinutes: Number(form.readMinutes || 1),
      sortOrder: Number(form.sortOrder || 999),
    }

    try {
      const res = await fetch(editing ? `/api/admin/blogs/${form.id}` : '/api/admin/blogs', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(getErrorMessage(data, 'Unable to save blog post.'))
      }

      const savedPost = data.post as BlogPost
      setPosts((current) => {
        const withoutCurrent = current.filter((post) => post.id !== savedPost.id)
        return [savedPost, ...withoutCurrent].sort((a, b) => a.sortOrder - b.sortOrder)
      })
      setMessage(editing ? 'Blog post updated.' : 'Blog post created.')
      setForm(postToForm(savedPost))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save blog post.')
    } finally {
      setSaving(false)
    }
  }

  const deletePost = async (post: BlogPost) => {
    if (!confirm(`Delete "${post.title}"?`)) return

    setMessage('')
    setError('')

    try {
      const res = await fetch(`/api/admin/blogs/${post.id}`, { method: 'DELETE' })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(getErrorMessage(data, 'Unable to delete blog post.'))
      }

      setPosts((current) => current.filter((entry) => entry.id !== post.id))
      if (form.id === post.id) resetForm()
      setMessage('Blog post deleted.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete blog post.')
    }
  }

  return (
    <div className="admin-blog">
      <header className="admin-blog__header">
        <div>
          <span className="admin-blog__eyebrow">
            <FileText size={15} />
            Blog Studio
          </span>
          <h1>Blogs</h1>
          <p>Publish and maintain the public karate guide blocks shown on the blog page.</p>
        </div>

        <Link href="/blog" target="_blank" className="admin-blog__public-link">
          Public page <ArrowUpRight size={16} />
        </Link>
      </header>

      <section className="admin-blog__stats" aria-label="Blog summary">
        <div>
          <strong>{summary.total}</strong>
          <span>Total</span>
        </div>
        <div>
          <strong>{summary.published}</strong>
          <span>Published</span>
        </div>
        <div>
          <strong>{summary.featured}</strong>
          <span>Featured</span>
        </div>
        <div>
          <strong>{summary.drafts}</strong>
          <span>Drafts</span>
        </div>
      </section>

      {message ? <div className="admin-blog__notice">{message}</div> : null}
      {error ? <div className="admin-blog__error">{error}</div> : null}

      <div className="admin-blog__layout">
        <section className="admin-blog__panel">
          <div className="admin-blog__panel-head">
            <div>
              <h2>{editing ? 'Edit guide' : 'Create guide'}</h2>
              <p>{editing ? form.slug : 'New posts publish to the public blog after saving.'}</p>
            </div>
            {editing ? (
              <button type="button" className="admin-blog__ghost" onClick={resetForm}>
                <X size={15} />
                Clear
              </button>
            ) : (
              <span className="admin-blog__ghost-label">
                <Plus size={15} />
                New
              </span>
            )}
          </div>

          <form className="admin-blog__form" onSubmit={savePost}>
            <label>
              Title
              <input
                value={form.title}
                onChange={(event) => {
                  const title = event.target.value
                  updateForm('title', title)
                  if (!editing && !form.slug) updateForm('slug', slugify(title))
                }}
                required
              />
            </label>

            <div className="admin-blog__form-grid">
              <label>
                Slug
                <input
                  value={form.slug}
                  onChange={(event) => updateForm('slug', slugify(event.target.value))}
                  required
                />
              </label>
              <label>
                Category
                <input
                  value={form.category}
                  onChange={(event) => updateForm('category', event.target.value)}
                  required
                />
              </label>
            </div>

            <label>
              Excerpt
              <textarea
                value={form.excerpt}
                onChange={(event) => updateForm('excerpt', event.target.value)}
                rows={3}
                required
              />
            </label>

            <label>
              Content
              <textarea
                value={form.content}
                onChange={(event) => updateForm('content', event.target.value)}
                rows={14}
                required
              />
            </label>

            <div className="admin-blog__form-grid">
              <label>
                Cover image path
                <input
                  value={form.coverImageUrl}
                  onChange={(event) => updateForm('coverImageUrl', event.target.value)}
                />
              </label>
              <label>
                Author
                <input
                  value={form.authorName}
                  onChange={(event) => updateForm('authorName', event.target.value)}
                />
              </label>
            </div>

            <label>
              Tags
              <input
                value={form.tags}
                onChange={(event) => updateForm('tags', event.target.value)}
                placeholder="beginner, belts, kata"
              />
            </label>

            <div className="admin-blog__form-grid admin-blog__form-grid--thirds">
              <label>
                Status
                <select
                  value={form.status}
                  onChange={(event) => updateForm('status', event.target.value as BlogFormState['status'])}
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </label>
              <label>
                Read minutes
                <input
                  type="number"
                  min={1}
                  value={form.readMinutes}
                  onChange={(event) => updateForm('readMinutes', Number(event.target.value))}
                />
              </label>
              <label>
                Sort order
                <input
                  type="number"
                  min={1}
                  value={form.sortOrder}
                  onChange={(event) => updateForm('sortOrder', Number(event.target.value))}
                />
              </label>
            </div>

            <label className="admin-blog__check">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(event) => updateForm('isFeatured', event.target.checked)}
              />
              Featured on blog hero
            </label>

            <button className="admin-blog__save" type="submit" disabled={saving}>
              <Save size={16} />
              {saving ? 'Saving...' : editing ? 'Save changes' : 'Create post'}
            </button>
          </form>
        </section>

        <section className="admin-blog__panel admin-blog__panel--list">
          <div className="admin-blog__search">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title, category, slug..."
            />
          </div>

          <div className="admin-blog__list">
            {filteredPosts.map((post) => (
              <article key={post.id} className="admin-blog__row">
                <div>
                  <div className="admin-blog__row-meta">
                    <span>{post.category}</span>
                    <span>{post.status}</span>
                    {post.isFeatured ? <span>Featured</span> : null}
                  </div>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                </div>

                <div className="admin-blog__row-actions">
                  <Link href={`/blog/${post.slug}`} target="_blank" aria-label={`Preview ${post.title}`}>
                    <Eye size={16} />
                  </Link>
                  <button type="button" onClick={() => setForm(postToForm(post))} aria-label={`Edit ${post.title}`}>
                    <Pencil size={16} />
                  </button>
                  <button type="button" onClick={() => void deletePost(post)} aria-label={`Delete ${post.title}`}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}

            {filteredPosts.length === 0 ? (
              <div className="admin-blog__empty">No blog posts match the current search.</div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  )
}
