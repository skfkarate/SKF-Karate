import { notFound } from 'next/navigation'

import {
  buildAthleteAdminFormDefaults,
  buildAthleteAutomationSummary,
} from '@/lib/admin/athlete-records'
import { getAllCitiesLive } from '@/lib/server/repositories/classes-live'
import { getAthleteByRegistrationNumberLive } from '@/lib/server/repositories/athletes-live'
import { normaliseRegistrationNumber } from '@/lib/utils/registration'

import EditStudentClient from './EditStudentClient'

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ skfId: string }>
}) {
  const { skfId } = await params
  const registrationNumber = normaliseRegistrationNumber(skfId)

  const [athlete, classCities] = await Promise.all([
    getAthleteByRegistrationNumberLive(registrationNumber),
    getAllCitiesLive(),
  ])

  if (!athlete) return notFound()

  return (
    <EditStudentClient
      initialCities={classCities}
      profile={buildAthleteAdminFormDefaults(athlete)}
      automationSummary={buildAthleteAutomationSummary(athlete)}
      publicProfileHref={athlete.isPublic ? `/athlete/${athlete.registrationNumber}` : null}
    />
  )
}
