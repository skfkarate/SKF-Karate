import { requirePortalAthlete } from '@/lib/server/auth/require-portal-athlete'
import { getActiveTimetableForBranchName } from '@/lib/server/repositories/portal-content-live'

import TimetableClient from './TimetableClient'

export const dynamic = 'force-dynamic'

export default async function TimetablePage() {
  const { athlete, session } = await requirePortalAthlete()
  const branchName = athlete.branchName || session.branch || 'SKF Karate'
  const timetable = await getActiveTimetableForBranchName(branchName)

  return <TimetableClient branchName={branchName} timetableData={timetable} />
}
