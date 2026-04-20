import './portal.css'
import AthleteHubNav from '@/app/_components/portal/AthleteHubNav'

export const metadata = {
  title: 'Athlete Portal — SKF Karate',
  description: 'Access your athlete profile, home practice videos, certificates, and fees through the SKF Karate Athlete Portal.',
}

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
