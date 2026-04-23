import { NextResponse } from 'next/server'
import { getProducts } from '@/lib/server/repositories/shop'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const products = await getProducts()
    return NextResponse.json(products, {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('[Shop/Catalog] Failed to fetch catalog:', error)
    return NextResponse.json([], { status: 500 })
  }
}
