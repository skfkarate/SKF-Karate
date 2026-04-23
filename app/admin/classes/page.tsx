import { requireAdminSession } from '@/lib/utils/auth'
import { getAllCitiesLive } from '@/lib/server/repositories/classes-live'
import { getAssignableSenseisLive } from '@/lib/server/repositories/senseis-live'
import ClassesAdminClient from './ClassesAdminClient'

export const dynamic = 'force-dynamic'

export default async function AdminClassesPage() {
  const session = await requireAdminSession(['admin', 'instructor'])
  const [cities, senseis] = await Promise.all([
    getAllCitiesLive(),
    getAssignableSenseisLive(),
  ])

  return (
    <ClassesAdminClient
      initialCities={cities}
      initialSenseis={senseis}
      canManage={session.user.role === 'admin' || session.user.role === 'instructor'}
    />
  )
}
