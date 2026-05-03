import { NextResponse } from 'next/server'
import { getAllAthletesLive } from '@/lib/server/repositories/athletes-live'
import { adminSearchQuerySchema } from '@/src/server/api/validators/admin-general.validator'
import { withRoute } from '@/src/server/lib/route'

type AdminAthleteSearchRow = {
  id: string
  skfId: string
  firstName: string
  lastName: string
  branchName?: string
  currentBelt?: string
  photoUrl?: string
  status?: string
}

export const GET = withRoute(
  {
    auth: { type: 'admin', roles: ['admin', 'instructor'] },
    querySchema: adminSearchQuerySchema,
    rateLimit: { tier: 'authed' },
  },
  async ({ query }) => {
    const q = query.q?.toLowerCase() || ''

    let athletes = (await getAllAthletesLive()) as AdminAthleteSearchRow[]

    if (q) {
      athletes = athletes.filter((a) =>
        a.firstName.toLowerCase().includes(q) || 
        a.lastName.toLowerCase().includes(q) ||
        a.skfId.toLowerCase().includes(q)
      )
    }

    athletes = athletes
      .filter((a) => String(a.status || '').toLowerCase() !== 'inactive')
      .sort((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
      )

    // Return limited dataset for assignment search
    const results = athletes.map((a) => ({
      id: a.id,
      skfId: a.skfId,
      firstName: a.firstName,
      lastName: a.lastName,
      branchName: a.branchName,
      currentBelt: a.currentBelt,
      photoUrl: a.photoUrl
    })).slice(0, 50)

    return NextResponse.json({ athletes: results })
  }
)
