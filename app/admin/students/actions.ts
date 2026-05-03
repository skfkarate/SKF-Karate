'use server'

import { requireAdminSession } from '@/lib/server/auth/session'
import {
  getAthleteBySkfIdLive,
  updateAthleteLive,
} from '@/lib/server/repositories/athletes-live'
import { revalidateAthleteSitePaths } from '@/lib/server/revalidation'
import { normaliseSkfId } from '@/lib/utils/registration'

export async function reactivateStudent(inputSkfId: string) {
  await requireAdminSession(['admin', 'instructor'])

  const skfId = normaliseSkfId(inputSkfId)
  const athlete = await getAthleteBySkfIdLive(skfId)

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

  revalidateAthleteSitePaths(updated.skfId)
  return { success: true }
}
