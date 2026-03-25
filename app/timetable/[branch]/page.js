import Image from 'next/image'
import Link from 'next/link'
import { getTimetableByBranch } from '@/lib/server/sheets'
import './timetable.css'

const BRANCH_MAP = {
  'sunkadakatte': { name: 'Sunkadakatte', phone: '9019971726' },
  'rajajinagar': { name: 'Rajajinagar', phone: '9019971726' },
  'malleshwaram': { name: 'Malleshwaram', phone: '9019971726' },
  'jp-nagar': { name: 'JP Nagar', phone: '9019971726' },
}

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export async function generateMetadata({ params }) {
  const { branch } = await params
  const branchInfo = BRANCH_MAP[branch?.toLowerCase()]
  const branchName = branchInfo?.name || branch
  const now = new Date()
  const monthName = MONTH_NAMES[now.getMonth() + 1]
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  // Grab the image URL for OpenGraph
  let imageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://skfkarate.org'}/icon.png`
  try {
    const timetables = await getTimetableByBranch(branchName)
    const current = timetables?.find(t => {
      const m = parseInt(t.Month || t.month || '0')
      const y = parseInt(t.Year || t.year || '0')
      return m === currentMonth && y === currentYear
    })
    const src = current?.Drive_Image_URL || current?.drive_image_url || current?.['Drive Image URL']
    if (src) imageUrl = src
  } catch (e) {
    // Fallback to default
  }

  return {
    title: `${monthName} Timetable — SKF ${branchName}`,
    description: `View the training schedule for SKF Karate ${branchName} branch. Class timings, batch schedules, and training days.`,
    openGraph: {
      title: `${monthName} Timetable — SKF ${branchName}`,
      description: `Training schedule for SKF Karate ${branchName}`,
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 900,
          alt: `${branchName} Timetable`,
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: `${monthName} Timetable — SKF ${branchName}`,
      description: `Training schedule for SKF Karate ${branchName}`,
      images: [imageUrl],
    }
  }
}

export default async function TimetablePage({ params }) {
  const { branch } = await params
  const branchSlug = branch?.toLowerCase()
  const branchInfo = BRANCH_MAP[branchSlug]
  const branchName = branchInfo?.name || branch

  // Fetch timetable data from Google Sheets
  const timetables = await getTimetableByBranch(branchName)

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  // Find current month's timetable
  const current = timetables?.find(t => {
    const m = parseInt(t.Month || t.month || '0')
    const y = parseInt(t.Year || t.year || '0')
    return m === currentMonth && y === currentYear
  })

  // Previous months (last 3, excluding current)
  const previous = timetables
    ?.filter(t => {
      const m = parseInt(t.Month || t.month || '0')
      const y = parseInt(t.Year || t.year || '0')
      return !(m === currentMonth && y === currentYear)
    })
    .slice(0, 3) || []

  const imageUrl = current?.Drive_Image_URL || current?.drive_image_url || current?.['Drive Image URL'] || null

  return (
    <div className="tt-page">
      {/* Background glows */}
      <div className="tt-glow tt-glow--1" />
      <div className="tt-glow tt-glow--2" />

      <div className="tt-container">
        {/* Header */}
        <div className="tt-header">
          <span className="tt-header__tag">Training Schedule</span>
          <h1 className="tt-header__title">
            <span className="tt-header__branch">{branchName}</span>
            <span className="tt-header__title-text">Timetable</span>
          </h1>
        </div>

        {/* Current Month Badge */}
        <div className="tt-month-badge">
          <span className="tt-month-badge__text">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </span>
        </div>

        {/* Timetable Image */}
        <div className="tt-card">
          {imageUrl ? (
            <div className="tt-card__image-wrap">
              <Image
                src={imageUrl}
                alt={`${branchName} timetable for ${MONTH_NAMES[currentMonth]} ${currentYear}`}
                width={1200}
                height={900}
                className="tt-card__image"
                priority
              />
            </div>
          ) : (
            <div className="tt-card__empty">
              <div className="tt-card__empty-icon">📅</div>
              <h3 className="tt-card__empty-title">Coming Soon</h3>
              <p className="tt-card__empty-text">
                The {MONTH_NAMES[currentMonth]} timetable for {branchName} will be
                uploaded shortly. Check back soon!
              </p>
            </div>
          )}
        </div>

        {/* Previous Months */}
        {previous.length > 0 && (
          <div className="tt-previous">
            <h2 className="tt-previous__title">Previous Months</h2>
            <div className="tt-previous__grid">
              {previous.map((t, i) => {
                const m = parseInt(t.Month || t.month || '0')
                const y = parseInt(t.Year || t.year || '0')
                const url = t.Drive_Image_URL || t.drive_image_url || t['Drive Image URL']
                return (
                  <div key={i} className="tt-previous__card">
                    <span className="tt-previous__month">
                      {MONTH_NAMES[m]} {y}
                    </span>
                    {url && (
                      <Image
                        src={url}
                        alt={`${branchName} timetable for ${MONTH_NAMES[m]} ${y}`}
                        width={600}
                        height={450}
                        className="tt-previous__image"
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* WhatsApp Button */}
        {branchInfo?.phone && (
          <a
            href={`https://wa.me/91${branchInfo.phone}?text=Hi, I have a question about the ${branchName} timetable.`}
            target="_blank"
            rel="noopener noreferrer"
            className="tt-whatsapp"
          >
            <span className="tt-whatsapp__icon">💬</span>
            Questions? Chat with {branchName} admin
          </a>
        )}

        {/* Back link */}
        <div className="tt-back">
          <Link href="/dojos" className="tt-back__link">
            ← View all dojos
          </Link>
        </div>
      </div>
    </div>
  )
}
