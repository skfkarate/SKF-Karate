'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Clock, CreditCard, Download, ReceiptText, Wallet } from 'lucide-react'
import { usePortalAuth } from '@/app/_components/portal/usePortalAuth'
import './fees.css'

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

function formatCurrency(value) {
  return currency.format(Number(value || 0))
}

function readApiError(payload, fallback) {
  if (!payload || typeof payload !== 'object') return fallback
  if (typeof payload.error === 'string') return payload.error
  if (typeof payload.error?.message === 'string') return payload.error.message
  if (typeof payload.message === 'string') return payload.message
  return fallback
}

function StatusBadge({ status }) {
  const normalized = String(status || '').toLowerCase()
  const isPaid = normalized === 'paid'
  return (
    <span className={isPaid ? 'badge-paid' : 'badge-due'}>
      {isPaid ? 'Paid' : normalized || 'Due'}
    </span>
  )
}

export default function KuroobiTreasuryPage() {
  usePortalAuth()

  const [ledger, setLedger] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadFees() {
      setLoading(true)
      setError('')

      try {
        const res = await fetch('/api/portal/fees', { cache: 'no-store' })
        const data = await res.json().catch(() => null)

        if (!res.ok || !data?.success) {
          throw new Error(readApiError(data, 'Unable to load fee ledger.'))
        }

        if (!cancelled) setLedger(data.data)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load fee ledger.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    const id = window.setTimeout(loadFees, 0)
    return () => {
      cancelled = true
      window.clearTimeout(id)
    }
  }, [])

  const recentEntries = useMemo(() => (ledger?.entries || []).slice(0, 12), [ledger?.entries])
  const nextDue = ledger?.nextDue || null
  const hasDue = Number(ledger?.summary?.totalDue || 0) > 0

  return (
    <div className="portal-fees">
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
          Verified fee status and receipts from the live SKF ledger.
        </p>
      </motion.div>

      {loading ? (
        <div className="fees-status-card">
          <Clock size={44} color="var(--gold, #ffb703)" />
          <h2 style={{ color: '#fff', marginTop: '1rem' }}>Loading Fee Ledger</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Fetching your verified training fee records.</p>
        </div>
      ) : error ? (
        <div className="fees-status-card due">
          <AlertCircle size={48} color="var(--crimson, #d62828)" />
          <h2 style={{ color: '#fff', marginTop: '1rem' }}>Ledger Unavailable</h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', maxWidth: 620, margin: '0.75rem auto 0', lineHeight: 1.7 }}>
            {error}
          </p>
        </div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className={`fees-status-card ${hasDue ? 'due' : 'paid'}`}
          >
            {hasDue ? (
              <AlertCircle size={48} color="var(--crimson, #d62828)" />
            ) : (
              <CheckCircle2 size={48} color="var(--gold, #ffb703)" />
            )}
            <p style={{ color: 'rgba(255,255,255,0.48)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '1rem 0 0', fontWeight: 800 }}>
              {ledger?.brand?.subtitle || 'Training Fee Status'}
            </p>
            <div className={`fees-status-amount ${hasDue ? 'due' : 'paid'}`}>
              {formatCurrency(ledger?.summary?.totalDue)}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0 }}>
              {hasDue && nextDue
                ? `${nextDue.month} ${nextDue.year} is the next pending entry.`
                : 'No pending fee entries in the current ledger view.'}
            </p>
            <button className="fees-action-btn" disabled style={{ marginTop: '2rem' }}>
              <CreditCard size={18} />
              Online Fee Payment Disabled
            </button>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[
              ['Total Expected', formatCurrency(ledger?.summary?.totalExpected)],
              ['Total Paid', formatCurrency(ledger?.summary?.totalPaid)],
              ['Paid Months', ledger?.summary?.paidCount || 0],
              ['Pending Months', ledger?.summary?.dueCount || 0],
            ].map(([label, value]) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: '1.2rem' }}>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.55rem' }}>{label}</div>
                <div style={{ color: '#fff', fontWeight: 850, fontSize: '1.25rem' }}>{value}</div>
              </div>
            ))}
          </div>

          <section style={{ background: 'rgba(10,14,22,0.72)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <ReceiptText size={24} color="var(--gold, #ffb703)" />
              <h2 style={{ color: '#fff', margin: 0, fontSize: '1.35rem' }}>Fee History</h2>
            </div>

            {recentEntries.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
                No fee rows are available for your account yet.
              </p>
            ) : (
              <table className="fee-history-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Paid Date</th>
                    <th>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEntries.map((entry) => (
                    <tr key={entry.key}>
                      <td data-label="Month">{entry.month} {entry.year}</td>
                      <td data-label="Amount">{formatCurrency(entry.amount)}</td>
                      <td data-label="Status"><StatusBadge status={entry.status} /></td>
                      <td data-label="Paid Date">{entry.paidDate ? new Date(entry.paidDate).toLocaleDateString('en-IN') : '-'}</td>
                      <td data-label="Receipt">
                        {entry.receiptId ? (
                          <a
                            href={`/api/portal/receipts/${encodeURIComponent(entry.receiptId)}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: 'var(--gold, #ffb703)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800, textDecoration: 'none' }}
                          >
                            <Download size={15} /> PDF
                          </a>
                        ) : (
                          <span style={{ color: 'rgba(255,255,255,0.35)' }}>-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}
    </div>
  )
}
