'use client'

import { motion } from 'framer-motion'
import { Trophy, Medal, Star, Shield, Award } from 'lucide-react'

// Mock Data for the Trophy Room
const ACHIEVEMENTS = [
  { id: 1, tournament: 'SKF State Championship 2024', category: 'Kumite (-60kg)', medal: 'Gold', year: '2024' },
  { id: 2, tournament: 'SKF State Championship 2024', category: 'Individual Kata', medal: 'Silver', year: '2024' },
  { id: 3, tournament: 'National Invitational 2025', category: 'Team Kumite', medal: 'Bronze', year: '2025' },
]

const STATS = [
  { label: 'Tournaments Attended', value: '4' },
  { label: 'Total Medals', value: '3' },
  { label: 'Win Rate', value: '75%' },
]

export default function TrophyRoomPage() {
  const getMedalStyle = (medal) => {
    switch(medal) {
      case 'Gold': return { color: '#ffcf33', bg: 'rgba(255, 207, 51, 0.1)', border: 'rgba(255, 207, 51, 0.3)' }
      case 'Silver': return { color: '#e0e0e0', bg: 'rgba(224, 224, 224, 0.1)', border: 'rgba(224, 224, 224, 0.3)' }
      case 'Bronze': return { color: '#cd7f32', bg: 'rgba(205, 127, 50, 0.1)', border: 'rgba(205, 127, 50, 0.3)' }
      default: return { color: '#fff', bg: 'rgba(255,255,255,0.1)', border: 'rgba(255,255,255,0.2)' }
    }
  }

  return (
    <div style={{ padding: '2rem 1rem', maxWidth: '1420px', margin: '0 auto', width: '100%', minHeight: '80vh' }}>
      
      {/* ── HEADER ── */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '4rem', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-heading, "Outfit")', fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1, textTransform: 'uppercase', textShadow: '0 0 40px rgba(255, 183, 3, 0.2)' }}>
          The Trophy Room
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.2rem', maxWidth: '600px', margin: '1rem auto 0 auto', letterSpacing: '0.05em' }}>
          Your legacy, forged in sweat and discipline.
        </p>
      </motion.div>

      {/* ── LIFETIME CAREER STATS ── */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ delay: 0.1 }}
        style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '5rem' }}
      >
        {STATS.map((stat, idx) => (
          <div key={idx} style={{ background: 'linear-gradient(180deg, rgba(20,26,38,0.8) 0%, rgba(10,14,22,0.8) 100%)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '2rem 3rem', textAlign: 'center', minWidth: '200px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
            <div style={{ fontSize: '3.5rem', fontFamily: 'var(--font-heading, "Outfit")', fontWeight: 900, color: '#fff', marginBottom: '0.5rem', textShadow: '0 0 20px rgba(255,255,255,0.2)' }}>{stat.value}</div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* ── TOURNAMENT ACHIEVEMENTS ── */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-heading, "Outfit")', fontSize: '2rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '3rem' }}>
          <Star color="var(--gold, #ffb703)" size={28} /> Championship Honors
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {ACHIEVEMENTS.map((ach, idx) => {
            const style = getMedalStyle(ach.medal);
            return (
              <motion.div 
                key={ach.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (idx * 0.1) }}
                whileHover={{ y: -10, boxShadow: `0 20px 40px ${style.bg}` }}
                style={{
                  background: 'rgba(10, 14, 22, 0.8)',
                  border: `1px solid ${style.border}`,
                  borderRadius: '24px',
                  padding: '2.5rem 2rem',
                  position: 'relative',
                  overflow: 'hidden',
                  textAlign: 'center',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease-out'
                }}
              >
                {/* Glow behind medal */}
                <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)', width: '150px', height: '150px', background: style.bg, filter: 'blur(50px)', borderRadius: '50%', zIndex: 0 }} />
                
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Medal size={80} color={style.color} strokeWidth={1} style={{ marginBottom: '1.5rem', filter: `drop-shadow(0 0 20px ${style.border})` }} />
                  
                  <div style={{ background: style.bg, color: style.color, padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', border: `1px solid ${style.border}` }}>
                    {ach.medal} Medal
                  </div>
                  
                  <h3 style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.5rem', fontFamily: 'var(--font-heading, "Outfit")' }}>{ach.tournament}</h3>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', marginBottom: '1rem' }}>{ach.category}</div>
                  
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: '0.05em' }}>COMPETED IN {ach.year}</div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
