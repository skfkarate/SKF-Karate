import { EVENT_TYPES_LIST } from '@/data/constants/categories'

import { ApiError } from '../api'
import { isSupabaseReady, supabaseAdmin } from '../supabase'
import { addCategory, getAllCategories } from './categories'
import { logger } from '@/src/server/lib/logger'
import { cache } from 'react'

const DEFAULT_CATEGORIES = [...EVENT_TYPES_LIST]

function normaliseCategory(category: string) {
  return category.trim().toLowerCase().replace(/\s+/g, '-')
}

function labeliseCategory(slug: string) {
  return slug
    .split('-')
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(' ')
}

export const getAllCategoriesLive = cache(async function getAllCategoriesLive() {
  if (!isSupabaseReady()) {
    return getAllCategories()
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('event_categories')
      .select('slug')
      .order('slug', { ascending: true })

    if (error) {
      throw error
    }

    const categories = (data || []).map((entry) => entry.slug).filter(Boolean)
    return categories.length > 0 ? categories : [...DEFAULT_CATEGORIES]
  } catch (error) {
    logger.warn('categories_live.local_fallback', { error })
    return getAllCategories()
  }
})

export async function addCategoryLive(category: string) {
  if (!isSupabaseReady()) {
    return addCategory(category)
  }

  const slug = normaliseCategory(category)
  if (!slug) {
    return getAllCategoriesLive()
  }

  const { error } = await supabaseAdmin
    .from('event_categories')
    .upsert(
      {
        slug,
        label: labeliseCategory(slug),
      },
      { onConflict: 'slug' }
    )

  if (error) {
    if (error.code === 'PGRST205') {
      throw new ApiError(
        500,
        'Supabase schema is incomplete: missing "event_categories" table. Run database/schema.sql in the connected Supabase project.'
      )
    }

    throw error
  }

  return getAllCategoriesLive()
}
