import { NextResponse } from 'next/server'
import { getAllAthletes } from '@/lib/server/repositories/athletes'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Certificate ID is required' }, { status: 400 })
  }

  try {
    const athletes = getAllAthletes()
    
    // Search all athletes' achievements for a matching ID
    for (const athlete of athletes) {
      if (athlete.achievements && Array.isArray(athlete.achievements)) {
        const matchingAchievement = athlete.achievements.find(a => a.id === id)
        
        if (matchingAchievement) {
          // If the achievement doesn't support certificates, we still return 404
          if (!['belt-grading', 'enrollment'].includes(matchingAchievement.type) && !matchingAchievement.type.startsWith('tournament-')) {
            break;
          }

          return NextResponse.json({
            skfId: athlete.registrationNumber,
            enrollmentId: matchingAchievement.id
          })
        }
      }
    }

    return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
  } catch (error) {
    console.error('Error searching certificates:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
