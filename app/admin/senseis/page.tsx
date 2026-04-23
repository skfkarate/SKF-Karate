import { requireAdminSession } from '@/lib/utils/auth'
import { getAllSenseisLive } from '@/lib/server/repositories/senseis-live'
import SenseisAdminClient from './SenseisAdminClient'

export const dynamic = 'force-dynamic'

export default async function AdminSenseisPage() {
  const session = await requireAdminSession(['admin', 'instructor'])
  const senseis = await getAllSenseisLive()

  return (
    <SenseisAdminClient
      initialSenseis={senseis}
      canManage={session.user.role === 'admin' || session.user.role === 'instructor'}
    />
  )
}
