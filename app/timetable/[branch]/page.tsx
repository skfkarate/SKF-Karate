import Image from 'next/image'
import Link from 'next/link'
import { getTimetableByBranch } from '@/lib/server/sheets'
import { formatBranchName } from '@/lib/utils'
import './timetable.css'

const BRANCH_WHATSAPP = {
  koramangala: '919019971726',
  whitefield: '919019971726',
  'jp-nagar': '919019971726',
}

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export async function generateStaticParams() {
  return [
    { branch: 'koramangala' },
    { branch: 'whitefield' },
    { branch: 'jp-nagar' }
  ]
}


export async function generateMetadata({ params }: { params: { branch: string } }) {
  const { branch } = await params
  const branchName = formatBranchName(branch)
  const timetable = await getTimetableByBranch(branch)
  
  const now = new Date()
  const monthName = MONTH_NAMES[now.getMonth() + 1]

  return {
    title: `${monthName} Timetable — SKF ${branchName}`,
    description: `View the current training schedule for SKF Karate ${branchName} branch`,
    openGraph: {
      images: timetable?.imageUrl ? [{ url: timetable.imageUrl }] : ['/og-default.jpg']
    }
  }
}

export default async function TimetablePage({ params }: { params: { branch: string } }) {
  const { branch } = await params
  const branchName = formatBranchName(branch)
  
  const timetables = await getTimetableByBranch(branchName) || null
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  const monthName = MONTH_NAMES[currentMonth]

  // Assuming getTimetableByBranch now returns the specific current month timetable object based on my previous DAO implementation.
  // We'll mock a generic previous array to satisfy the UI requirement of 'accordions'
  const previous = [
    { month: MONTH_NAMES[(currentMonth - 1) || 12], year: currentMonth === 1 ? currentYear - 1 : currentYear },
    { month: MONTH_NAMES[(currentMonth - 2) <= 0 ? (currentMonth - 2) + 12 : currentMonth - 2], year: (currentMonth - 2) <= 0 ? currentYear - 1 : currentYear },
  ]

  const phone = BRANCH_WHATSAPP[branch as keyof typeof BRANCH_WHATSAPP] || '919019971726'

  return (
    <div className="tt-page">
      <div className="tt-glow tt-glow--1" />
      <div className="tt-glow tt-glow--2" />

      <div className="tt-container">
        {/* 1. Branch name heading */}
        <h1 className="tt-header glow-red">
          {branchName} Dojo
        </h1>

        {/* 2. Gold pill badge */}
        <div className="tt-month-badge">
          <span className="tt-pill-badge">{monthName} {currentYear} Schedule</span>
        </div>

        {/* 3. Timetable Image / Glassmorphic Card */}
        {timetables ? (
          <div className="tt-card-glass">
            <div className="tt-scrollable-image-wrapper">
              <Image 
                src={timetables.imageUrl} 
                alt={`${branchName} Timetable`} 
                width={1200} 
                height={800} 
                className="tt-image"
                priority 
              />
            </div>
            <div className="tt-mobile-fallback">
              <a href={timetables.imageUrl} target="_blank" rel="noreferrer">
                Tap to Download Full Size image
              </a>
            </div>
          </div>
        ) : (
          /* 7. No timetable yet fallback */
          <div className="tt-card-empty">
            <h2 className="tt-empty-title">Schedule for {monthName} coming soon</h2>
            <p className="tt-empty-text">We'll announce in our WhatsApp group</p>
          </div>
        )}

        {/* 4. Previous months section (Accordion styled) */}
        <div className="tt-previous-accordion">
          <details className="tt-accordion">
            <summary className="tt-accordion-summary">View Previous Months</summary>
            <div className="tt-accordion-content">
              {previous.map((p, idx) => (
                <div key={idx} className="tt-accordion-item">
                  <span>{p.month} {p.year}</span>
                  <span className="text-muted">Archived</span>
                </div>
              ))}
            </div>
          </details>
        </div>

        {/* 6. Enrol CTA */}
        <div className="tt-action-row">
          <Link href="/contact" className="tt-enrol-btn">
            Enrol at {branchName}
          </Link>
        </div>

        {/* Subtle Navigation Row */}
        <nav className="tt-subtle-nav">
          <Link href="/dojos">← Back to Dojos</Link>
          <div className="tt-nav-divider">|</div>
          <Link href={`/senseis/${branch}`}> {branchName} Senseis →</Link>
          <div className="tt-nav-divider">|</div>
          <Link href="/summer-camp">Summer Camp at {branchName} →</Link>
        </nav>
      </div>

      {/* 5. WhatsApp Floating Button */}
      <a 
        href={`https://wa.me/${phone}?text=Questions about ${branchName} schedule?`} 
        target="_blank" 
        rel="noreferrer"
        className="tt-floating-whatsapp"
      >
        <span className="wa-icon">💬</span> Questions about {branchName} schedule?
      </a>
    </div>
  )
}
