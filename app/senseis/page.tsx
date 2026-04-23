import Link from 'next/link'
import { FaArrowRight, FaQuoteLeft, FaTrophy } from 'react-icons/fa'
import { GiBlackBelt, GiKatana, GiMeditation, GiPunch, GiYinYang } from 'react-icons/gi'
import type { ReactNode } from 'react'

import { getPublicSenseisLive } from '@/lib/server/repositories/senseis-live'

import './senseis.css'

export const dynamic = 'force-dynamic'

function getSenseiIcon(slug: string, accent: string): ReactNode {
  if (slug.includes('akira')) return <GiKatana />
  if (slug.includes('meera')) return <GiYinYang />
  if (slug.includes('arjun')) return <GiPunch />
  if (slug.includes('priya')) return <GiMeditation />
  if (accent === 'blue') return <GiYinYang />
  return <GiBlackBelt />
}

export default async function SenseisPage() {
  const allSenseis = await getPublicSenseisLive()

  return (
    <div className="senseis-page">
      <section className="page-hero sensei-hero">
        <div className="page-hero__bg"></div>
        <div className="container page-hero__content">
          <span className="section-label hero-label-pulse">
            <GiBlackBelt /> Guardians of the Art
          </span>
          <h1 className="page-hero__title">
            Meet Our <span className="text-gradient">Senseis</span>
          </h1>
          <p className="page-hero__subtitle">
            Architects of discipline, engineers of strength, and crafters of unyielding spirit.
            Train under the guidance of absolute mastery.
          </p>
        </div>
      </section>

      <div className="masters-list">
        {allSenseis.map((master, idx) => {
          const isReverse = idx % 2 !== 0
          const tintClass =
            idx % 3 === 0 ? 'section--tint-cool' : idx % 3 === 1 ? 'section--tint-mid' : 'section--tint-warm'
          const ringClass =
            master.accent === 'crimson'
              ? 'spotlight-avatar-ring--crimson'
              : master.accent === 'blue'
                ? 'spotlight-avatar-ring--blue'
                : 'spotlight-avatar-ring--gold'
          const primaryAssignment = master.assignments[0] || null
          const primaryLocation = primaryAssignment
            ? `${primaryAssignment.branchName} (${primaryAssignment.cityName})`
            : 'SKF Karate'
          const assignmentHref = primaryAssignment
            ? `/classes/${primaryAssignment.citySlug}/${primaryAssignment.branchSlug}`
            : '/classes'

          return (
            <section key={master.id} className={`section spotlight-section ${tintClass}`}>
              <div className="container">
                <div className={`spotlight-card ${isReverse ? 'spotlight-card--reverse' : ''}`}>
                  <div className="spotlight-card__visual">
                    <div className={`spotlight-avatar-ring ${ringClass}`}>
                      <div className="spotlight-avatar">
                        {getSenseiIcon(master.slug, master.accent)}
                      </div>
                    </div>
                    <div className="spotlight-badge">
                      <span className="spotlight-badge__rank">{master.dan}</span>
                    </div>
                  </div>

                  <div className="spotlight-card__content">
                    <span className="spotlight-role">{master.role || master.title}</span>
                    <h2 className="spotlight-name">{master.name}</h2>

                    {master.quote ? (
                      <blockquote className="spotlight-quote">
                        <FaQuoteLeft className="spotlight-quote-icon" />
                        {master.quote}
                      </blockquote>
                    ) : null}

                    <div className="spotlight-stats">
                      <div className="spotlight-stat">
                        <strong className="text-gold">Specialty</strong>
                        <span>{master.specialty || 'General Karate'}</span>
                      </div>
                      <div className="spotlight-stat">
                        <strong className="text-gold">Experience</strong>
                        <span>{master.experience || 'SKF Coaching Team'}</span>
                      </div>
                      <div className="spotlight-stat">
                        <strong className="text-gold">Training Centre</strong>
                        <span>
                          <Link href={assignmentHref} className="link-underline border-white">
                            {primaryLocation}
                          </Link>
                        </span>
                      </div>
                    </div>

                    <div className="spotlight-achievements">
                      <strong>
                        <FaTrophy className="text-gold mr-half" /> Legacy & Honors
                      </strong>
                      <p>
                        {master.achievements.length > 0
                          ? master.achievements.join(' • ')
                          : master.description}
                      </p>
                    </div>

                    <div className="spotlight-action">
                      <Link href={`/senseis/${master.slug}`} className="btn btn-primary btn--outline profile-btn">
                        View Full Profile <FaArrowRight />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )
        })}
      </div>

      <section className="section sensei-cta section--tint-cool">
        <div className="container">
          <div className="sensei-cta__card glass-card">
            <div className="sensei-cta__bg-glow"></div>
            <h2 className="section-title">Step Onto The Mat</h2>
            <p className="section-subtitle sensei-cta__subtitle">
              The master has walked the path a thousand times. Now, it is your turn to take the
              first step. Find a class near you and begin your journey.
            </p>
            <div className="sensei-cta__actions">
              <Link href="/classes" className="btn btn-primary">
                Find Your Class <FaArrowRight />
              </Link>
              <Link href="/contact" className="btn btn-secondary">
                Contact Administration
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
