import { awardPoints } from '@/lib/points/pointsService'
import { getAuthorizedApiSession } from '@/lib/server/auth/session'
import { getAthleteByRegistrationNumberLive } from '@/lib/server/repositories/athletes-live'

export async function POST(request: Request) {
  try {
    const session = await getAuthorizedApiSession(['admin', 'instructor'])
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { skfId, reason, note } = await request.json()

    if (!skfId || !reason) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const athlete = await getAthleteByRegistrationNumberLive(skfId.toUpperCase())
    if (!athlete || String(athlete.status || '').toLowerCase() !== 'active') {
      return Response.json({ error: 'Athlete not found or inactive' }, { status: 404 })
    }

    const { newBalance, pointsAwarded } = await awardPoints(
      athlete.registrationNumber,
      reason,
      { manual: true, note }
    )

    return Response.json({ success: true, newBalance, pointsAwarded })
  } catch (error: any) {
    console.error('Award points error:', error)
    return Response.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
