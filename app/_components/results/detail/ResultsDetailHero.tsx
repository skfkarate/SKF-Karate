'use client'

import Link from 'next/link'
import { useState } from 'react'
import { FaArrowLeft, FaCheck, FaShareAlt } from 'react-icons/fa'
import { TOURNAMENT_LEVEL_LABELS } from '@/lib/types/tournament'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function ResultsDetailHero({ tournament }) {
  const [copied, setCopied] = useState(false)
  const totalMedals = tournament.medals.gold + tournament.medals.silver + tournament.medals.bronze

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
    <section
      style={{
        position: 'relative',
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: '140px 0 80px',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          background: 'linear-gradient(155deg, var(--navy-deep) 0%, #0D0507 45%, var(--bg-body) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background:
            'radial-gradient(circle at 30% 20%, rgba(214,40,40,0.06) 0%, transparent 55%), radial-gradient(circle at 70% 80%, rgba(255,183,3,0.04) 0%, transparent 50%)',
          pointerEvents: 'none',
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 60,
            maxWidth: 1100,
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              className="animate-in slide-up"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '10px 22px',
                borderRadius: 999,
                marginBottom: 32,
                boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
              }}
            >
              <span
                className={`tournament-card__level-badge tournament-card__level-badge--${tournament.level}`}
              >
                {TOURNAMENT_LEVEL_LABELS[tournament.level]}
              </span>
              <span
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: 'var(--gold)',
                  opacity: 0.5,
                }}
              />
              <span
                style={{
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.7)',
                  fontWeight: 600,
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                }}
              >
                {formatDate(tournament.date)}
                {tournament.endDate ? ` – ${formatDate(tournament.endDate)}` : ''}
              </span>
            </div>

            <h1
              className="animate-in slide-up delay-1"
              style={{
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
              }}
            >
              {tournament.name}
            </h1>

            <div className="animate-in slide-up delay-2" style={{ marginBottom: 48, maxWidth: 650 }}>
              <p
                style={{
                  fontSize: 'clamp(1rem, 1.4vw, 1.2rem)',
                  color: 'rgba(255,255,255,0.8)',
                  fontWeight: 600,
                  letterSpacing: 0.3,
                  marginBottom: 12,
                }}
              >
                {tournament.venue}, {tournament.city}
              </p>
              <p
                style={{
                  fontSize: 'clamp(0.9rem, 1.2vw, 1.05rem)',
                  color: 'rgba(255,255,255,0.38)',
                  lineHeight: 1.75,
                  fontWeight: 400,
                }}
              >
                {tournament.description}
              </p>
            </div>

            <div
              className="animate-in slide-up delay-3"
              style={{
                display: 'flex',
                gap: 0,
                background: 'rgba(12, 20, 42, 0.5)',
                backdropFilter: 'blur(30px)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 20,
                padding: 0,
                boxShadow:
                  '0 16px 48px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
                overflow: 'hidden',
              }}
            >
              {[
                { val: tournament.totalParticipants, label: 'Participants', gradient: false },
                { val: tournament.skfParticipants, label: 'SKF Athletes', gradient: false },
                { val: totalMedals, label: 'Total Medals', gradient: true },
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '28px 48px',
                    borderRight: index < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    gap: 6,
                    minWidth: 140,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
                      fontWeight: 900,
                      lineHeight: 1,
                      ...(stat.gradient
                        ? {
                            background: 'linear-gradient(135deg, #facc15, #fb923c)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            color: 'transparent',
                          }
                        : { color: '#fff' }),
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
                    }}
                  >
                    {stat.val}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: 'rgba(255,255,255,0.35)',
                      textTransform: 'uppercase',
                      letterSpacing: 2.5,
                      fontWeight: 700,
                    }}
                  >
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            <div
              className="animate-in slide-up delay-4"
              style={{
                display: 'flex',
                gap: 16,
                marginTop: 32,
                alignItems: 'center',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              <Link
                href="/results"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 24px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  transition: 'all 0.25s ease',
                }}
              >
                <FaArrowLeft size={12} /> All Results
              </Link>
              <button
                onClick={handleShare}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 24px',
                  borderRadius: 10,
                  background: copied ? 'rgba(76,175,80,0.15)' : 'rgba(255,183,3,0.08)',
                  border: `1px solid ${copied ? 'rgba(76,175,80,0.3)' : 'rgba(255,183,3,0.2)'}`,
                  color: copied ? '#4caf50' : 'var(--gold)',
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                }}
              >
                {copied ? (
                  <>
                    <FaCheck size={12} /> Copied!
                  </>
                ) : (
                  <>
                    <FaShareAlt size={12} /> Share
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
