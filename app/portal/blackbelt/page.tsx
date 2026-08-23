import { requirePortalAthlete } from '@/lib/server/auth/require-portal-athlete'
import { getBBProgramForPortal, getBBCandidateBySkfIdAcrossPrograms } from '@/lib/server/repositories/blackbelt-live'
import { normaliseSkfId } from '@/lib/utils/registration'
import { isExternallyManagedBranch } from '@/data/constants/branches'
import { redirect } from 'next/navigation'
import BlackBeltClient from './BlackBeltClient'

const DRIVE_MAP: Record<string, string> = {
  'SKF13BL000': 'https://drive.google.com/drive/folders/1GGfoE3SOgFsD6wICnp2ztnKHUlEgzjmo?usp=sharing', // SHRIROSHAN P
  'SKF20HE001': 'https://drive.google.com/drive/folders/1txctxGMEgZxv7zQejhW6s-xN9LpwW1Wz?usp=sharing', // SANJANA S
  'SKF20HE002': 'https://drive.google.com/drive/folders/1M9zhju2AwPaLbxzhhXB3beSRwFkyzxiB?usp=sharing', // TEJASHREE S
  'SKF20HE003': 'https://drive.google.com/drive/folders/1aDsAd4ULgD4DLA5NhlqndLstdumseaDv?usp=sharing', // AYUSH KASHYAP G
  'SKF21HE001': 'https://drive.google.com/drive/folders/1FyLxjvGtJ8JKTxIl57vnjHTKifriRda1?usp=sharing', // ISHAAN GOWDA B S
  'SKF21HE003': 'https://drive.google.com/drive/folders/1kHHbgIDixJfbHbPHAJJVUQV1zuzuKN0G?usp=sharing', // SHASHANK
}

export default async function BlackBeltPage() {
  const { athlete, session } = await requirePortalAthlete({ callbackUrl: '/portal/blackbelt' })

  // Externally managed branches (e.g. Kunigal) run their own belt curriculum,
  // so the SKF Black Belt program never applies to their athletes.
  if (isExternallyManagedBranch(athlete?.branchName || session?.branch)) {
    redirect('/portal/dashboard')
  }

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
      myDriveLink={DRIVE_MAP[normaliseSkfId(candidateRecord.skf_id)] || 'https://drive.google.com'}
    />
  )
}
