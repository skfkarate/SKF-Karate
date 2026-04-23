import { NextResponse } from 'next/server'
import { getAllAthletesLive } from '@/lib/server/repositories/athletes-live'
import { getAuthorizedApiSession } from '@/lib/server/auth/session'

export async function GET(request: Request) {
  try {
    const session = await getAuthorizedApiSession(['admin', 'instructor'])
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.toLowerCase() || ''

    let athletes = await getAllAthletesLive()

    if (q) {
      athletes = athletes.filter((a: any) => 
        a.firstName.toLowerCase().includes(q) || 
        a.lastName.toLowerCase().includes(q) ||
        a.registrationNumber.toLowerCase().includes(q)
      )
    }

    athletes = athletes
      .filter((a: any) => String(a.status || '').toLowerCase() !== 'inactive')
      .sort((a: any, b: any) =>
        `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
      )

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
