import { getAllCitiesLive } from '@/lib/server/repositories/classes-live'
import NewStudentClient from './NewStudentClient'

export default async function NewStudentPage() {
  const classCities = await getAllCitiesLive()

  return <NewStudentClient initialCities={classCities} />
}
