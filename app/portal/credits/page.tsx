import { requirePortalAthlete } from '@/lib/server/auth/require-portal-athlete'
import CreditsClient from './CreditsClient'

export default async function PortalCreditsPage() {
  await requirePortalAthlete()
  return <CreditsClient />
}
