import TournamentForm from '../../../components/results/TournamentForm'
import { requireAdminSession } from '@/lib/utils/auth'

export default async function NewTournamentPage() {
  await requireAdminSession("admin");

  return <TournamentForm />;
}
