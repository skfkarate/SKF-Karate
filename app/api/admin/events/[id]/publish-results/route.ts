import { NextResponse } from 'next/server'
import { getEventByIdAdmin, updateEventRecord } from '@/lib/server/repositories/events'
import { getAthleteById, updateAthlete } from '@/lib/server/repositories/athletes'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/server/auth/options'

export async function POST(request: Request, context: { params: any }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await Promise.resolve(context.params)
    const { id } = params
    
    const event = getEventByIdAdmin(id)
    if (!event) {
       return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (!document || !event.results || event.results.length === 0) {
      return NextResponse.json({ error: 'No results recorded to publish.' }, { status: 400 })
    }

    // Iterate through results and update athletes
    for (const result of event.results) {
      if (result.athleteId) {
        const athlete = getAthleteById(result.athleteId)
        if (athlete) {
          
          const isTournament = event.type === 'tournament'
          let newAchievement: any = {
             id: `ach_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
             date: event.date,
             title: isTournament 
                ? (result.medal && result.medal !== 'participation' ? `${result.medal.charAt(0).toUpperCase() + result.medal.slice(1)} Medal — ${event.name}` : `Participated in ${event.name}`) 
                : (result.award || `Completed ${event.name}`),
             type: isTournament ? `tournament-${result.medal || 'participation'}` : 'event-completion',
             pointsAwarded: isTournament ? (result.medal === 'gold' ? 1000 : result.medal === 'silver' ? 700 : result.medal === 'bronze' ? 500 : 100) : 100
          }

          if (result.promotion) {
             newAchievement.type = 'belt-grading'
             newAchievement.beltEarned = result.promotion
             newAchievement.pointsAwarded += 200 // Bonus for promotion
          }
          
          if (isTournament && result.category) {
            newAchievement.tournamentLevel = event.level || 'district'
            newAchievement.meta = [result.category]
          }

          // Check if achievement already pushed to prevent duplicates
          const alreadyPushed = athlete.achievements.some(a => a.date === event.date && a.title === newAchievement.title)
          
          if (!alreadyPushed) {
            const updatedAchievements = [newAchievement, ...(athlete.achievements || [])]
            let updatedBelt = athlete.currentBelt
            if (result.promotion) {
              updatedBelt = result.promotion
            }

            updateAthlete(result.athleteId, {
              achievements: updatedAchievements,
              currentBelt: updatedBelt
            })
          }
        }
      }
    }

    // Mark Event Results as Published
    const updatedEvent = updateEventRecord(id, {
      resultsAppliedAt: new Date().toISOString(),
      isResultsPublished: true
    })

    return NextResponse.json({ success: true, event: updatedEvent })
  } catch (error: any) {
    console.error('[API] Failed to publish results:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
