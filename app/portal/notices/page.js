'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CalendarRange, MapPin, AlertCircle, Info, Flame, ChevronRight, Trophy } from 'lucide-react'

// Mock Data
const ANNOUNCEMENTS = [
  { 
    id: 1, date: 'Oct 24, 2026', 
    title: 'Dojo Closed for Diwali', 
    content: 'The HSR Layout branch will be closed from Oct 28th to Nov 1st. Regular classes resume Nov 2nd.', 
    type: 'alert' 
  },
  { 
    id: 2, date: 'Oct 15, 2026', 
    title: 'New Kata Syllabus Released', 
    content: 'Sensei has uploaded the new breakdown for Bassai Dai in the Home Practice section. Please review before next week.', 
    type: 'info' 
  },
  { 
    id: 3, date: 'Oct 02, 2026', 
    title: 'Quarterly Belt Grading', 
    content: 'Belt grading is scheduled for Nov 15th. Ensure your Treasury dues are cleared and your attendance is above 80%.', 
    type: 'urgent' 
  }
]

const UPCOMING_EVENTS = [
  { 
    id: 1, 
    date: 'Dec 10 - 12, 2026', 
    title: 'SKF National Championship 2026', 
    location: 'Koramangala Indoor Stadium',
    image: 'https://picsum.photos/seed/tournament1/800/400',
    status: 'Registration Open',
    eligibility: 'All Belts (Ages 7+)'
  },
  { 
    id: 2, 
    date: 'Jan 15, 2027', 
    title: 'Advanced Kumite Tactics Seminar', 
    location: 'HSR Honbu Dojo',
    image: 'https://picsum.photos/seed/seminar1/800/400',
    status: 'Filling Fast',
    eligibility: 'Brown & Black Belts'
  }
]

export default function NoticesPage() {
  const [activeTab, setActiveTab] = useState('all')

  const getIconForType = (type) => {
    switch(type) {
      case 'alert': return <AlertCircle size={18} color="#f94144" />
      case 'urgent': return <Flame size={18} color="#f8961e" />
      default: return <Info size={18} color="#43aa8b" />
    }
  }

  return (
    <div style={{ paddingBottom: '4rem', paddingTop: '1rem', paddingRight: '1rem', maxWidth: '1420px', margin: '0 auto', width: '100%' }}>
      
      {/* ── HEADER ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem', paddingLeft: '0.5rem' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontFamily: 'var(--font-heading, "Outfit")', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Bell size={48} color="var(--gold, #ffb703)" />
            Notice Board
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', fontWeight: 500, maxWidth: '600px' }}>
            Official announcements, grading alerts, and tournament registrations directly from your Branch Manager.
          </p>
        </motion.div>
      </div>

      {/* ── MAIN LAYOUT (TWO COLUMNS ON DESKTOP) ── */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
        gap: '2.5rem',
        paddingLeft: '0.5rem'
      }}>
        
        {/* LEFT COLUMN: ANNOUNCEMENTS */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ delay: 0.1 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <AlertCircle color="var(--crimson, #d62828)" size={24} />
            <h2 style={{ fontFamily: 'var(--font-heading, "Outfit")', fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              Dojo Bulletins
            </h2>
          </div>

          {ANNOUNCEMENTS.map((notice, idx) => (
            <motion.div 
              key={notice.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (idx * 0.1) }}
              style={{
                background: 'rgba(10, 14, 22, 0.6)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '20px',
                padding: '1.5rem',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(20, 26, 38, 0.8)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(10, 14, 22, 0.6)'}
            >
              {notice.type === 'alert' && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: '#f94144' }} />}
              {notice.type === 'urgent' && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: '#f8961e' }} />}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {notice.date}
                </span>
                {getIconForType(notice.type)}
              </div>
              
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem', lineHeight: 1.3 }}>
                {notice.title}
              </h3>
              
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                {notice.content}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* RIGHT COLUMN: UPCOMING EVENTS */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ delay: 0.2 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <CalendarRange color="var(--gold, #ffb703)" size={24} />
            <h2 style={{ fontFamily: 'var(--font-heading, "Outfit")', fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              Event Hub
            </h2>
          </div>

          {UPCOMING_EVENTS.map((evt, idx) => (
            <motion.div 
              key={evt.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (idx * 0.1) }}
              style={{
                background: 'rgba(10, 14, 22, 0.6)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '24px',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              {/* Event Image */}
              <div style={{ width: '100%', height: '180px', position: 'relative' }}>
                <img src={evt.image} alt={evt.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,14,22,1) 0%, transparent 60%)' }} />
                
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: evt.status === 'Registration Open' ? 'var(--crimson, #d62828)' : 'rgba(255,255,255,0.1)', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {evt.status}
                </div>
              </div>

              {/* Event Details */}
              <div style={{ padding: '1.5rem' }}>
                <div style={{ color: 'var(--gold, #ffb703)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  {evt.date}
                </div>
                
                <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading, "Outfit")', fontWeight: 800, color: '#fff', marginBottom: '1rem', lineHeight: 1.2 }}>
                  {evt.title}
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                    <MapPin size={16} /> {evt.location}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                    <Trophy size={16} /> {evt.eligibility}
                  </div>
                </div>

                <button style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  padding: '1rem',
                  borderRadius: '12px',
                  fontFamily: 'var(--font-heading, "Outfit")',
                  fontSize: '1rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#000'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; }}
                >
                  View Details & Register <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </div>
  )
}
