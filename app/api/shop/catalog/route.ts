import { NextResponse } from 'next/server'
import { getProducts } from '@/lib/server/repositories/shop'
import { withRoute } from '@/src/server/lib/route'

export const dynamic = 'force-dynamic'

export const GET = withRoute(
  { rateLimit: { tier: 'public' }, cacheControl: 'no-store' },
  async () => {
    // Temporarily returning empty catalog — shop products will be added later
    // To restore: const products = await getProducts()
    return NextResponse.json([], {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  }
)
