import { normaliseSkfId } from '@/lib/utils/registration'

export const BLACK_BELT_2026_CANDIDATE_IDS = [
  'SKF13BL000',
  'SKF20HE001',
  'SKF20HE002',
  'SKF20HE003',
  'SKF21HE001',
  'SKF21HE003',
] as const

const BLACK_BELT_2026_CANDIDATE_SET = new Set<string>(BLACK_BELT_2026_CANDIDATE_IDS)

export function normaliseBlackBeltCandidateId(skfId?: string | null) {
  return normaliseSkfId(String(skfId || ''))
}

export function isOfficialBlackBeltCandidateId(skfId?: string | null) {
  return BLACK_BELT_2026_CANDIDATE_SET.has(normaliseBlackBeltCandidateId(skfId))
}
