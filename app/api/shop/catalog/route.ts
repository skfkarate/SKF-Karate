import { NextResponse } from 'next/server'
import { getProducts } from '@/lib/server/repositories/shop'
import { withRoute } from '@/src/server/lib/route'

export const dynamic = 'force-dynamic'

export const GET = withRoute(
  { rateLimit: { tier: 'public' }, cacheControl: 'no-store' },
  async () => {
    const products = await getProducts()
    return NextResponse.json(products, {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  }
)
