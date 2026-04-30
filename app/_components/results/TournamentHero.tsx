'use client'

import { useEffect, useRef, useState } from 'react'

function AnimatedCounter({ target, duration = 1800, suffix = '+' }: { target: number, duration?: number, suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const startTime = performance.now()
          const animate = (now) => {
            const elapsed = now - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * target))
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return <span ref={ref}>{count}{suffix}</span>
}

export default function TournamentHero({ stats }) {
  return (
    <>
      <section className="res-hero">
        <div className="res-hero__badge animate-in">
          <span className="res-hero__badge-dot" /> Championship Legacy
        </div>
        <h1 className="res-hero__title animate-in delay-1">
          <span className="res-hero__line1">Tournament</span>
          <span className="res-hero__line2">Results</span>
        </h1>
        <p className="res-hero__sub animate-in delay-2">
          From district podiums to national glory — every medal SKF has earned, preserved forever.
        </p>
      </section>

      <section className="res-section animate-in delay-3">
        <div className="res-section__header">
          <span className="res-section__tag">📊 At a Glance</span>
          <h2 className="res-section__title">All-Time Statistics</h2>
          <p className="res-section__sub">
            A combined total of {stats.totalTournaments} tournaments participated and {stats.nationalChampions} national champions produced.
          </p>
        </div>
        
        <div className="res-podium">
          <div className="res-pod">
            <div className="res-pod__photo res-pod__photo--silver">🥈</div>
            <h3 className="res-pod__name">Silver</h3>
            <div className="res-pod__pillar res-pod__pillar--silver">
              <span><AnimatedCounter target={stats.totalSilver} /></span>
            </div>
          </div>

          <div className="res-pod">
            <div className="res-pod__photo res-pod__photo--gold">🥇</div>
            <h3 className="res-pod__name">Gold</h3>
            <div className="res-pod__pillar res-pod__pillar--gold">
              <span><AnimatedCounter target={stats.totalGold} /></span>
            </div>
          </div>
          
          <div className="res-pod">
            <div className="res-pod__photo res-pod__photo--bronze">🥉</div>
            <h3 className="res-pod__name">Bronze</h3>
            <div className="res-pod__pillar res-pod__pillar--bronze">
              <span><AnimatedCounter target={stats.totalBronze} /></span>
            </div>
          </div>
        </div>

        <div className="res-section__affiliations">
          <span className="res-section__affiliations-caption">Recognised By</span>
          <div className="res-section__logos">
            <span className="res-section__logo-badge">WKF</span>
            <span className="res-section__logo-badge">KIO</span>
            <span className="res-section__logo-badge">AKSKA</span>
          </div>
        </div>
      </section>
    </>
  )
}
