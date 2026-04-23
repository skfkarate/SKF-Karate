import { getAllTournamentsAdminLive } from '@/lib/server/repositories/tournaments-live'
import { requireAdminSession } from '@/lib/utils/auth'
import AdminResultsPageClient from '@/app/_components/admin/results/AdminResultsPageClient'
import './admin-results.css'

export default async function AdminResultsPage() {
  const session = await requireAdminSession(["admin", "instructor"])
  const tournaments = await getAllTournamentsAdminLive()

  return (
    <AdminResultsPageClient
      initialTournaments={tournaments}
      canManage={session.user.role === "admin"}
    />
  )
}
