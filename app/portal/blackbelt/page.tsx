import { requirePortalAthlete } from '@/lib/server/auth/require-portal-athlete'
import { getBBProgramForPortal, isBBCandidate, getBBCandidateBySkfIdAcrossPrograms } from '@/lib/server/repositories/blackbelt-live'
import { normaliseSkfId } from '@/lib/utils/registration'
import { redirect } from 'next/navigation'
import BlackBeltClient from './BlackBeltClient'


export default async function BlackBeltPage() {
  const { athlete } = await requirePortalAthlete()
  const data = await getBBProgramForPortal(athlete.skfId)

  const normalizedAthleteId = normaliseSkfId(athlete.skfId)

  if (!data?.program || !await isBBCandidate(normalizedAthleteId)) {
    redirect('/portal/dashboard')
  }

  // Fetch the candidate record to get the fully resolved canonical ID from the database
  // This ensures the current ID exactly matches the database representation.
  const candidateRecord = await getBBCandidateBySkfIdAcrossPrograms(normalizedAthleteId)
  const finalSkfId = candidateRecord ? candidateRecord.skf_id : normalizedAthleteId

  return (
    <BlackBeltClient
      program={data.program}
      candidates={data.candidates}
      progressMap={data.progressMap}
      currentSkfId={finalSkfId}
      renderedAt={new Date().toISOString()}
    />
  )
}
