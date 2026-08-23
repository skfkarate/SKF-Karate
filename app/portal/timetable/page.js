import { redirect } from 'next/navigation'

import { requirePortalAthlete } from '@/lib/server/auth/require-portal-athlete'
import { getActiveTimetableForBranchName } from '@/lib/server/repositories/portal-content-live'
import { isExternallyManagedBranch } from '@/data/constants/branches'

import TimetableClient from './TimetableClient'


export default async function TimetablePage() {
  const { athlete, session } = await requirePortalAthlete({ callbackUrl: '/portal/timetable' })

  // Externally managed branches (e.g. Kunigal) run their own class schedule.
  if (isExternallyManagedBranch(athlete?.branchName || session?.branch)) {
    redirect('/portal/dashboard')
  }

  const branchName = athlete.branchName || session.branch || 'SKF Karate'
  const timetable = await getActiveTimetableForBranchName(branchName)

  return <TimetableClient branchName={branchName} timetableData={timetable} />
}
