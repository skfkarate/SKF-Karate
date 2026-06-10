import { requirePortalAthlete } from '@/lib/server/auth/require-portal-athlete'
import PointsClient from './PointsClient'


export default async function PortalPointsPage() {
  await requirePortalAthlete()
  return <PointsClient />
}
