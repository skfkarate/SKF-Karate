'use client'

import { motion } from 'framer-motion'
import { Flag, Compass } from 'lucide-react'

export default function EventsPage() {
  return (
    <div style={{ padding: '2rem 1rem', maxWidth: '1420px', margin: '0 auto', width: '100%', minHeight: '70vh', display: 'flex', flexDirection: 'column' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontFamily: 'var(--font-heading, "Outfit")', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', gap: '1rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          <Flag size={48} color="var(--gold, #ffb703)" />
          Regional Events
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', maxWidth: '600px', marginTop: '0.5rem' }}>
          Discover and register for tournaments, seminars, and training camps.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(10,14,22,0.6)',
          borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.05)',
          padding: '3rem',
          textAlign: 'center'
        }}
      >
        <Compass size={64} color="rgba(255,255,255,0.1)" strokeWidth={1} style={{ marginBottom: '1.5rem' }} />
        <h2 style={{ fontFamily: 'var(--font-heading, "Outfit")', fontSize: '2rem', color: '#fff', marginBottom: '1rem' }}>No Active Registrations</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '400px', margin: '0 auto 2rem auto', lineHeight: 1.5 }}>
          There are currently no open tournaments or seminars in your region. We will notify you when new events are scheduled.
        </p>
      </motion.div>
    </div>
  )
}
