import { notFound } from 'next/navigation'
import AdminTournamentForm from '@/app/_components/admin/results/AdminTournamentForm'
import { getTournamentByIdLive } from '@/lib/server/repositories/tournaments-live'
import { requireAdminSession } from '@/lib/utils/auth'

export default async function EditTournamentPage({ params }) {
  await requireAdminSession("admin");
  const { id } = await params
  const tournament = await getTournamentByIdLive(id)

  if (!tournament) {
    notFound()
  }

  return <AdminTournamentForm tournament={tournament} isEdit />;
}
