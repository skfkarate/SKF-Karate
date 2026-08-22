import { notFound } from 'next/navigation'

import { requirePortalAthlete } from '@/lib/server/auth/require-portal-athlete'
import { getAthleteBySkfIdLive } from '@/lib/server/repositories/athletes-live'
import { getPracticeLessonForAthlete } from '@/lib/server/repositories/portal-content-live'

import DirectPracticeLesson from './DirectPracticeLesson'

export default async function DirectPracticeLessonPage({ params }: { params: Promise<{ videoId: string }> }) {
  const { videoId } = await params
  const portal = await requirePortalAthlete({ callbackUrl: `/portal/videos/${encodeURIComponent(videoId)}` })
  const session = portal.session
  const athlete = portal.athlete || (session.skfId ? await getAthleteBySkfIdLive(session.skfId) : null)
  if (!athlete) notFound()

  const lesson = await getPracticeLessonForAthlete(videoId, {
    branchName: athlete.branchName || session.branch || '',
    batch: athlete.batch || session.batch || '',
    belt: athlete.currentBelt || session.belt || '',
  })
  if (!lesson) notFound()
  return <DirectPracticeLesson lesson={lesson} />
}
