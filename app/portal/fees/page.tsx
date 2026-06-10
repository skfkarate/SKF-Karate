import { requirePortalAthlete } from '@/lib/server/auth/require-portal-athlete'
import { FeeLedgerService } from '@/src/server/services/fee-ledger.service'

import FeesClient from './FeesClient'


export default async function FeesPage() {
  const { session } = await requirePortalAthlete()

  // Use the smart ledger service which auto-generates missing months based on the student's personal fee amount
  // It handles customized/decremented fees per student securely.
  const ledgerData = await FeeLedgerService.getPortalLedger(session.skfId!)

  return <FeesClient feeRecords={ledgerData.entries} />
}
