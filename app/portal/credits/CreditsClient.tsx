'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Award, Gift, Clock, ShieldCheck } from 'lucide-react'
import { CreditsPageSkeleton } from '../_components/skeletons/CreditsPageSkeleton'

type CreditEntry = {
  id: string
  creditCode: string
  amount: number
  reason: string
  description: string
  status: 'available' | 'used'
  earnedAt: string
  usedMonth: string | null
  usedYear: string | null
  usedAt: string | null
}

type CreditsData = {
  credits: CreditEntry[]
  availableCredits: CreditEntry[]
  totalAvailable: number
  totalUsed: number
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function CreditsClient() {
  const [data, setData] = useState<CreditsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'available' | 'used'>('all')

  useEffect(() => {
    let cancelled = false
    async function loadCredits() {
      try {
        const res = await fetch('/api/portal/credits', { cache: 'no-store' })
        if (res.status === 401) {
          window.location.href = '/portal/login'
          return
        }
        if (!res.ok) throw new Error('Unable to load student credits.')
        const result = await res.json()
        if (!cancelled) setData(result.data || result)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error loading credits')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadCredits()
    return () => { cancelled = true }
  }, [])

  if (loading) return <CreditsPageSkeleton />

  const filteredCredits = data?.credits.filter(c => {
    if (filter === 'all') return true
    return c.status === filter
  }) || []

  return (
    <div style={{ padding: '2rem 1rem 6rem', maxWidth: '1100px', margin: '0 auto', width: '100%', minHeight: '70vh' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ paddingTop: '3rem', marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{
          fontFamily: 'var(--font-heading, "Outfit")',
          fontSize: 'clamp(2.5rem, 6vw, 4rem)',
          fontWeight: 900,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          margin: '0 0 0.5rem',
          background: 'linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.4) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 10px 30px rgba(0,0,0,0.5)',
        }}>
          Student Credits
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', margin: '0 auto', maxWidth: '620px', fontWeight: 500, lineHeight: 1.6 }}>
          Track your earned credits from achievements, events, and referrals.
        </p>
      </motion.div>

      {error ? (
        <div style={{ padding: '3rem 2rem', borderRadius: 24, border: '1px solid rgba(214,40,40,0.25)', background: 'rgba(214,40,40,0.08)', color: '#ffb4b4', textAlign: 'center', fontWeight: 700 }}>
          {error}
        </div>
      ) : data ? (
        <div style={{ display: 'grid', gap: '2rem' }}>
          
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20,
              padding: '1.4rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}>
              <div style={{ width: 50, height: 50, borderRadius: 16, background: 'rgba(74, 222, 128, 0.11)', color: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800 }}>Available Balance</div>
                <div style={{ color: '#fff', fontFamily: 'var(--font-heading, "Outfit")', fontSize: '1.8rem', fontWeight: 900 }}>
                  ₹{data.totalAvailable.toLocaleString()}
                </div>
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20,
              padding: '1.4rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}>
              <div style={{ width: 50, height: 50, borderRadius: 16, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={24} />
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800 }}>Lifetime Redeemed</div>
                <div style={{ color: '#fff', fontFamily: 'var(--font-heading, "Outfit")', fontSize: '1.8rem', fontWeight: 900 }}>
                  ₹{data.totalUsed.toLocaleString()}
                </div>
              </div>
            </div>
          </section>

          <section style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: '1.5rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', margin: 0, color: '#fff', fontSize: '1.4rem', fontWeight: 850 }}>
                <Award size={20} color="var(--gold, #ffb703)" />
                Credit Ledger
              </h2>

              <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.3rem', borderRadius: '1rem' }}>
                {['all', 'available', 'used'].map(f => (
                  <button 
                    key={f}
                    onClick={() => setFilter(f as 'all' | 'available' | 'used')}
                    style={{
                      padding: '0.4rem 1rem',
                      borderRadius: '0.8rem',
                      border: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      textTransform: 'capitalize',
                      cursor: 'pointer',
                      background: filter === f ? 'rgba(255,255,255,0.1)' : 'transparent',
                      color: filter === f ? '#fff' : 'rgba(255,255,255,0.5)',
                      transition: 'all 0.2s',
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {filteredCredits.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'rgba(255,255,255,0.4)' }}>
                <Gift size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                <p style={{ margin: 0, fontWeight: 600 }}>
                  {filter === 'all' ? "You don't have any credits yet." : `You don't have any ${filter} credits.`}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <AnimatePresence mode="popLayout">
                  {filteredCredits.map((credit, idx) => (
                    <motion.div
                      key={credit.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05 }}
                      style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'minmax(0, 1fr) auto',
                        alignItems: 'center', 
                        gap: '1rem', 
                        padding: '1rem 1.2rem', 
                        borderRadius: 16, 
                        background: 'rgba(255,255,255,0.025)', 
                        border: '1px solid rgba(255,255,255,0.04)' 
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.3rem' }}>
                          <strong style={{ color: '#fff', fontSize: '1.1rem' }}>{credit.reason}</strong>
                          <span style={{ 
                            fontSize: '0.7rem', 
                            padding: '0.2rem 0.6rem', 
                            borderRadius: '1rem', 
                            textTransform: 'uppercase', 
                            fontWeight: 800,
                            background: credit.status === 'available' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(255,255,255,0.1)',
                            color: credit.status === 'available' ? '#4ade80' : 'rgba(255,255,255,0.5)'
                          }}>
                            {credit.status}
                          </span>
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem' }}>
                          Earned: {new Date(credit.earnedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {credit.status === 'used' && credit.usedMonth && credit.usedYear && (
                            <span style={{ marginLeft: '0.5rem', color: 'rgba(255,255,255,0.6)' }}>
                              • Applied to {MONTHS[Number(credit.usedMonth)]} {credit.usedYear}
                            </span>
                          )}
                        </div>
                        {credit.description && (
                          <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', background: 'rgba(0,0,0,0.2)', padding: '0.5rem 0.8rem', borderRadius: '0.5rem', borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
                            {credit.description}
                          </div>
                        )}
                      </div>
                      
                      <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ 
                          fontSize: '1.5rem', 
                          fontWeight: 900, 
                          fontFamily: 'var(--font-heading, "Outfit")',
                          color: credit.status === 'available' ? '#4ade80' : 'rgba(255,255,255,0.4)' 
                        }}>
                          ₹{credit.amount}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', fontFamily: 'monospace', marginTop: '0.2rem' }}>
                          {credit.creditCode}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>
  )
}
