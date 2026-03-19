import { getAllTournamentsAdmin } from '../../../lib/data/tournaments'
import { requireAdminSession } from '@/lib/utils/auth'
import AdminResultsPageClient from '@/components/admin/AdminResultsPageClient'
import './admin-results.css'

export default async function AdminResultsPage() {
  const session = await requireAdminSession(["admin", "instructor"])
  const tournaments = getAllTournamentsAdmin()

  return (
    <AdminResultsPageClient
      initialTournaments={tournaments}
      canManage={session.user.role === "admin"}
    />
  )
}
