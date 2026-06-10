import { requirePortalAthlete } from '@/lib/server/auth/require-portal-athlete'

import NoticesClient from './NoticesClient'


export default async function NoticesPage() {
  await requirePortalAthlete()
  return <NoticesClient />
}
