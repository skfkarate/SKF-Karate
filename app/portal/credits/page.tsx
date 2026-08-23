import { redirect } from 'next/navigation'

import { requirePortalAthlete } from '@/lib/server/auth/require-portal-athlete'
import { isExternallyManagedBranch } from '@/data/constants/branches'
import CreditsClient from './CreditsClient'

export default async function PortalCreditsPage() {
  const { athlete, session } = await requirePortalAthlete({ callbackUrl: '/portal/credits' })

  // Externally managed branches (e.g. Kunigal) handle rewards locally.
  if (isExternallyManagedBranch(athlete?.branchName || session?.branch)) {
    redirect('/portal/dashboard')
  }

  return <CreditsClient />
}
