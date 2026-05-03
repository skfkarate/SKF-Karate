import './portal.css'
import AthleteHubNav from '@/app/_components/portal/AthleteHubNav'
import { buildNoIndexMetadata } from '@/data/constants/seo'

export const metadata = buildNoIndexMetadata(
  '/portal',
  'Access your SKF Karate athlete profile, home practice videos, certificates, rankings, timetable, and fees through the private athlete portal.'
)

export default function PortalLayout({ children }) {
  return (
    <div className="hub-layout">
      <AthleteHubNav />
      <main className="hub-main">
        {children}
      </main>
    </div>
  )
}
