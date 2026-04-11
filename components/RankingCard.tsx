'use client'

import React, { forwardRef } from 'react'
import type { Student } from '@/types'
import { beltColors } from '@/app/_components/athlete/profile/athleteProfileData'

interface RankingCardProps {
  student: Student
  goldStats: number
  silverStats: number
  bronzeStats: number
  overallRank: number
}

// Ensure html2canvas captures accurately by keeping styling inline and robust
export const RankingCard = forwardRef<HTMLDivElement, RankingCardProps>(({ student, goldStats, silverStats, bronzeStats, overallRank }, ref) => {
  const beltColor = beltColors[student.belt.charAt(0).toUpperCase() + student.belt.slice(1)] || beltColors.White

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
        boxSizing: 'border-box'
      }}
    >
      {/* Crimson Diagonal Splash */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        right: '-20%',
        width: '150%',
        height: '400px',
        background: 'linear-gradient(135deg, rgba(214,40,40,0.8), rgba(214,40,40,0))',
        transform: 'rotate(-15deg)',
        pointerEvents: 'none'
      }}></div>

      {/* Header Logo Mock (Ideally a real base64 / img url to avoid CORS issues) */}
      <div style={{ position: 'absolute', top: '80px', left: '80px', fontSize: '2.5rem', fontWeight: 900, color: '#fff', letterSpacing: '0.1em' }}>
        SKF <span style={{ color: 'var(--gold, #ffb703)' }}>KARATE</span>
      </div>

      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
        {/* Profile Circle Glow Wrapper */}
        <div style={{ 
          width: '280px', height: '280px', borderRadius: '50%', background: '#0a0e16',
          margin: '0 auto 40px auto', display: 'flex', justifyContent: 'center', alignItems: 'center',
          border: `8px solid ${beltColor}`, boxShadow: `0 0 80px ${beltColor}80`
        }}>
          <span style={{ fontSize: '7rem', fontWeight: 900, color: beltColor }}>{student.name.charAt(0)}</span>
        </div>

        <h1 style={{ fontSize: '4.5rem', fontWeight: 900, color: '#ffb703', margin: '0 0 10px 0', textTransform: 'uppercase', textShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
          {student.name}
        </h1>
        
        <p style={{ fontSize: '1.8rem', color: 'rgba(255,255,255,0.7)', margin: '0 0 30px 0', fontWeight: 700, letterSpacing: '2px' }}>
          SKF ID: {student.skfId} • {student.branch.toUpperCase()}
        </p>

        <div style={{ display: 'inline-block', background: beltColor, color: student.belt.toLowerCase() === 'white' || student.belt.toLowerCase() === 'yellow' ? '#000' : '#fff', padding: '10px 40px', borderRadius: '100px', fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '60px', boxShadow: `0 10px 30px rgba(0,0,0,0.5)` }}>
          {student.belt} Belt
        </div>

        {/* Medal Row */}
        <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', marginBottom: '50px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
             <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1c40f', border: '3px solid #f39c12', boxShadow: '0 0 20px rgba(241,196,15,0.5)' }}></div>
             <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff' }}>{goldStats} <span style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>GOLD</span></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
             <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#bdc3c7', border: '3px solid #95a5a6', boxShadow: '0 0 20px rgba(189,195,199,0.5)' }}></div>
             <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff' }}>{silverStats} <span style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>SILVER</span></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
             <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#cd7f32', border: '3px solid #a0522d', boxShadow: '0 0 20px rgba(205,127,50,0.5)' }}></div>
             <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff' }}>{bronzeStats} <span style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>BRONZE</span></span>
          </div>
        </div>

        {/* Dynamic Rank Text */}
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px 60px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>#{overallRank} OVERALL <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>— SKF RANKINGS 2026</span></span>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '80px', left: '0', width: '100%', textAlign: 'center', fontSize: '1.5rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: '4px' }}>
        SKFKARATE.COM
      </div>
    </div>
  )
})

RankingCard.displayName = 'RankingCard'
