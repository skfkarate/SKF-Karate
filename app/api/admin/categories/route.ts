import { NextResponse } from 'next/server'
import { getAllCategories, addCategory } from '@/lib/server/repositories/categories'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/server/auth/options'

export async function GET() {
  try {
    return NextResponse.json({ categories: getAllCategories() })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { category } = await request.json()
    if (!category) {
      return NextResponse.json({ error: 'Category string is required' }, { status: 400 })
    }

    const categories = addCategory(category)
    return NextResponse.json({ success: true, categories })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
