import { redirect } from 'next/navigation'

import { requirePortalAthlete } from '@/lib/server/auth/require-portal-athlete'
import { FeeLedgerService } from '@/src/server/services/fee-ledger.service'
import { isExternallyManagedBranch } from '@/data/constants/branches'
import { getBlackBeltOverride } from '@/lib/server/temporary-black-belt-override'

import FeesClient from './FeesClient'


export default async function FeesPage() {
  const { athlete, session } = await requirePortalAthlete({ callbackUrl: '/portal/fees' })

  // Externally managed branches (e.g. Kunigal) collect fees locally.
  if (isExternallyManagedBranch(athlete?.branchName || session?.branch)) {
    redirect('/portal/dashboard')
  }

  // Use the smart ledger service which auto-generates missing months based on the student's personal fee amount
  // It handles customized/decremented fees per student securely.
  if (!session.skfId) {
    redirect('/portal/login')
  }
  const skfId = session.skfId
  const ledgerData = await FeeLedgerService.getPortalLedger(skfId)

  // Attach overrides securely on the server so we don't leak candidate IDs to the client bundle
  const enrichedEntries = ledgerData.entries.map((fee) => {
    const status = String(fee.status || '')
    const eligibleStatus = status === 'due' || status === 'overdue' || status === 'rejected' || status === 'pending_verification'
    const canApply = fee.feeType === 'monthly' && eligibleStatus && !String(fee.sourceKey || '').trim()
    if (canApply) {
      const override = getBlackBeltOverride(skfId, fee.monthIndex, fee.year)
      if (override) {
        return { ...fee, _serverOverrideAmount: override.amount, _serverOverrideLabel: override.label }
      }
    }
    return fee
  })

  return (
    <FeesClient
      feeRecords={enrichedEntries}
      credits={ledgerData.credits}
      athleteSkfId={skfId}
    />
  )
}
