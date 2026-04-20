import { NextResponse } from 'next/server'
import { getAllAthletes } from '@/lib/server/repositories/athletes'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/server/auth/options'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.toLowerCase() || ''

    let athletes = getAllAthletes()

    if (q) {
      athletes = athletes.filter((a: any) => 
        a.firstName.toLowerCase().includes(q) || 
        a.lastName.toLowerCase().includes(q) ||
        a.registrationNumber.toLowerCase().includes(q)
      )
    }

    // Return limited dataset for assignment search
    const results = athletes.map((a: any) => ({
      id: a.id,
      registrationNumber: a.registrationNumber,
      firstName: a.firstName,
      lastName: a.lastName,
      branchName: a.branchName,
      currentBelt: a.currentBelt,
      photoUrl: a.photoUrl
    })).slice(0, 50)

    return NextResponse.json({ athletes: results })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
