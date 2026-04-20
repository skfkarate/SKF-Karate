import { supabaseAdmin, isSupabaseReady } from '../supabase'
import { products as seedProducts } from '@/data/seed/products'

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
 * If the table does not exist yet (or Supabase fails), falls back to seed data.
 */
export async function getProducts(): Promise<AdminProduct[]> {
    if (!isSupabaseReady()) {
        return fallbackMapping(seedProducts);
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('skf_products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error || !data || data.length === 0) {
            // Probably table doesn't exist or is empty
            return fallbackMapping(seedProducts);
        }

        return data as AdminProduct[];
    } catch (e) {
        console.warn('[Products/DB] Failed to fetch from Supabase, returning Seed data fallback.');
        return fallbackMapping(seedProducts);
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
            console.error('[Products/DB] Error upserting product:', error);
            return false;
        }
        return true;
    } catch (e) {
        console.error('[Products/DB] Exception in upsert:', e);
        return false;
    }
}

// Map the old ts seed schema to the new robust DB schema
function fallbackMapping(oldItems: any[]): AdminProduct[] {
    return oldItems.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        category: p.category,
        price: p.price,
        images: p.images,
        variants: p.variants,
        rating: p.rating,
        review_count: p.reviewCount, // Note: camelCase to snake_case
        // Convert old 'requiresTier' to 'requires_belt' for fallback Demo purposes
        requires_belt: p.requiresTier === 'silver' ? 'Brown' : undefined,
        // Assume all legacy are public for now until Admin explicitly restricts
        is_public: p.requiresTier ? false : true 
    }))
}
