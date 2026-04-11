'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import type { Student, TournamentRow, AttendanceRow } from '@/types'
import { beltColors } from '@/app/_components/athlete/profile/athleteProfileData'
import { RankingCard } from '@/components/RankingCard'
import { generateRankingCard } from '@/lib/rankingCard/generateCard'
import { FaTrophy, FaArrowRight, FaDownload, FaCertificate } from 'react-icons/fa'

interface ProfileClientProps {
  student: Student
  tournaments: TournamentRow[]
  attendance: AttendanceRow[]
  enrollments: any[]
}

const beltsArray = ['White', 'Yellow', 'Orange', 'Green', 'Blue', 'Purple', 'Brown', 'Black']

export default function ProfileClient({ student, tournaments, attendance, enrollments }: ProfileClientProps) {
  const rankingCardRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

  const beltColor = beltColors[student.belt.charAt(0).toUpperCase() + student.belt.slice(1)] || beltColors.White
  const beltIdx = beltsArray.findIndex(b => b.toLowerCase() === student.belt.toLowerCase())

  // Tournament calculations
  let goldStats = 0, silverStats = 0, bronzeStats = 0
  tournaments.forEach(t => {
    if (t.result === 'Gold') goldStats++
    if (t.result === 'Silver') silverStats++
    if (t.result === 'Bronze') bronzeStats++
  })

  // Attendance metrics
  const attendedCount = attendance.filter(a => a.status === 'Present').length
  const totalClasses = 9
  const percent = Math.round((attendedCount / totalClasses) * 100) || 0
  const calendarDays = Array.from({ length: totalClasses }, (_, i) => {
    const record = attendance[i]
    if (!record) return 'future'
    return record.status === 'Present' ? 'present' : 'absent'
  })

  // Overall Mock rank logic
  const mockOverallRank = 142

  const handleDownloadCard = async () => {
    if (!rankingCardRef.current) return
    setDownloading(true)
    try {
      await generateRankingCard(rankingCardRef.current, student.name)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div style={{ paddingBottom: '4rem' }}>
      
      {/* Off-screen Ranking Card Container */}
      <div style={{ position: 'fixed', top: '-10000px', left: '-1000px', zIndex: -999, overflow: 'hidden' }}>
        <RankingCard 
          ref={rankingCardRef} 
          student={student}
          goldStats={goldStats}
          silverStats={silverStats}
          bronzeStats={bronzeStats}
          overallRank={mockOverallRank}
        />
      </div>

      {/* SEC 1: IDENTITY CARD */}
      <section style={{ 
        background: 'rgba(10, 14, 22, 0.6)', 
        border: '1px solid rgba(255, 255, 255, 0.05)', 
        borderRadius: '24px', 
        padding: '2.5rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        marginBottom: '2rem',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: beltColor, boxShadow: `0 0 20px ${beltColor}` }}></div>
        
        <div style={{ 
          width: '120px', height: '120px', borderRadius: '50%', background: '#05080f', 
          border: `4px solid ${beltColor}`, boxShadow: `0 0 30px ${beltColor}60`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem',
          fontSize: '3rem', fontWeight: 900, color: beltColor, textTransform: 'uppercase'
        }}>
          {student.name.charAt(0)}
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', margin: '0 0 0.5rem 0' }}>{student.name}</h1>
        <p style={{ color: 'var(--crimson)', fontSize: '1.2rem', fontWeight: 700, margin: '0 0 1.5rem 0', letterSpacing: '1px' }}>{student.skfId}</p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '50px', fontSize: '0.85rem' }}>{student.branch} Branch</span>
          <span style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '50px', fontSize: '0.85rem' }}>{student.batch} Batch</span>
          <span style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '50px', fontSize: '0.85rem', color: beltColor }}>{student.belt} Belt</span>
        </div>
      </section>

      {/* SEC 2: BELT PROGRESS TIMELINE */}
      <section className="portal-stat-card" style={{ marginBottom: '2rem' }}>
        <h2 className="portal-stat-label" style={{ marginBottom: '2rem' }}>Belt Progression</h2>
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'absolute', top: '50%', left: '0', right: '0', height: '4px', background: 'rgba(255,255,255,0.1)', transform: 'translateY(-50%)', zIndex: 0 }}></div>
          {beltsArray.map((belt, idx) => {
            const isActive = idx === beltIdx
            const isPast = idx < beltIdx
            const currBeltColor = beltColors[belt] || beltColors.White
            return (
              <div key={belt} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: isPast || isActive ? 1 : 0.3 }}>
                <div style={{ 
                  width: isActive ? '24px' : '16px', height: isActive ? '24px' : '16px', borderRadius: '50%', 
                  background: currBeltColor, border: `2px solid ${isPast || isActive ? currBeltColor : 'rgba(255,255,255,0.2)'}`,
                  boxShadow: isActive ? `0 0 15px ${currBeltColor}` : 'none'
                }}></div>
                {isActive && (
                  <span style={{ position: 'absolute', top: '30px', fontSize: '0.7rem', color: currBeltColor, fontWeight: 700, textTransform: 'uppercase' }}>
                    Current
                  </span>
                )}
                {idx === beltIdx + 1 && (
                  <span style={{ position: 'absolute', top: '30px', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                    Next Grading
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        
        {/* SEC 3: ACHIEVEMENTS */}
        <section className="portal-stat-card">
          <h2 className="portal-stat-label" style={{ marginBottom: '1.5rem' }}>Achievements</h2>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ flex: 1, textAlign: 'center', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '16px' }}>
              <div style={{ color: '#f1c40f', fontSize: '1.5rem', fontWeight: 800 }}>{goldStats}</div>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Gold</span>
            </div>
            <div style={{ flex: 1, textAlign: 'center', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '16px' }}>
              <div style={{ color: '#bdc3c7', fontSize: '1.5rem', fontWeight: 800 }}>{silverStats}</div>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Silver</span>
            </div>
            <div style={{ flex: 1, textAlign: 'center', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '16px' }}>
              <div style={{ color: '#cd7f32', fontSize: '1.5rem', fontWeight: 800 }}>{bronzeStats}</div>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Bronze</span>
            </div>
          </div>
          <Link href={`/athlete/${student.skfId}`} className="btn btn-outline" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', width: '100%', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}>
            View Full Public Profile <FaArrowRight />
          </Link>
        </section>

        {/* SEC 4: ATTENDANCE */}
        <section className="portal-stat-card">
          <h2 className="portal-stat-label" style={{ marginBottom: '1.5rem' }}>Attendance (This Month)</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '1.5rem' }}>
            {calendarDays.map((status, i) => (
              <div key={i} style={{ 
                width: '32px', height: '32px', borderRadius: '50%', 
                background: status === 'present' ? 'rgba(46, 213, 115, 0.2)' : status === 'absent' ? 'rgba(214, 40, 40, 0.2)' : 'rgba(255,255,255,0.05)',
                border: `2px solid ${status === 'present' ? '#2ed573' : status === 'absent' ? 'var(--crimson)' : 'transparent'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)'
              }}>
                {i+1}
              </div>
            ))}
          </div>
          <p style={{ color: '#fff', fontSize: '0.9rem', margin: 0 }}>
            <span style={{ color: '#2ed573', fontWeight: 800, fontSize: '1.2rem' }}>{attendedCount}</span> of {totalClasses} classes attended ({percent}%)
          </p>
        </section>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* SEC 5: CERTIFICATES */}
        <section className="portal-stat-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
           <h2 className="portal-stat-label" style={{ marginBottom: '1rem' }}>Certificates</h2>
           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
             <FaCertificate size={40} color="var(--gold)" />
             <div>
               <span style={{ display: 'block', fontSize: '1.5rem', color: '#fff', fontWeight: 800 }}>{enrollments.length} Available</span>
             </div>
           </div>
           <Link href="/portal/certificates" className="btn btn-outline" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', width: '100%', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}>
             View Certificates <FaArrowRight />
           </Link>
        </section>

        {/* SEC 6: DOWNLOAD RANKING CARD */}
        <section className="portal-stat-card" style={{ background: 'linear-gradient(135deg, rgba(214, 40, 40, 0.1) 0%, rgba(214, 40, 40, 0.05) 100%)', borderColor: 'rgba(214, 40, 40, 0.2)' }}>
          <h2 className="portal-stat-label" style={{ marginBottom: '1rem', color: '#fff' }}>Social Ranking Card</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Download an official SKF Karate ranking card customized with your belt and achievements. Perfect for sharing on Instagram or WhatsApp!
          </p>
          <button 
            onClick={handleDownloadCard} 
            disabled={downloading}
            className="btn" 
            style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', background: '#fff', color: 'var(--crimson)' }}
          >
            {downloading ? 'Capturing Rank...' : 'Download Ranking Card'} <FaDownload />
          </button>
        </section>

      </div>

    </div>
  )
}
