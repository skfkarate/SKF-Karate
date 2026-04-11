'use client'

import { useEffect, useRef, useState } from 'react'
import { FaTrophy, FaStar } from 'react-icons/fa'

function AnimatedCounter({ target, duration = 2000 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          let start = 0
          const increment = target / (duration / 16)
          const timer = setInterval(() => {
            start += increment
            if (start >= target) {
              setCount(target)
              clearInterval(timer)
            } else {
              setCount(Math.floor(start))
            }
          }, 16)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return <span ref={ref}>{count}+</span>
}

export default function TournamentHero({ stats }) {
  return (
    <section className="results-hero">
      <div className="results-hero__bg">
        <div className="glow glow-red results-hero__glow-1"></div>
        <div className="glow glow-gold results-hero__glow-2"></div>
      </div>

      <div className="container results-hero__content">
        <span className="section-label animate-in">
          <FaTrophy /> Championship Legacy
        </span>

        <h1 className="page-hero__title animate-in delay-1">
          Our <span className="text-gradient">Tournament Record</span>
        </h1>

        <p className="page-hero__subtitle animate-in delay-2">
          From district podiums to national glory — every medal SKF has earned, preserved forever.
        </p>

        <div className="results-hero__stats animate-in delay-3">
          <div className="results-hero__stat">
            <span className="results-hero__stat-number">
              <AnimatedCounter target={stats.totalTournaments} />
            </span>
            <span className="results-hero__stat-label">Tournaments</span>
          </div>
          <div className="results-hero__stat">
            <span className="results-hero__stat-number">
              <AnimatedCounter target={stats.totalGold} />
            </span>
            <span className="results-hero__stat-label">Gold Medals</span>
          </div>
          <div className="results-hero__stat">
            <span className="results-hero__stat-number">
              <AnimatedCounter target={stats.totalSilver} />
            </span>
            <span className="results-hero__stat-label">Silver Medals</span>
          </div>
          <div className="results-hero__stat">
            <span className="results-hero__stat-number">
              <AnimatedCounter target={stats.totalBronze} />
            </span>
            <span className="results-hero__stat-label">Bronze Medals</span>
          </div>
          <div className="results-hero__stat">
            <span className="results-hero__stat-number">
              <AnimatedCounter target={stats.nationalChampions} />
            </span>
            <span className="results-hero__stat-label">National Champions</span>
          </div>
        </div>

        <div className="results-hero__affiliations animate-in delay-4">
          <div className="results-hero__logos">
            <span className="results-hero__logo-badge">WKF</span>
            <span className="results-hero__logo-badge">KIO</span>
            <span className="results-hero__logo-badge">AKSKA</span>
          </div>
          <span className="results-hero__affiliations-caption">
            Results recognised by our affiliated bodies
          </span>
        </div>
      </div>
    </section>
  )
}
