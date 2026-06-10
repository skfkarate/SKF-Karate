import { unstable_cache } from 'next/cache'
import { getProducts } from '@/lib/server/repositories/shop'
import { SHOP_PRODUCTS_CACHE_TAG } from '@/lib/shop/cache'
import ShopListingClient from '../ShopListingClient'
import '../shop.css'

// Cache the initial catalog so /shop opens with products already rendered and avoids repeated live DB reads.
const getCachedShopProducts = unstable_cache(
  async () => getProducts(),
  [SHOP_PRODUCTS_CACHE_TAG],
  {
    revalidate: 300,
    tags: [SHOP_PRODUCTS_CACHE_TAG],
  }
)

export default async function ShopListingPage() {
  const products = await getCachedShopProducts()

  return <ShopListingClient products={products} />
}
