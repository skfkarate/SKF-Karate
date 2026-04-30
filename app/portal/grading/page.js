'use client'

import { motion } from 'framer-motion'
import { Award, Medal, TrendingUp } from 'lucide-react'
import { usePortalAuth } from '@/app/_components/portal/usePortalAuth'

export default function GradingPage() {
  usePortalAuth()

  return (
    <div style={{ padding: '2rem 1rem 4rem', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontFamily: 'var(--font-heading, "Outfit")', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', gap: '1rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          <TrendingUp size={48} color="var(--gold, #ffb703)" />
          Grading Progression
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.05rem', maxWidth: '650px', marginTop: '0.75rem', lineHeight: 1.7 }}>
          Your verified grading history will appear here after grading records are connected to the athlete portal.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background: 'linear-gradient(145deg, rgba(20,26,38,1), rgba(10,14,22,0.96))',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '28px',
          padding: '2.5rem',
          textAlign: 'center',
        }}
      >
        <Medal size={58} color="rgba(255,255,255,0.22)" style={{ marginBottom: '1.5rem' }} />
        <h2 style={{ fontFamily: 'var(--font-heading, "Outfit")', fontSize: '2rem', color: '#fff', marginBottom: '1rem' }}>Verified Grading Records Pending</h2>
        <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, margin: '0 auto 2rem', maxWidth: '680px' }}>
          We removed demo grading history from this production page. Until the live grading module is enabled, your instructor or branch manager can confirm current rank and next-exam requirements.
        </p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', color: 'var(--gold, #ffb703)', border: '1px solid rgba(255,183,3,0.35)', padding: '0.8rem 1rem', borderRadius: 999, fontWeight: 700 }}>
          <Award size={18} /> Live grading module coming soon
        </div>
      </motion.div>
    </div>
  )
}
