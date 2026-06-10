import { requirePortalAthlete } from '@/lib/server/auth/require-portal-athlete'
import { getBBProgramForPortal } from '@/lib/server/repositories/blackbelt-live'
import { redirect } from 'next/navigation'
import BlackBeltClient from './BlackBeltClient'


export default async function BlackBeltPage() {
  const { athlete } = await requirePortalAthlete()
  const data = await getBBProgramForPortal()

  if (!data?.program || !data.candidates.some(c => c.skf_id === athlete.skfId)) {
    redirect('/portal/dashboard')
  }

  return (
    <BlackBeltClient
      program={data.program}
      candidates={data.candidates}
      progressMap={data.progressMap}
      currentSkfId={athlete.skfId}
    />
  )
}
