import { requirePortalAthlete } from '@/lib/server/auth/require-portal-athlete'
import { getBBProgramForPortal, getBBCandidateBySkfIdAcrossPrograms } from '@/lib/server/repositories/blackbelt-live'
import { normaliseSkfId } from '@/lib/utils/registration'
import { redirect } from 'next/navigation'
import BlackBeltClient from './BlackBeltClient'


export default async function BlackBeltPage() {
  const { athlete } = await requirePortalAthlete({ callbackUrl: '/portal/blackbelt' })

  const normalizedAthleteId = normaliseSkfId(athlete.skfId)

  // Only assigned Black Belt candidates may ever access this page. Verify the
  // enrollment row FIRST so no program data is ever fetched for non-candidates.
  const candidateRecord = await getBBCandidateBySkfIdAcrossPrograms(normalizedAthleteId)
  if (!candidateRecord) {
    redirect('/portal/dashboard')
  }

  const data = await getBBProgramForPortal(candidateRecord.skf_id)
  if (!data?.program) {
    redirect('/portal/dashboard')
  }

  return (
    <BlackBeltClient
      program={data.program}
      candidates={data.candidates}
      progressMap={data.progressMap}
      currentSkfId={candidateRecord.skf_id}
      renderedAt={new Date().toISOString()}
    />
  )
}
