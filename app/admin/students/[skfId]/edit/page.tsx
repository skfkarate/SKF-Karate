import { notFound } from 'next/navigation'

import {
  buildAthleteAdminFormDefaults,
  buildAthleteAutomationSummary,
} from '@/lib/admin/athlete-records'
import { getAllCitiesLive } from '@/lib/server/repositories/classes-live'
import { getAthleteBySkfIdLive } from '@/lib/server/repositories/athletes-live'
import { normaliseSkfId } from '@/lib/utils/registration'

import EditStudentClient from './EditStudentClient'

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ skfId: string }>
}) {
  const { skfId: rawSkfId } = await params
  const skfId = normaliseSkfId(rawSkfId)

  const [athlete, classCities] = await Promise.all([
    getAthleteBySkfIdLive(skfId),
    getAllCitiesLive(),
  ])

  if (!athlete) return notFound()

  return (
    <EditStudentClient
      initialCities={classCities}
      profile={buildAthleteAdminFormDefaults(athlete)}
      automationSummary={buildAthleteAutomationSummary(athlete)}
      publicProfileHref={athlete.isPublic ? `/athlete/${athlete.skfId}` : null}
    />
  )
}
