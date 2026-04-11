import { cookies } from 'next/headers'
import Link from 'next/link'
import { verifyStudentJWT } from '@/lib/server/auth'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { FaUserCircle, FaSignOutAlt, FaHome, FaWallet, FaVideo, FaCertificate, FaUser } from 'react-icons/fa'
import { PortalProviders } from '@/app/_components/portal/PortalProviders'
import PointsBadge from '@/app/_components/points/PointsBadge'
import './portal.css'

export const metadata = {
  title: 'Student Portal | SKF Karate',
  description: 'Access your athlete dashboard, videos, and grading certificates.',
}

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('skf_student_token')?.value
  const session = token ? verifyStudentJWT(token) : null

  if (!session || !session.skfId) {
    redirect('/portal/login')
  }

  // Handle Child Selection overriding base JWT state
  const selectedChildId = cookieStore.get('skf_portal_child_selection')?.value
  const activeSkfId = selectedChildId || session.skfId

  // Note: the original session name is the parent or default child name. 
  // We rely on the dashboard page fetching the exact name if `selectedChildId` differs.

  return (
    <PortalProviders>
      <div className="portal-layout">
        
        {/* Top Navbar */}
        <header className="portal-header">
          <div className="portal-header__container">
            <div className="portal-header__left">
              <Link href="/" className="portal-logo" title="Back to Main Site">
                SKF <span className="text-gradient">PORTAL</span>
              </Link>
            </div>

            <div className="portal-header__right" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <PointsBadge skfId={activeSkfId} />
              
              <div className="portal-user-info" style={{ display: 'none' /* hidden on mobile implicitly via css normally, but kept inline for safe spacing */ }}>
                <FaUserCircle className="portal-user-icon" />
                <span className="portal-user-greeting">Welcome, {session.name.split(' ')[0]}</span>
              </div>
              <form action="/api/auth/portal/logout" method="POST">
                <button type="submit" className="portal-logout-btn" title="Logout">
                  <FaSignOutAlt /> <span className="sr-only">Logout</span>
                </button>
              </form>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="portal-main">
          {children}
        </main>

        {/* Bottom Tab Navigation (Mobile First) */}
        <nav className="portal-bottom-nav">
          <Link href="/portal/dashboard" className="portal-nav-item">
            <FaHome />
            <span>Dashboard</span>
          </Link>
          <Link href="/portal/fees" className="portal-nav-item">
            <FaWallet />
            <span>Fees</span>
          </Link>
          <Link href="/portal/videos" className="portal-nav-item">
            <FaVideo />
            <span>Videos</span>
          </Link>
          <Link href="/portal/certificates" className="portal-nav-item">
            <FaCertificate />
            <span>Certificates</span>
          </Link>
          <Link href="/portal/profile" className="portal-nav-item">
            <FaUser />
            <span>Profile</span>
          </Link>
        </nav>

      </div>
    </PortalProviders>
  )
}
