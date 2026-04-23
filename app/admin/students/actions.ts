'use server'

import { requireAdminSession } from '@/lib/server/auth/session'
import {
  getAthleteByRegistrationNumberLive,
  updateAthleteLive,
} from '@/lib/server/repositories/athletes-live'
import { revalidateAthleteSitePaths } from '@/lib/server/revalidation'
import { normaliseRegistrationNumber } from '@/lib/utils/registration'

export async function reactivateStudent(skfId: string) {
  await requireAdminSession(['admin', 'instructor'])

  const registrationNumber = normaliseRegistrationNumber(skfId)
  const athlete = await getAthleteByRegistrationNumberLive(registrationNumber)

  if (!athlete) {
    return { success: false, error: 'Athlete not found.' }
  }

  const updated = await updateAthleteLive(athlete.id, {
    ...athlete,
    status: 'active',
  })

  if (!updated) {
    return { success: false, error: 'Failed to reactivate athlete.' }
  }

  revalidateAthleteSitePaths(updated.registrationNumber)
  return { success: true }
}
