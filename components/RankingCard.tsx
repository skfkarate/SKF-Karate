'use client'

import React, { forwardRef } from 'react'
import type { Student } from '@/types'
import { beltColors } from '@/app/_components/athlete/profile/athleteProfileData'

interface StudentRankingCardProps {
  student: Student
  goldStats: number
  silverStats: number
  bronzeStats: number
  overallRank: number
}

interface AthleteRankingCardProps {
  athleteInfo: {
    name: string
    id: string
    photo?: string
    countryFlag?: string
  }
  categories: Array<{
    name: string
    isPrimary?: boolean
    rank?: number | string | null
    points?: number | string | null
  }>
  totalG: number
  totalS: number
  totalB: number
}

type RankingCardProps = StudentRankingCardProps | AthleteRankingCardProps

function isStudentRankingCardProps(props: RankingCardProps): props is StudentRankingCardProps {
  return 'student' in props
}

export const RankingCard = forwardRef<HTMLDivElement, RankingCardProps>((props, ref) => {
  if (isStudentRankingCardProps(props)) {
    const { student, goldStats, silverStats, bronzeStats, overallRank } = props
    const beltColor =
      beltColors[student.belt.charAt(0).toUpperCase() + student.belt.slice(1)] || beltColors.White

    return (
      <div
        ref={ref}
        style={{
          width: '1080px',
          height: '1080px',
          backgroundColor: '#05080f',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: 'Inter, sans-serif',
          overflow: 'hidden',
          border: '2px solid #f39c12',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-20%',
            width: '150%',
            height: '400px',
            background: 'linear-gradient(135deg, rgba(214,40,40,0.8), rgba(214,40,40,0))',
            transform: 'rotate(-15deg)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: '80px',
            left: '80px',
            fontSize: '2.5rem',
            fontWeight: 900,
            color: '#fff',
            letterSpacing: '0.1em',
          }}
        >
          SKF <span style={{ color: 'var(--gold, #ffb703)' }}>KARATE</span>
        </div>

        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
          <div
            style={{
              width: '280px',
              height: '280px',
              borderRadius: '50%',
              background: '#0a0e16',
              margin: '0 auto 40px auto',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              border: `8px solid ${beltColor}`,
              boxShadow: `0 0 80px ${beltColor}80`,
            }}
          >
            <span style={{ fontSize: '7rem', fontWeight: 900, color: beltColor }}>
              {student.name.charAt(0)}
            </span>
          </div>

          <h1
            style={{
              fontSize: '4.5rem',
              fontWeight: 900,
              color: '#ffb703',
              margin: '0 0 10px 0',
              textTransform: 'uppercase',
              textShadow: '0 10px 30px rgba(0,0,0,0.8)',
            }}
          >
            {student.name}
          </h1>

          <p
            style={{
              fontSize: '1.8rem',
              color: 'rgba(255,255,255,0.7)',
              margin: '0 0 30px 0',
              fontWeight: 700,
              letterSpacing: '2px',
            }}
          >
            SKF ID: {student.skfId} • {student.branch.toUpperCase()}
          </p>

          <div
            style={{
              display: 'inline-block',
              background: beltColor,
              color:
                student.belt.toLowerCase() === 'white' || student.belt.toLowerCase() === 'yellow'
                  ? '#000'
                  : '#fff',
              padding: '10px 40px',
              borderRadius: '100px',
              fontSize: '1.5rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              marginBottom: '60px',
              boxShadow: `0 10px 30px rgba(0,0,0,0.5)`,
            }}
          >
            {student.belt} Belt
          </div>

          <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', marginBottom: '50px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#f1c40f',
                  border: '3px solid #f39c12',
                  boxShadow: '0 0 20px rgba(241,196,15,0.5)',
                }}
              />
              <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff' }}>
                {goldStats}{' '}
                <span style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>
                  GOLD
                </span>
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#bdc3c7',
                  border: '3px solid #95a5a6',
                  boxShadow: '0 0 20px rgba(189,195,199,0.5)',
                }}
              />
              <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff' }}>
                {silverStats}{' '}
                <span style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>
                  SILVER
                </span>
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#cd7f32',
                  border: '3px solid #a0522d',
                  boxShadow: '0 0 20px rgba(205,127,50,0.5)',
                }}
              />
              <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff' }}>
                {bronzeStats}{' '}
                <span style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>
                  BRONZE
                </span>
              </span>
            </div>
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.05)',
              padding: '20px 60px',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
              #{overallRank} OVERALL{' '}
              <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>
                — SKF RANKINGS 2026
              </span>
            </span>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '80px',
            left: '0',
            width: '100%',
            textAlign: 'center',
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '4px',
          }}
        >
          SKFKARATE.COM
        </div>
      </div>
    )
  }

  const { athleteInfo, categories, totalG, totalS, totalB } = props
  const primary = categories.find((category) => category.isPrimary) || categories[0]
  const totalMedals = totalG + totalS + totalB

  return (
    <div
      ref={ref}
      style={{
        width: '1080px',
        height: '1080px',
        background: '#04060a',
        position: 'absolute',
        top: '-9999px',
        left: '-9999px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Inter", var(--font-body), sans-serif',
        color: '#fff',
        padding: '50px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        border: '1px solid #111',
      }}
    >
      {/* Deep Background Gradients */}
      <div style={{ position: 'absolute', top: -300, left: -200, width: 1000, height: 1000, background: 'radial-gradient(circle, rgba(214,40,40,0.18) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -300, right: -200, width: 900, height: 900, background: 'radial-gradient(circle, rgba(255,183,3,0.12) 0%, rgba(0,0,0,0) 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', textAlign: 'center', fontSize: '380px', fontWeight: 900, color: 'rgba(255,255,255,0.015)', whiteSpace: 'nowrap', pointerEvents: 'none', letterSpacing: '-0.05em' }}>
        SKF
      </div>

      {/* Main Glass Panel */}
      <div
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '36px',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          padding: '50px',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 2,
          boxShadow: '0 40px 100px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading), sans-serif', color: '#ffb703', fontSize: '24px', textTransform: 'uppercase', letterSpacing: '4px', margin: 0 }}>
              SKF Karate
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: '6px 0 0 0', textTransform: 'uppercase', letterSpacing: '3px', fontWeight: 700 }}>
              Official Athlete Profile
            </p>
          </div>
          {athleteInfo.countryFlag && (
            <img src={athleteInfo.countryFlag} alt="" style={{ height: '36px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', objectFit: 'cover' }} crossOrigin="anonymous" />
          )}
        </div>

        {/* Hero Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '50px', marginBottom: '50px' }}>
          <div
            style={{
              width: '320px',
              height: '320px',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 0 0 4px rgba(255,183,3,0.2), 0 20px 50px rgba(0,0,0,0.6)',
              background: '#0a0a0a',
              flexShrink: 0,
              position: 'relative',
            }}
          >
            {athleteInfo.photo ? (
              <img
                src={athleteInfo.photo}
                alt={athleteInfo.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                crossOrigin="anonymous"
              />
            ) : null}
            <div style={{ position: 'absolute', bottom: '15px', right: '15px', background: 'rgba(0,0,0,0.7)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '14px', fontWeight: 800, color: '#fff', letterSpacing: '1px' }}>
              ID: {athleteInfo.id}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h1
              style={{
                fontSize: '85px',
                margin: '0 0 10px 0',
                fontFamily: 'var(--font-heading), sans-serif',
                textTransform: 'uppercase',
                fontWeight: 900,
                lineHeight: 0.95,
                color: '#fff',
                letterSpacing: '-1px',
                textShadow: '0 4px 20px rgba(0,0,0,0.5)',
              }}
            >
              {athleteInfo.name}
            </h1>
            <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(214,40,40,0.15)', padding: '8px 20px', borderRadius: '50px', border: '1px solid rgba(214,40,40,0.3)', marginTop: '20px', width: 'fit-content' }}>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: '18px', letterSpacing: '2px', textTransform: 'uppercase' }}>
                Elite Kumite Athlete
              </span>
            </div>
          </div>
        </div>

        {/* Data Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', flex: 1 }}>
          {/* Rank Panel */}
          <div
            style={{
              background: 'linear-gradient(145deg, rgba(255,183,3,0.08) 0%, rgba(255,255,255,0.02) 100%)',
              border: '1px solid rgba(255,183,3,0.15)',
              borderRadius: '24px',
              padding: '40px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '150px', height: '150px', background: 'rgba(255,183,3,0.15)', filter: 'blur(50px)' }} />
            
            <p style={{ margin: '0 0 15px 0', color: 'rgba(255,183,3,0.8)', fontSize: '18px', textTransform: 'uppercase', letterSpacing: '3px', fontWeight: 800 }}>
              World Ranking
            </p>
            <p style={{ margin: '0 0 10px 0', color: 'rgba(255,255,255,0.6)', fontSize: '24px', fontWeight: 600, letterSpacing: '1px' }}>
              {primary?.name}
            </p>
            <h3 style={{ margin: 0, fontSize: '110px', color: '#ffb703', fontFamily: 'var(--font-heading), sans-serif', lineHeight: 1, textShadow: '0 10px 30px rgba(255,183,3,0.2)' }}>
              {primary?.rank ? `#${primary.rank}` : '—'}
            </h3>
            <div style={{ marginTop: 'auto', paddingTop: '25px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ color: '#fff', fontSize: '32px', fontWeight: 800 }}>{primary?.points != null ? Number(primary.points).toLocaleString() : '0'}</span>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '16px', marginLeft: '10px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }}>Points</span>
            </div>
          </div>

          {/* Medals Panel */}
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '24px',
              padding: '40px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <p style={{ margin: '0 0 35px 0', color: 'rgba(255,255,255,0.5)', fontSize: '18px', textTransform: 'uppercase', letterSpacing: '3px', fontWeight: 800 }}>
              Career Honors
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #fde02f, #b8860b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '28px', fontWeight: 900, boxShadow: '0 0 20px rgba(255,215,0,0.3)' }}>{totalG}</div>
                <span style={{ color: '#fff', fontSize: '22px', fontWeight: 700 }}>Gold</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #e0e0e0, #8a8a8a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '28px', fontWeight: 900, boxShadow: '0 0 20px rgba(200,200,200,0.1)' }}>{totalS}</div>
                <span style={{ color: '#fff', fontSize: '22px', fontWeight: 700 }}>Silver</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #d4893c, #8a4b0a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '28px', fontWeight: 900, boxShadow: '0 0 20px rgba(205,127,50,0.2)' }}>{totalB}</div>
                <span style={{ color: '#fff', fontSize: '22px', fontWeight: 700 }}>Bronze</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '28px', fontWeight: 900 }}>{totalMedals}</div>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '22px', fontWeight: 700 }}>Total</span>
              </div>
            </div>
            
            <div style={{ marginTop: 'auto', textAlign: 'center', paddingTop: '20px' }}>
              <div style={{ display: 'inline-block', borderBottom: '2px solid rgba(255,183,3,0.5)', paddingBottom: '5px' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '4px' }}>SKFKARATE.ORG</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

RankingCard.displayName = 'RankingCard'
