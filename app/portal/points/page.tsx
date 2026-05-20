import { requirePortalAthlete } from '@/lib/server/auth/require-portal-athlete'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function PortalPointsPage() {
  await requirePortalAthlete()
  redirect('/portal')
}
