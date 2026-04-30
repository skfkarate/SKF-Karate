'use client'

import { motion } from 'framer-motion'
import { Medal, Shield, Star } from 'lucide-react'
import { usePortalAuth } from '@/app/_components/portal/usePortalAuth'

export default function TrophyRoomPage() {
  usePortalAuth()

  return (
    <div style={{ padding: '2rem 1rem 4rem', maxWidth: '1100px', margin: '0 auto', width: '100%', minHeight: '80vh' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '4rem', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-heading, "Outfit")', fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1, textTransform: 'uppercase', textShadow: '0 0 40px rgba(255, 183, 3, 0.2)' }}>
          The Trophy Room
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.15rem', maxWidth: '650px', margin: '1rem auto 0', lineHeight: 1.7 }}>
          Verified medals and tournament results will appear here after live result syncing is enabled.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        style={{
          background: 'rgba(10,14,22,0.8)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '28px',
          padding: '2.5rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', inset: '20% auto auto 50%', transform: 'translateX(-50%)', width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,183,3,0.12)', filter: 'blur(60px)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Medal size={76} color="var(--gold, #ffb703)" style={{ marginBottom: '1.5rem' }} />
          <h2 style={{ margin: 0, color: '#fff', fontSize: '1.9rem', fontWeight: 850 }}>No Verified Results Published Yet</h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, margin: '1rem auto 2rem', maxWidth: 680 }}>
            We are not displaying placeholder trophies in production. Once an admin publishes verified event results, this room will show your real achievements.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.8rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: '#ffcf33', border: '1px solid rgba(255,207,51,0.3)', borderRadius: 999, padding: '0.7rem 1rem', fontWeight: 700 }}>
              <Star size={17} /> Verified medals only
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: '#9ee7c4', border: '1px solid rgba(158,231,196,0.25)', borderRadius: 999, padding: '0.7rem 1rem', fontWeight: 700 }}>
              <Shield size={17} /> Admin-published records
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
