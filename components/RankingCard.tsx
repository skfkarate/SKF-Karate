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
        background: '#05080f',
        position: 'absolute',
        top: '-9999px',
        left: '-9999px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-body), sans-serif',
        color: '#fff',
        padding: '60px',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -200,
          left: -200,
          width: 800,
          height: 800,
          background: 'radial-gradient(circle, rgba(214,40,40,0.15) 0%, rgba(0,0,0,0) 70%)',
          borderRadius: '50%',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -200,
          right: -200,
          width: 800,
          height: 800,
          background: 'radial-gradient(circle, rgba(255,183,3,0.1) 0%, rgba(0,0,0,0) 70%)',
          borderRadius: '50%',
        }}
      />

      <div
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '2px solid rgba(255,255,255,0.1)',
          borderRadius: '40px',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '60px',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 2,
          boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              color: '#ffb703',
              fontSize: '36px',
              textTransform: 'uppercase',
              letterSpacing: '4px',
              margin: 0,
            }}
          >
            SKF Karate
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '20px',
              margin: '10px 0 0 0',
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}
          >
            Official Athlete Profile
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '60px' }}>
          <div
            style={{
              width: '280px',
              height: '280px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '8px solid rgba(255,255,255,0.1)',
              marginBottom: '30px',
              background: '#111',
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
          </div>
          <h1
            style={{
              fontSize: '72px',
              margin: '0 0 10px 0',
              fontFamily: 'var(--font-heading)',
              textTransform: 'uppercase',
              fontWeight: 900,
              textAlign: 'center',
              lineHeight: 1.1,
            }}
          >
            {athleteInfo.name}
          </h1>
          <div
            style={{
              fontSize: '28px',
              color: 'rgba(255,255,255,0.6)',
              display: 'flex',
              gap: '20px',
              alignItems: 'center',
            }}
          >
            <span>{athleteInfo.id}</span>
            {athleteInfo.countryFlag ? (
              <>
                <span>•</span>
                <img src={athleteInfo.countryFlag} alt="" style={{ height: '30px' }} crossOrigin="anonymous" />
              </>
            ) : null}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', width: '100%' }}>
          <div
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,183,3,0.2)',
              borderRadius: '24px',
              padding: '40px',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                margin: '0 0 10px 0',
                color: 'rgba(255,255,255,0.5)',
                fontSize: '20px',
                textTransform: 'uppercase',
                letterSpacing: '2px',
              }}
            >
              {primary?.name}
            </p>
            <h3
              style={{
                margin: 0,
                fontSize: '80px',
                color: '#ffb703',
                fontFamily: 'var(--font-heading)',
                lineHeight: 1,
              }}
            >
              {primary?.rank ? `#${primary.rank}` : '—'}
            </h3>
            <p style={{ margin: '10px 0 0 0', color: 'rgba(255,255,255,0.8)', fontSize: '24px' }}>
              {primary?.points != null ? `${Number(primary.points).toLocaleString()} pts` : '—'}
            </p>
          </div>

          <div
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '24px',
              padding: '30px 40px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <p
              style={{
                margin: '0 0 20px 0',
                color: 'rgba(255,255,255,0.5)',
                fontSize: '20px',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                textAlign: 'center',
              }}
            >
              Career Medals
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #ffd700 0%, #b8860b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '28px', fontWeight: 'bold', margin: '0 auto 10px auto' }}>{totalG}</div>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '18px' }}>Gold</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #e0e0e0 0%, #9e9e9e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '28px', fontWeight: 'bold', margin: '0 auto 10px auto' }}>{totalS}</div>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '18px' }}>Silver</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #cd7f32 0%, #8b4513 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '28px', fontWeight: 'bold', margin: '0 auto 10px auto' }}>{totalB}</div>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '18px' }}>Bronze</span>
              </div>
              <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '20px' }}>
                <div style={{ fontSize: '48px', color: '#fff', fontWeight: 'bold', lineHeight: 1 }}>{totalMedals}</div>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '18px' }}>Total</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: '40px', color: 'rgba(255,255,255,0.4)', fontSize: '20px', letterSpacing: '2px' }}>
          skfkarate.org
        </div>
      </div>
    </div>
  )
})

RankingCard.displayName = 'RankingCard'
