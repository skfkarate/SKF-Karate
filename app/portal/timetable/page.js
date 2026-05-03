import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

import { COOKIE_NAME, verifyJWT } from '@/lib/server/auth/portal'
import { getAthleteBySkfIdLive } from '@/lib/server/repositories/athletes-live'
import { getActiveTimetableForBranchName } from '@/lib/server/repositories/portal-content-live'

import TimetableClient from './TimetableClient'

export const dynamic = 'force-dynamic'

export default async function TimetablePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  const session = verifyJWT(token)

  if (!session || !session.skfId) {
    redirect('/portal/login')
  }

  const athlete = await getAthleteBySkfIdLive(session.skfId)
  const branchName = athlete?.branchName || session.branch || 'SKF Karate'
  const timetable = await getActiveTimetableForBranchName(branchName)

  return <TimetableClient branchName={branchName} timetableData={timetable} />
}
