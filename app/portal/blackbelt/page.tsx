import { requirePortalAthlete } from '@/lib/server/auth/require-portal-athlete'
import { getBBProgramForPortal } from '@/lib/server/repositories/blackbelt-live'
import { normaliseSkfId } from '@/lib/utils/registration'
import { redirect } from 'next/navigation'
import BlackBeltClient from './BlackBeltClient'


export default async function BlackBeltPage() {
  const { athlete } = await requirePortalAthlete()
  const data = await getBBProgramForPortal(athlete.skfId)

  const normalizedAthleteId = normaliseSkfId(athlete.skfId)

  if (!data?.program || !data.candidates.some(c => normaliseSkfId(c.skf_id) === normalizedAthleteId)) {
    redirect('/portal/dashboard')
  }

  return (
    <BlackBeltClient
      program={data.program}
      candidates={data.candidates}
      progressMap={data.progressMap}
      currentSkfId={normalizedAthleteId}
      renderedAt={new Date().toISOString()}
    />
  )
}
