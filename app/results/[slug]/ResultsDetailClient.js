'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FaArrowLeft, FaShareAlt, FaCheck } from 'react-icons/fa'
import MedalTally from '../../components/results/MedalTally'
import ResultsTable from '../../components/results/ResultsTable'
import { TOURNAMENT_LEVEL_LABELS } from '../../../lib/types/tournament'
import '../results.css'

export default function ResultsDetailClient({ tournament }) {
  const [copied, setCopied] = useState(false)
  const t = tournament

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const handleShare = async () => {
    const url = `https://www.skfkarate.org/results/${t.slug}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
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
    <>
      {/* ── Ultra-Premium Hero ── */}
      <section className="results-hero detail-page-hero">
        <div className="detail-hero__bg">
          <div className="detail-hero__ambient-glow"></div>
        </div>

        <div className="container relative z-10 detail-hero__inner">
          <div className="detail-hero__content animate-in slide-up">
            <div className="detail-hero__meta">
              <span className={`tournament-card__level-badge tournament-card__level-badge--${t.level}`}>
                {TOURNAMENT_LEVEL_LABELS[t.level]}
              </span>
              <span className="detail-hero__separator"></span>
              <span className="detail-hero__date">
                {formatDate(t.date)}
                {t.endDate && ` – ${formatDate(t.endDate)}`}
              </span>
            </div>

            <h1 className="detail-hero__headline animate-in slide-up delay-1">{t.name}</h1>

            <p className="detail-hero__subtitle animate-in slide-up delay-2">
              <span className="detail-hero__venue-highlight">{t.venue}, {t.city}</span><br/>
              {t.description}
            </p>
          </div>

          <div className="detail-hero__floating-stats animate-in slide-up delay-3">
            <div className="detail-hero__f-stat">
              <span className="f-stat-val">{t.totalParticipants}</span>
              <span className="f-stat-lbl">Participants</span>
            </div>
            <div className="f-stat-div"></div>
            <div className="detail-hero__f-stat">
              <span className="f-stat-val">{t.skfParticipants}</span>
              <span className="f-stat-lbl">SKF Athletes</span>
            </div>
            <div className="f-stat-div"></div>
            <div className="detail-hero__f-stat">
              <span className="f-stat-val text-gradient-gold">{t.medals.gold + t.medals.silver + t.medals.bronze}</span>
              <span className="f-stat-lbl">Total Medals</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Dashboard ── */}
      <section className="tournament-dashboard">
        <div className="container relative z-10">
          <div className="tournament-dashboard__inner">
            <div className="tournament-dashboard__header">
              <h2 className="tournament-dashboard__title">Tournament Dashboard</h2>
              <p className="tournament-dashboard__subtitle">Official results and medal standings</p>
            </div>
            
            <MedalTally medals={t.medals} />
            
            <div className="tournament-dashboard__divider"></div>
            
            <ResultsTable winners={t.winners} />
          </div>
        </div>
      </section>

      {/* ── Navigation ── */}
      <section style={{ paddingBottom: '5rem' }}>
        <div className="container detail-nav animate-in fade-in delay-5">
          <Link href="/results" className="detail-nav__back">
            <FaArrowLeft /> Back to All Results
          </Link>
          <button
            className={`detail-nav__share ${copied ? 'detail-nav__share--copied' : ''}`}
            onClick={handleShare}
          >
            {copied ? <><FaCheck /> Link Copied!</> : <><FaShareAlt /> Share this page</>}
          </button>
        </div>
      </section>
    </>
  )
}
