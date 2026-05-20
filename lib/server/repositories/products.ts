import { supabaseAdmin, isSupabaseReady } from '../supabase'
import { logger } from '@/src/server/lib/logger'

export interface ProductVariant {
  id: string
  size: string
  stock: number
  requiresApproval?: boolean
}

export interface AdminProduct {
  id: string
  name: string
  description: string
  category: 'uniforms' | 'belts' | 'gear' | 'merchandise'
  price: number
  images: string[]
  variants: ProductVariant[]
  rating: number
  review_count: number
  requires_belt?: string
  is_public: boolean
  created_at?: string
}

/**
 * Fetches products from Supabase 'skf_products'.
 * The live shop should only show products that exist in the database.
 */
export async function getProducts(): Promise<AdminProduct[]> {
    if (!isSupabaseReady()) {
        return [];
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('skf_products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error || !data) {
            logger.error('products.fetch_failed', { error });
            return [];
        }

        return data as AdminProduct[];
    } catch (error) {
        logger.warn('products.fetch_unexpected_failed', { error });
        return [];
    }
}

export async function upsertProduct(product: AdminProduct): Promise<boolean> {
    if (!isSupabaseReady()) return false;

    try {
        const { error } = await supabaseAdmin
            .from('skf_products')
            .upsert({
                id: product.id,
                name: product.name,
                description: product.description,
                category: product.category,
                price: product.price,
                images: product.images,
                variants: product.variants,
                rating: product.rating || 0,
                review_count: product.review_count || 0,
                requires_belt: product.requires_belt || null,
                is_public: typeof product.is_public === 'boolean' ? product.is_public : false,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' });

        if (error) {
            logger.error('products.upsert_failed', { error });
            return false;
        }
        return true;
    } catch (e) {
        logger.error('products.upsert_unexpected_failed', { error: e });
        return false;
    }
}
