'use client'

import { motion } from 'framer-motion'
import { Clock, CreditCard, ShieldCheck, Wallet } from 'lucide-react'
import { usePortalAuth } from '@/app/_components/portal/usePortalAuth'

export default function KuroobiTreasuryPage() {
  usePortalAuth()

  return (
    <div style={{ padding: '2rem 1rem 4rem', maxWidth: '1000px', margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '3rem' }}>
        <h1 style={{
          fontFamily: 'var(--font-heading, "Outfit")',
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          fontWeight: 900,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          textTransform: 'uppercase',
        }}>
          <Wallet size={48} color="var(--gold, #ffb703)" />
          Treasury
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.05rem', maxWidth: '640px', marginTop: '0.75rem', lineHeight: 1.7 }}>
          Fee history and online payment will appear here after the live fee ledger is connected.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background: 'linear-gradient(145deg, rgba(20,26,38,0.9), rgba(10,14,22,0.96))',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '28px',
          padding: '2.5rem',
          boxShadow: '0 30px 60px rgba(0,0,0,0.35)',
        }}
      >
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div style={{ width: 54, height: 54, borderRadius: 18, background: 'rgba(255,183,3,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={28} color="var(--gold, #ffb703)" />
          </div>
          <div>
            <h2 style={{ margin: 0, color: '#fff', fontSize: '1.6rem', fontWeight: 800 }}>Fee Ledger Coming Soon</h2>
            <p style={{ margin: '0.7rem 0 0', color: 'rgba(255,255,255,0.58)', lineHeight: 1.7 }}>
              We are not showing placeholder balances or fake receipts. Until the live ledger is enabled, please contact your branch manager for current fee status.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
          {[
            { icon: CreditCard, title: 'Online Payment', text: 'Disabled until Razorpay is enabled.' },
            { icon: ShieldCheck, title: 'Receipts', text: 'Receipts will be shown only from verified live records.' },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} style={{ padding: '1.25rem', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.025)' }}>
                <Icon size={22} color="#2dd4bf" />
                <h3 style={{ margin: '0.85rem 0 0.4rem', color: '#fff', fontSize: '1rem' }}>{item.title}</h3>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', lineHeight: 1.6 }}>{item.text}</p>
              </div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
