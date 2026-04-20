'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Medal, ChevronRight, Award } from 'lucide-react'
import { usePortalAuth } from '@/app/_components/portal/usePortalAuth'

const MOCK_HISTORY = [
  { id: 1, date: 'Oct 2024', belt: 'Orange Belt (8th Kyu)', examiner: 'Sensei Raj', status: 'Passed', score: '88/100', current: false },
  { id: 2, date: 'Feb 2025', belt: 'Green Belt (7th Kyu)', examiner: 'Sensei Mahesh', status: 'Passed', score: '92/100', current: false },
  { id: 3, date: 'Aug 2025', belt: 'Blue Belt (6th Kyu)', examiner: 'Shihan Harish', status: 'Passed (Distinction)', score: '96/100', current: true },
]

export default function GradingPage() {
  usePortalAuth()
  return (
    <div style={{ padding: '2rem 1rem', maxWidth: '1420px', margin: '0 auto', width: '100%' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontFamily: 'var(--font-heading, "Outfit")', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', gap: '1rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          <TrendingUp size={48} color="var(--gold, #ffb703)" />
          Grading Progression
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', maxWidth: '600px', marginTop: '0.5rem' }}>
          Your journey forged through discipline. Review past examinations.
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading, "Outfit")', fontSize: '1.5rem', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>Evolution Timeline</h2>
          {MOCK_HISTORY.map((exam, idx) => (
            <motion.div 
              key={exam.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              style={{
                background: exam.current ? 'rgba(255, 183, 3, 0.05)' : 'rgba(10, 14, 22, 0.6)',
                border: '1px solid',
                borderColor: exam.current ? 'rgba(255, 183, 3, 0.3)' : 'rgba(255,255,255,0.05)',
                borderRadius: '16px',
                padding: '1.5rem',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {exam.current && <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', background: 'var(--gold, #ffb703)' }} />}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em' }}>{exam.date}</span>
                <span style={{ color: exam.current ? 'var(--gold, #ffb703)' : '#43aa8b', fontSize: '0.8rem', fontWeight: 800 }}>{exam.status}</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 700, margin: '0 0 1rem 0' }}>{exam.belt}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
                <span>Examiner: {exam.examiner}</span>
                <span style={{ fontWeight: 700, color: '#fff' }}>{exam.score}</span>
              </div>
              
              {exam.status.includes('Passed') && (
                <button style={{
                  marginTop: '1.25rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  padding: '0.75rem',
                  borderRadius: '12px',
                  fontFamily: 'var(--font-heading, "Outfit")',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--gold, #ffb703)'; e.currentTarget.style.color = '#000'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; }}
                >
                  <Award size={18} /> View Scroll
                </button>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div style={{
            background: 'linear-gradient(145deg, rgba(20,26,38,1) 0%, rgba(10,14,22,1) 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px',
            padding: '2.5rem',
            textAlign: 'center'
          }}>
            <Medal size={48} color="rgba(255,255,255,0.2)" style={{ marginBottom: '1.5rem' }} />
            <h2 style={{ fontFamily: 'var(--font-heading, "Outfit")', fontSize: '2rem', color: '#fff', marginBottom: '1rem' }}>Next Milestone</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: '2rem' }}>
              Your specific syllabus checklist for the next Kyu grade will appear here closer to the examination date. Keep training hard.
            </p>
            <button style={{
              background: 'transparent',
              border: '1px solid var(--gold, #ffb703)',
              color: 'var(--gold, #ffb703)',
              padding: '0.8rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 700,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Download Current Manual
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
