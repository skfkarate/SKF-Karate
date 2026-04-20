import { notFound } from 'next/navigation'
import AdminTournamentForm from '@/app/_components/admin/results/AdminTournamentForm'
import { getTournamentById } from '@/lib/server/repositories/tournaments'
import { requireAdminSession } from '@/lib/utils/auth'

export default async function EditTournamentPage({ params }) {
  await requireAdminSession("admin");
  const { id } = await params
  const tournament = getTournamentById(id)

  if (!tournament) {
    notFound()
  }

  return <AdminTournamentForm tournament={tournament} isEdit />;
}
