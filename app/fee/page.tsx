import { redirect } from 'next/navigation'

import TrainingFeeAdminClient from '@/app/admin/treasury/TreasuryAdminClient'
import { getAdminSession } from '@/lib/server/auth/session'
import { FeeLedgerService } from '@/src/server/services/fee-ledger.service'

export const dynamic = 'force-dynamic'

export default async function FeePortalPage() {
  const session = await getAdminSession()

  if (!session?.user?.role) {
    redirect('/fee/login')
  }

  if (!['admin', 'instructor'].includes(session.user.role)) {
    redirect('/fee/login')
  }

  const currentYear = new Date().getFullYear()
  const initialLedger = await FeeLedgerService.getAdminLedger({ year: currentYear })

  return <TrainingFeeAdminClient initialLedger={initialLedger} initialYear={currentYear} />
}
