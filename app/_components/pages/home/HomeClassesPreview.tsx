import { getAllCitiesLive } from '@/lib/server/repositories/classes-live'
import HomeClassesGrid from './HomeClassesGrid'

export default async function HomeClassesPreview() {
  const cities = await getAllCitiesLive()

  return (
    <section className="home-classes-preview section section--tint-cool" id="classes">
      <div className="container">
        <HomeClassesGrid cities={cities} />
      </div>
    </section>
  )
}
