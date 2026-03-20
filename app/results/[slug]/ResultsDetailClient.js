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

  const totalMedals = t.medals.gold + t.medals.silver + t.medals.bronze

  return (
    <>
      {/* ═══════════════════════════════════════════════
          SECTION 1 — IMMERSIVE HERO
         ═══════════════════════════════════════════════ */}
      <section style={{
        position: 'relative',
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: '140px 0 80px',
      }}>
        {/* Background layers */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: 'linear-gradient(155deg, var(--navy-deep) 0%, #0D0507 45%, var(--bg-body) 100%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'radial-gradient(circle at 30% 20%, rgba(214,40,40,0.06) 0%, transparent 55%), radial-gradient(circle at 70% 80%, rgba(255,183,3,0.04) 0%, transparent 50%)',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          {/* Grid: Left Content + Right Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 60,
            maxWidth: 1100,
            margin: '0 auto',
            textAlign: 'center',
          }}>

            {/* ── Content Column ── */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

              {/* Tournament Meta Tag */}
              <div className="animate-in slide-up" style={{
                display: 'inline-flex', alignItems: 'center', gap: 12,
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '10px 22px',
                borderRadius: 999,
                marginBottom: 32,
                boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
              }}>
                <span className={`tournament-card__level-badge tournament-card__level-badge--${t.level}`}>
                  {TOURNAMENT_LEVEL_LABELS[t.level]}
                </span>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--gold)', opacity: 0.5 }} />
                <span style={{
                  fontSize: 13, color: 'rgba(255,255,255,0.7)',
                  fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase',
                }}>
                  {formatDate(t.date)}{t.endDate && ` – ${formatDate(t.endDate)}`}
                </span>
              </div>

              {/* Tournament Name */}
              <h1 className="animate-in slide-up delay-1" style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(2.6rem, 6vw, 5rem)',
                fontWeight: 900,
                lineHeight: 1.05,
                marginBottom: 28,
                color: 'transparent',
                background: 'linear-gradient(to bottom right, #ffffff 30%, #8B8FA3)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 3px 20px rgba(0,0,0,0.6))',
                textWrap: 'balance',
                maxWidth: 900,
              }}>
                {t.name}
              </h1>

              {/* Venue & Description */}
              <div className="animate-in slide-up delay-2" style={{ marginBottom: 48, maxWidth: 650 }}>
                <p style={{
                  fontSize: 'clamp(1rem, 1.4vw, 1.2rem)',
                  color: 'rgba(255,255,255,0.8)',
                  fontWeight: 600,
                  letterSpacing: 0.3,
                  marginBottom: 12,
                }}>
                  {t.venue}, {t.city}
                </p>
                <p style={{
                  fontSize: 'clamp(0.9rem, 1.2vw, 1.05rem)',
                  color: 'rgba(255,255,255,0.38)',
                  lineHeight: 1.75,
                  fontWeight: 400,
                }}>
                  {t.description}
                </p>
              </div>

              {/* ── Quick Stats Row ── */}
              <div className="animate-in slide-up delay-3" style={{
                display: 'flex',
                gap: 0,
                background: 'rgba(12, 20, 42, 0.5)',
                backdropFilter: 'blur(30px)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 20,
                padding: 0,
                boxShadow: '0 16px 48px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
                overflow: 'hidden',
              }}>
                {[
                  { val: t.totalParticipants, label: 'Participants', gradient: false },
                  { val: t.skfParticipants, label: 'SKF Athletes', gradient: false },
                  { val: totalMedals, label: 'Total Medals', gradient: true },
                ].map((stat, i) => (
                  <div key={stat.label} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    padding: '28px 48px',
                    borderRight: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    gap: 6,
                    minWidth: 140,
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
                      fontWeight: 900,
                      lineHeight: 1,
                      ...(stat.gradient
                        ? {
                          background: 'linear-gradient(135deg, #facc15, #fb923c)',
                          WebkitBackgroundClip: 'text', backgroundClip: 'text',
                          color: 'transparent'
                        }
                        : { color: '#fff' }),
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
                    }}>
                      {stat.val}
                    </span>
                    <span style={{
                      fontSize: 11, color: 'rgba(255,255,255,0.35)',
                      textTransform: 'uppercase', letterSpacing: 2.5, fontWeight: 700,
                    }}>
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* ── Quick Actions ── */}
              <div className="animate-in slide-up delay-4" style={{
                display: 'flex', gap: 16, marginTop: 32, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center',
              }}>
                <Link href="/results" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '12px 24px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: 13, fontWeight: 700,
                  letterSpacing: 1, textTransform: 'uppercase',
                  textDecoration: 'none',
                  transition: 'all 0.25s ease',
                }}>
                  <FaArrowLeft size={12} /> All Results
                </Link>
                <button
                  onClick={handleShare}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '12px 24px', borderRadius: 10,
                    background: copied ? 'rgba(76,175,80,0.15)' : 'rgba(255,183,3,0.08)',
                    border: `1px solid ${copied ? 'rgba(76,175,80,0.3)' : 'rgba(255,183,3,0.2)'}`,
                    color: copied ? '#4caf50' : 'var(--gold)',
                    fontSize: 13, fontWeight: 700,
                    letterSpacing: 1, textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                  }}
                >
                  {copied ? <><FaCheck size={12} /> Copied!</> : <><FaShareAlt size={12} /> Share</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════
          SECTION 2 — TOURNAMENT DASHBOARD
         ═══════════════════════════════════════════════ */}
      <section style={{
        padding: '0 0 100px',
        position: 'relative',
        background: 'linear-gradient(180deg, var(--bg-body) 0%, rgba(5,8,16,1) 100%)',
      }}>
        {/* Ambient glow */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 1200, height: 400,
          background: 'radial-gradient(ellipse at center top, rgba(255,183,3,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          {/* Dashboard Card */}
          <div style={{
            background: 'linear-gradient(180deg, rgba(15,23,42,0.65) 0%, rgba(8,11,20,0.75) 100%)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderTop: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 32,
            padding: 'clamp(2rem, 4vw, 3.5rem)',
            boxShadow: '0 30px 60px -15px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.03)',
            overflow: 'hidden',
            position: 'relative',
          }}>
            {/* Inner glow */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 400,
              background: 'radial-gradient(ellipse at 50% -20%, rgba(255,255,255,0.025) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 3vw, 3rem)', position: 'relative' }}>
              <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(1.6rem, 2.5vw, 2rem)',
                fontWeight: 800,
                color: '#fff',
                lineHeight: 1.2,
                marginBottom: 8,
              }}>
                Tournament Dashboard
              </h2>
              <p style={{
                fontSize: 13, color: 'rgba(255,255,255,0.3)',
                textTransform: 'uppercase', letterSpacing: 2.5, fontWeight: 600,
              }}>
                Official Results & Medal Standings
              </p>
            </div>

            {/* Medal Tally */}
            <MedalTally medals={t.medals} />

            {/* Divider */}
            <div style={{
              height: 1, width: '100%',
              background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)',
              margin: 'clamp(2rem, 3vw, 3.5rem) 0',
            }} />

            {/* Results Table */}
            <ResultsTable winners={t.winners} />
          </div>
        </div>
      </section>
    </>
  )
}
