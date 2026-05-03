import { requireAdminSession } from '@/lib/server/auth/session'
import { FeeLedgerService } from '@/src/server/services/fee-ledger.service'

import TrainingFeeAdminClient from '../treasury/TreasuryAdminClient'

export const dynamic = 'force-dynamic'

export default async function AdminTrainingFeePage() {
  await requireAdminSession(['admin', 'instructor'])

  const currentYear = new Date().getFullYear()
  const initialLedger = await FeeLedgerService.getAdminLedger({ year: currentYear })

  return <TrainingFeeAdminClient initialLedger={initialLedger} initialYear={currentYear} />
}
