import { normaliseSkfId } from '@/lib/utils/registration'

export function normaliseBlackBeltCandidateId(skfId?: string | null) {
  return normaliseSkfId(String(skfId || ''))
}
