-- Supabase-backed blog posts for the public /blog page and admin Blog Studio.
-- Initial article rows are seeded by the application repository when this table is empty.

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Karate',
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  cover_image_url TEXT,
  author_name TEXT NOT NULL DEFAULT 'SKF Karate',
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published')),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  read_minutes INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 999,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_status_sort
  ON public.blog_posts(status, sort_order, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured
  ON public.blog_posts(is_featured, status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category
  ON public.blog_posts(category);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_published_blog_posts" ON public.blog_posts;

CREATE POLICY "public_read_published_blog_posts" ON public.blog_posts
  FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "service_role_full_blog_posts" ON public.blog_posts;

CREATE POLICY "service_role_full_blog_posts" ON public.blog_posts
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
