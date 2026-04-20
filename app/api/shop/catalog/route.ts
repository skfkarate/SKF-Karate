import { NextResponse } from 'next/server'
import { getProducts } from '@/lib/server/repositories/products'

export async function GET() {
    try {
        const products = await getProducts()
        return NextResponse.json(products)
    } catch (e) {
        return NextResponse.json([], { status: 500 })
    }
}
