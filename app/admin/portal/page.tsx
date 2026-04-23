import { requireAdminSession } from '@/lib/server/auth/session'
import { getAllCitiesLive } from '@/lib/server/repositories/classes-live'
import {
  getAllBranchTimetablesAdmin,
  getAllPortalVideosAdmin,
} from '@/lib/server/repositories/portal-content-live'

import PortalContentAdminClient from './PortalContentAdminClient'

export const dynamic = 'force-dynamic'

export default async function AdminPortalContentPage() {
  await requireAdminSession(['admin', 'instructor'])

  const [cities, videos, timetables] = await Promise.all([
    getAllCitiesLive(),
    getAllPortalVideosAdmin(),
    getAllBranchTimetablesAdmin(),
  ])

  return (
    <PortalContentAdminClient
      initialCities={cities}
      initialVideos={videos}
      initialTimetables={timetables}
    />
  )
}
