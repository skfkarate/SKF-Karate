'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Wallet, ArrowUpRight, ArrowDownRight, CreditCard, ShieldCheck, CheckCircle2, History } from 'lucide-react'

// Mock Data
const feeHistory = [
  { id: 'tx_01', month: 'March 2026', amount: 1500, date: '05/03/2026', status: 'paid', type: 'debit', receipt: 'rcpt_001' },
  { id: 'tx_02', month: 'February 2026', amount: 1500, date: '03/02/2026', status: 'paid', type: 'debit', receipt: 'rcpt_002' },
  { id: 'tx_03', month: 'January 2026', amount: 1500, date: '02/01/2026', status: 'paid', type: 'debit', receipt: 'rcpt_003' },
]

export default function KuroobiTreasuryPage() {
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePayment = async () => {
    setIsProcessing(true)
    try {
      const res = await fetch('/api/portal/fees/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 1500, receipt_id: 'rcpt_mock_123' })
      })
      const order = await res.json()
      if (order.error) { alert(order.error); return }
      alert(`Payment gateway (Razorpay) will open here in production.\nOrder: ${order.id}\nAmount: ₹1,500`)
    } catch (err) {
      console.error(err)
      alert('Payment initialization failed')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div style={{ paddingBottom: '4rem', maxWidth: '1000px', margin: '0 auto' }}>

      {/* ── HEADER ── */}
      <div style={{ padding: '3rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <h1 style={{
            fontFamily: 'var(--font-heading, "Outfit")', fontSize: '3rem',
            fontWeight: 900, color: '#fff', letterSpacing: '0.05em',
            textTransform: 'uppercase', marginBottom: '0.25rem', lineHeight: 1
          }}>Treasury</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem', fontWeight: 500 }}>
            Manage your Dojo contributions securely.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(45,212,191,0.1)', padding: '0.5rem 1rem', borderRadius: '99px', border: '1px solid rgba(45,212,191,0.2)' }}
        >
          <ShieldCheck size={16} color="#2dd4bf" />
          <span style={{ color: '#2dd4bf', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Secure 256-bit</span>
        </motion.div>
      </div>

      {/* ── THE "BLACK CARD" LAYOUT ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
        
        {/* The Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
          style={{
            position: 'relative', width: '100%', aspectRatio: '1.586',
            background: 'linear-gradient(135deg, #10141f 0%, #06080d 100%)',
            borderRadius: '24px', padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            boxShadow: '0 30px 60px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.1)',
            overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)'
          }}
        >
          {/* Card Holographic/Glow Effects */}
          <div style={{ position: 'absolute', top: '-50%', right: '-30%', width: '100%', height: '100%', background: 'radial-gradient(circle, rgba(214,40,40,0.15) 0%, transparent 70%)', transform: 'rotate(25deg)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-40%', left: '-20%', width: '80%', height: '80%', background: 'radial-gradient(circle, rgba(255,183,3,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
            <div>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Current Balance</span>
              <div style={{ 
                fontFamily: 'var(--font-heading, "Outfit")', fontSize: '3.5rem', fontWeight: 900, 
                color: '#fff', lineHeight: 1, marginTop: '0.5rem', letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.6) 100%)',
                WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
              }}>
                <span style={{ fontSize: '2rem', verticalAlign: 'top', opacity: 0.5 }}>₹</span>1,500
              </div>
            </div>
            <CreditCard size={36} color="rgba(255,255,255,0.1)" />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 10 }}>
            <div>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Due Date</span>
              <span style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, letterSpacing: '0.05em' }}>10 April 2026</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Status</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#ff6b6b' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff6b6b', boxShadow: '0 0 10px #ff6b6b' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Unpaid</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Panel */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}
        >
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>Monthly Contribution</h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              Your dues support Dojo maintenance, master classes, and ongoing digital infrastructure like this Athletic Hub.
            </p>
            
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              style={{
                width: '100%', background: 'linear-gradient(135deg, var(--crimson, #d62828), #b31b1b)',
                color: '#fff', border: 'none', padding: '1.25rem', borderRadius: '16px',
                fontFamily: 'var(--font-heading, "Outfit")', fontSize: '1rem', fontWeight: 800,
                letterSpacing: '0.15em', textTransform: 'uppercase', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '0.75rem', cursor: isProcessing ? 'not-allowed' : 'pointer',
                boxShadow: '0 15px 30px rgba(214,40,40,0.3)', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                opacity: isProcessing ? 0.7 : 1
              }}
              onMouseEnter={e => { if (!isProcessing) e.currentTarget.style.transform = 'scale(1.02) translateY(-2px)' }}
              onMouseLeave={e => { if (!isProcessing) e.currentTarget.style.transform = 'scale(1) translateY(0)' }}
            >
              <Wallet size={20} />
              {isProcessing ? 'Connecting...' : 'Make Payment'}
            </button>
          </div>
        </motion.div>
      </div>

      {/* ── LEDGER / HISTORY ── */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <History size={20} color="rgba(255,255,255,0.4)" />
          <h2 style={{ fontFamily: 'var(--font-heading, "Outfit")', fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>Transaction Ledger</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {feeHistory.map((tx, idx) => (
            <div key={tx.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem',
              background: 'rgba(255,255,255,0.01)', borderRadius: '16px', transition: 'background 0.2s',
              cursor: 'pointer'
            }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(45,212,191,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <CheckCircle2 size={24} color="#2dd4bf" />
                </div>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>{tx.month} Due</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{tx.date} • {tx.receipt}</div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-heading, "Outfit")', fontSize: '1.35rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  ₹{tx.amount.toLocaleString()}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', marginTop: '0.25rem', justifyContent: 'flex-end' }}>
                  <ArrowUpRight size={12} /> Debit
                </div>
              </div>

            </div>
          ))}

          {feeHistory.length === 0 && (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
              No transactions found in your ledger.
            </div>
          )}
        </div>
      </motion.div>

    </div>
  )
}
