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
            // Ease-out cubic for smooth deceleration
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

  async function handleShare() {
    const url = `https://www.skfkarate.org/results/${tournament.slug}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = url
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <section className="td-hero">
      <div className="td-hero__inner container">
        {/* ── Back nav ── */}
        <Link href="/results" className="td-hero__back">
          <FaArrowLeft size={10} /> All Results
        </Link>

        {/* ── Badge row ── */}
        <div className="td-hero__badge-row">
          <span className={`tournament-card__level-badge tournament-card__level-badge--${tournament.level}`}>
            {TOURNAMENT_LEVEL_LABELS[tournament.level]}
          </span>
          <span className="td-hero__dot" />
          <span className="td-hero__date">
            {formatDate(tournament.date)}
            {tournament.endDate ? ` – ${formatDate(tournament.endDate)}` : ''}
          </span>
        </div>

        {/* ── Title ── */}
        <h1 className="td-hero__title">{tournament.name}</h1>

        {/* ── Venue ── */}
        <p className="td-hero__venue">
          {tournament.venue}, {tournament.city}
        </p>

        {/* ── Stats + Medals unified bar ── */}
        <div className="td-hero__stats-bar">
          <div className="td-stat">
            <span className="td-stat__val">
              <AnimatedCounter target={tournament.totalParticipants} />
            </span>
            <span className="td-stat__lbl">Athletes</span>
          </div>
          <div className="td-stat-div" />
          <div className="td-stat">
            <span className="td-stat__val">
              <AnimatedCounter target={tournament.skfParticipants} />
            </span>
            <span className="td-stat__lbl">SKF</span>
          </div>
          <div className="td-stat-div" />
          <div className="td-stat td-stat--medal">
            <span className="td-stat__val td-stat__val--gold">
              <AnimatedCounter target={tournament.medals.gold} duration={1000} />
            </span>
            <span className="td-stat__lbl">🥇 Gold</span>
          </div>
          <div className="td-stat-div" />
          <div className="td-stat td-stat--medal">
            <span className="td-stat__val td-stat__val--silver">
              <AnimatedCounter target={tournament.medals.silver} duration={1000} />
            </span>
            <span className="td-stat__lbl">🥈 Silver</span>
          </div>
          <div className="td-stat-div" />
          <div className="td-stat td-stat--medal">
            <span className="td-stat__val td-stat__val--bronze">
              <AnimatedCounter target={tournament.medals.bronze} duration={1000} />
            </span>
            <span className="td-stat__lbl">🥉 Bronze</span>
          </div>

          <div className="td-stat-div" />
          <button
            onClick={handleShare}
            className="td-hero__share"
          >
            {copied ? <><FaCheck size={11} /> Copied</> : <><FaShareAlt size={11} /> Share</>}
          </button>
        </div>
      </div>
    </section>
  )
}
