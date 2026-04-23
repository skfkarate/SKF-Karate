import { NextResponse } from 'next/server'
import { addCategoryLive, getAllCategoriesLive } from '@/lib/server/repositories/categories-live'
import { getAuthorizedApiSession } from '@/lib/server/auth/session'

export async function GET() {
  try {
    return NextResponse.json({ categories: await getAllCategoriesLive() })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthorizedApiSession(['admin', 'instructor'])
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { category } = await request.json()
    if (!category) {
      return NextResponse.json({ error: 'Category string is required' }, { status: 400 })
    }

    const categories = await addCategoryLive(category)
    return NextResponse.json({ success: true, categories })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
