import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { verifyStudentJWT } from '@/lib/server/auth'
import { 
  getStudentBySkfId, 
  getStudentsByPhone,
  getFeesBySkfId,
  getVideosByBranchAndBatch,
  getEnrollmentsBySkfId,
  getAttendanceBySkfId,
  getAnnouncements
} from '@/lib/server/sheets'
import { beltColors } from '@/app/_components/athlete/profile/athleteProfileData'
import { ChildSwitcher } from '@/app/_components/portal/ChildSwitcher'
import { FaPlayCircle, FaCertificate, FaArrowRight, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'

export const dynamic = 'force-dynamic'

export default async function PortalDashboard() {
  const cookieStore = await cookies()
  const token = cookieStore.get('skf_student_token')?.value
  const session = token ? verifyStudentJWT(token) : null

  if (!session || !session.skfId) {
    redirect('/portal/login')
  }

  const primaryStudent = await getStudentBySkfId(session.skfId)
  if (!primaryStudent) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2>Profile Not Found</h2>
        <Link href="/portal/login" style={{ color: 'var(--gold)' }}>Return to login</Link>
      </div>
    )
  }

  const parentPhone = session.parentPhone || primaryStudent.phone
  const siblings = await getStudentsByPhone(parentPhone)
  
  const selectedSkfId = cookieStore.get('skf_portal_child_selection')?.value || session.skfId
  const activeStudent = siblings.find(s => s.skfId === selectedSkfId) || primaryStudent

  const currentMonth = new Date().toLocaleString('en-US', { month: 'long' })

  // Parallel Fetching
  const [fees, videos, enrollments, attendance, announcements] = await Promise.all([
    getFeesBySkfId(activeStudent.skfId),
    getVideosByBranchAndBatch(activeStudent.branch, activeStudent.batch),
    getEnrollmentsBySkfId(activeStudent.skfId),
    getAttendanceBySkfId(activeStudent.skfId, currentMonth),
    getAnnouncements(activeStudent.branch)
  ])

  // Process Fees
  const latestFee = fees.find(f => f.month === currentMonth)
  const isPaid = latestFee?.status === 'paid'
  const isOverdue = latestFee?.status === 'overdue'

  // Process Videos
  const watchedVideos = videos.filter(v => v.progressPercent && v.progressPercent > 90).length

  // Process Grading (Mock projection)
  const nextGradingEligible = "July 2026"

  // Process Attendance
  const attendedCount = attendance.filter(a => a.status === 'Present').length
  const totalClasses = 9

  const beltColorHex = beltColors[activeStudent.belt.charAt(0).toUpperCase() + activeStudent.belt.slice(1)] || beltColors.White

  return (
    <div style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      <ChildSwitcher students={siblings} activeSkfId={activeStudent.skfId} />

      {/* 1. STUDENT HEADER CARD */}
      <section style={{ 
        background: 'rgba(255,255,255,0.02)', 
        border: '1px solid rgba(255,255,255,0.05)', 
        borderRadius: '24px', 
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ 
          position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', background: beltColorHex, 
          boxShadow: `0 0 20px ${beltColorHex}` 
        }}></div>

        <div style={{
          width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 900,
          border: `2px solid ${beltColorHex}`, color: beltColorHex, boxShadow: `0 0 15px ${beltColorHex}40`
        }}>
          {activeStudent.name.charAt(0)}
        </div>

        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
            {activeStudent.name}
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--crimson)', fontWeight: 700, letterSpacing: '1px' }}>{activeStudent.skfId}</span>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
            <span style={{ fontSize: '0.9rem', color: '#fff', textTransform: 'capitalize' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: beltColorHex, marginRight: '6px' }}></span>
              {activeStudent.belt} Belt
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="portal-branch-badge">{activeStudent.branch}</span>
            <span className="portal-branch-badge" style={{ background: 'rgba(255,255,255,0.1)' }}>{activeStudent.batch}</span>
          </div>
        </div>
      </section>

      {/* 2. QUICK STATS ROW */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        
        {/* Card 1: Fee Status */}
        <div className="portal-stat-card">
          <span className="portal-stat-label">Fee Status</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
            {isPaid ? (
              <span style={{ fontSize: '1.2rem', color: 'var(--gold)', fontWeight: 700 }}>{currentMonth} <FaCheckCircle /></span>
            ) : isOverdue ? (
              <div>
                <span style={{ fontSize: '1.2rem', color: '#ff4444', fontWeight: 700 }}>₹{activeStudent.monthlyFee} overdue</span>
              </div>
            ) : (
              <div>
                <span style={{ fontSize: '1.2rem', color: 'var(--crimson)', fontWeight: 700 }}>₹{activeStudent.monthlyFee} due</span>
              </div>
            )}
          </div>
          {!isPaid && (
            <Link href="/portal/fees" style={{ display: 'inline-block', marginTop: '1rem', padding: '0.4rem 1rem', background: isOverdue ? '#ff4444' : 'var(--crimson)', color: '#fff', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
              Pay Now
            </Link>
          )}
        </div>

        {/* Card 2: Videos */}
        <div className="portal-stat-card">
          <span className="portal-stat-label">Videos This Week</span>
          <div style={{ marginTop: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 700 }}>{watchedVideos} <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.5)' }}>/ {videos.length || 5}</span></span>
          </div>
          <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '1rem' }}>
            <div style={{ width: `${(watchedVideos / Math.max(videos.length, 1)) * 100}%`, height: '100%', background: 'var(--blue, #38bdf8)', borderRadius: '2px' }}></div>
          </div>
        </div>

        {/* Card 3: Next Grading */}
        <div className="portal-stat-card">
          <span className="portal-stat-label">Next Grading</span>
          <div style={{ marginTop: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 700 }}>Eligible</span>
            <span style={{ display: 'block', fontSize: '1rem', color: 'var(--gold)' }}>{nextGradingEligible}</span>
          </div>
        </div>

        {/* Card 4: Attendance */}
        <div className="portal-stat-card">
          <span className="portal-stat-label">Attendance ({currentMonth})</span>
          <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `conic-gradient(var(--gold) ${(attendedCount / totalClasses) * 360}deg, rgba(255,255,255,0.1) 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#05080f' }}></div>
            </div>
            <span style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 700 }}>{attendedCount} <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.5)' }}>/ {totalClasses}</span></span>
          </div>
        </div>

      </section>

      {/* 3. RECENT ACTIVITY & 4. QUICK ACTIONS */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', textTransform: 'uppercase', marginBottom: '1.5rem', color: 'var(--gold)' }}>Recent Activity</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {announcements.length > 0 && (
              <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <FaExclamationCircle color="var(--blue, #38bdf8)" style={{ marginTop: '4px' }} />
                <div>
                  <span style={{ display: 'block', fontSize: '0.9rem', color: '#fff' }}>{announcements[0].title}</span>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Announcement</span>
                </div>
              </li>
            )}
            {videos.length > 0 && (
              <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <FaPlayCircle color="var(--crimson)" style={{ marginTop: '4px' }} />
                <div>
                  <span style={{ display: 'block', fontSize: '0.9rem', color: '#fff' }}>{videos[0].title}</span>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>New Video Unlocked</span>
                </div>
              </li>
            )}
            {enrollments.length > 0 && (
              <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <FaCertificate color="var(--gold)" style={{ marginTop: '4px' }} />
                <div>
                  <span style={{ display: 'block', fontSize: '0.9rem', color: '#fff' }}>{enrollments[0].title}</span>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Earned Certificate</span>
                </div>
              </li>
            )}
          </ul>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {announcements.length > 0 && (
            <div style={{ background: 'linear-gradient(135deg, rgba(255, 183, 3, 0.1) 0%, rgba(255, 183, 3, 0.05) 100%)', border: '1px solid rgba(255, 183, 3, 0.2)', borderRadius: '24px', padding: '2rem' }}>
              <h2 style={{ fontSize: '1.2rem', textTransform: 'uppercase', marginBottom: '1rem', color: 'var(--gold)' }}>Latest Announcement</h2>
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.5rem' }}>{announcements[0].title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {announcements[0].body}
                </p>
              </div>
              <Link href={`/news/${announcements[0].slug}`} className="btn" style={{ background: 'var(--gold)', color: '#000', width: '100%', justifyContent: 'space-between' }}>
                Read full announcement <FaArrowRight />
              </Link>
            </div>
          )}

          <div style={{ background: 'linear-gradient(135deg, rgba(214, 40, 40, 0.1) 0%, rgba(214, 40, 40, 0.05) 100%)', border: '1px solid rgba(214, 40, 40, 0.2)', borderRadius: '24px', padding: '2rem', flex: 1 }}>
          <h2 style={{ fontSize: '1.2rem', textTransform: 'uppercase', marginBottom: '1.5rem', color: '#fff' }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {!isPaid && (
              <Link href="/portal/fees" className="btn" style={{ background: '#fff', color: 'var(--crimson)', width: '100%', justifyContent: 'space-between' }}>
                Settle Outstanding Fees <FaArrowRight />
              </Link>
            )}
            <Link href="/portal/videos" className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', width: '100%', justifyContent: 'space-between' }}>
              Watch Practice Videos <FaArrowRight />
            </Link>
            {enrollments.length > 0 && (
              <Link href="/portal/certificates" className="btn btn-outline-dynamic" style={{ width: '100%', justifyContent: 'space-between' }}>
                View New Certificate <FaArrowRight />
              </Link>
            )}
          </div>
        </div>
        </div>

      </section>

    </div>
  )
}
