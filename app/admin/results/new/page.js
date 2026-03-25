import AdminTournamentForm from '@/app/_components/admin/results/AdminTournamentForm'
import { requireAdminSession } from '@/lib/utils/auth'

export default async function NewTournamentPage() {
  await requireAdminSession("admin");

  return <AdminTournamentForm />;
}
