'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { FaArrowLeft, FaCheck, FaShareAlt } from 'react-icons/fa'
import { TOURNAMENT_LEVEL_LABELS } from '@/lib/types/tournament'

function AnimatedCounter({ target, duration = 1400, suffix = '' }) {
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

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function ResultsDetailHero({ tournament }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  return (
    <>
      <section className="res-hero res-hero--detail">
        <Link href="/results" className="res-detail-back">
          <FaArrowLeft size={10} /> All Results
        </Link>

        <div className="res-hero__badge animate-in">
          <span className={`tournament-card__level-badge tournament-card__level-badge--${tournament.level}`} style={{ border: 'none', background: 'transparent', padding: 0 }}>
            {TOURNAMENT_LEVEL_LABELS[tournament.level]}
          </span>
          <span className="res-hero__badge-dot" />
          {formatDate(tournament.date)}
        </div>
        
        <h1 className="res-hero__title animate-in delay-1">
          <span className="res-hero__line1">{tournament.name}</span>
        </h1>
        
        <p className="res-hero__sub animate-in delay-2">
          {tournament.venue}, {tournament.city}
        </p>
      </section>

      <section className="res-detail-body animate-in delay-3">
        <div className="res-top-stats">
          <div className="res-stat-card">
            <span className="res-stat-val"><AnimatedCounter target={tournament.totalParticipants} /></span>
            <span className="res-stat-label">Athletes</span>
          </div>
          <div className="res-stat-card res-stat-card--gold">
            <span className="res-stat-val"><AnimatedCounter target={tournament.skfParticipants} /></span>
            <span className="res-stat-label">SKF Team</span>
          </div>
        </div>

        <div className="res-podium">
          <div className="res-pod">
            <div className="res-pod__photo res-pod__photo--silver">🥈</div>
            <h3 className="res-pod__name">Silver</h3>
            <div className="res-pod__pillar res-pod__pillar--silver">
              <span><AnimatedCounter target={tournament.medals.silver} /></span>
            </div>
          </div>
          <div className="res-pod">
            <div className="res-pod__photo res-pod__photo--gold">🥇</div>
            <h3 className="res-pod__name">Gold</h3>
            <div className="res-pod__pillar res-pod__pillar--gold">
              <span><AnimatedCounter target={tournament.medals.gold} /></span>
            </div>
          </div>
          <div className="res-pod">
            <div className="res-pod__photo res-pod__photo--bronze">🥉</div>
            <h3 className="res-pod__name">Bronze</h3>
            <div className="res-pod__pillar res-pod__pillar--bronze">
              <span><AnimatedCounter target={tournament.medals.bronze} /></span>
            </div>
          </div>
        </div>
        
        <div className="res-detail-share">
          <button onClick={handleShare} className="detail-nav__share">
            {copied ? <><FaCheck size={11} /> Copied</> : <><FaShareAlt size={11} /> Share Results</>}
          </button>
        </div>
      </section>
    </>
  )
}
