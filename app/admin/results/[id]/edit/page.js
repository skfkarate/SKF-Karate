import { notFound } from 'next/navigation'
import TournamentForm from '../../../../components/results/TournamentForm'
import { getTournamentById } from '../../../../../lib/data/tournaments'
import { requireAdminSession } from '@/lib/utils/auth'

export default async function EditTournamentPage({ params }) {
  await requireAdminSession("admin");
  const { id } = await params
  const tournament = getTournamentById(id)

  if (!tournament) {
    notFound()
  }

  return <TournamentForm tournament={tournament} isEdit />;
}
