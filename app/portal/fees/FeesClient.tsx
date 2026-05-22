'use client'

import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, CreditCard, ShieldCheck, CheckCircle2, History, AlertCircle, QrCode, Upload, Info, Clock, Download, Loader2 } from 'lucide-react'
import { usePortalAuth } from '@/app/_components/portal/usePortalAuth'
import type { FeeLedgerEntry } from '@/src/server/services/fee-ledger.service'
import { submitManualFeePayment } from './actions'

const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024
const ALLOWED_SCREENSHOT_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])

export default function FeesClient({ feeRecords }: { feeRecords: FeeLedgerEntry[] }) {
  usePortalAuth()
  const router = useRouter()

  const [isPaying, setIsPaying] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasScreenshot, setHasScreenshot] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [uiError, setUiError] = useState<string | null>(null)
  const [locallySubmittedFeeKeys, setLocallySubmittedFeeKeys] = useState<Set<string>>(() => new Set())
  const submitLockedRef = useRef(false)

  const handleDownloadReceipt = async (receiptId: string) => {
    setDownloadingId(receiptId)
    setUiError(null)
    try {
      const res = await fetch(`/api/portal/receipts/${encodeURIComponent(receiptId)}?mode=download`)
      if (!res.ok) throw new Error('Download failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${receiptId}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      setUiError('Failed to download receipt. Please try again.')
    } finally {
      setDownloadingId(null)
    }
  }

  // Calculate current balance 
  const isPendingVerification = (f: FeeLedgerEntry) => f.status === 'pending_verification'
  const effectiveFeeRecords = feeRecords.map((fee) =>
    locallySubmittedFeeKeys.has(fee.key) ? { ...fee, status: 'pending_verification' as const } : fee
  )
  const visibleFeeRecords = effectiveFeeRecords.filter(
    (f) => !(f.feeType === 'monthly' && (f.status === 'break' || f.status === 'waived'))
  )

  const dueRecords = visibleFeeRecords.filter(f => !isPendingVerification(f) && (f.status === 'due' || f.status === 'overdue' || f.status === 'rejected'))
  const pendingRecords = visibleFeeRecords.filter(f => isPendingVerification(f))
  const [selectedFeeKeys, setSelectedFeeKeys] = useState<Set<string>>(() => {
    const oldestDueRecord = dueRecords[dueRecords.length - 1]
    return oldestDueRecord ? new Set([oldestDueRecord.key]) : new Set()
  })

  const totalDue = dueRecords.reduce((sum, f) => sum + (Number(f.amount) || 0), 0)
  const selectedDueRecords = dueRecords.filter((fee) => selectedFeeKeys.has(fee.key))
  const selectedTotalDue = selectedDueRecords.reduce((sum, f) => sum + (Number(f.amount) || 0), 0)

  // Get oldest due for display
  const oldestDue = dueRecords.length > 0 ? dueRecords[dueRecords.length - 1] : null
  const dueDateStr = oldestDue ? `10 ${oldestDue.month.substring(0, 3)} ${oldestDue.year}` : 'N/A'

  // Status booleans
  const isClear = totalDue === 0
  const hasPending = pendingRecords.length > 0

  const handleManualSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitLockedRef.current) return

    setUiError(null)
    const form = event.currentTarget
    const formData = new FormData(form)
    const screenshotValue = formData.get('screenshot')
    const screenshot = screenshotValue instanceof File ? screenshotValue : null
    if (!screenshot || screenshot.size === 0) {
      setUiError("Please upload a payment screenshot.")
      return
    }
    if (!ALLOWED_SCREENSHOT_TYPES.has(String(screenshot.type || '').toLowerCase())) {
      setUiError('Please upload a PNG, JPG, or WebP screenshot.')
      return
    }
    if (screenshot.size > MAX_SCREENSHOT_BYTES) {
      setUiError('Payment screenshot must be 5 MB or smaller.')
      return
    }
    if (selectedFeeKeys.size === 0) {
      setUiError('Please select at least one fee record.')
      return
    }

    submitLockedRef.current = true
    setIsSubmitting(true)
    try {
      const result = await submitManualFeePayment(formData)
      if (result.ok === false) {
        setUiError(result.message)
        return
      }

      setLocallySubmittedFeeKeys((current) => {
        const next = new Set(current)
        for (const key of result.submittedFeeKeys) next.add(key)
        return next
      })
      const submittedKeys = new Set(result.submittedFeeKeys)
      const remainingDueRecords = dueRecords.filter((fee) => !submittedKeys.has(fee.key))
      const oldestRemainingDue = remainingDueRecords[remainingDueRecords.length - 1]
      setSelectedFeeKeys(oldestRemainingDue ? new Set([oldestRemainingDue.key]) : new Set())
      setHasScreenshot(false)
      setIsPaying(false)
      form.reset()
      router.refresh()
    } catch {
      setUiError("We couldn't submit the payment proof right now. Please try again.")
    } finally {
      submitLockedRef.current = false
      setIsSubmitting(false)
    }
  }

  function toggleFeeSelection(key: string) {
    if (isSubmitting) return
    setSelectedFeeKeys((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <div style={{ padding: '2rem 1rem 6rem 1rem', maxWidth: '1000px', margin: '0 auto' }}>

      {/* ── HEADER ── */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ paddingTop: '3rem', marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{
          fontFamily: 'var(--font-heading, "Outfit")', fontSize: 'clamp(3rem, 7vw, 4.5rem)',
          fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 0.5rem 0',
          background: 'linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.4) 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          textShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}>
          Treasury
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', margin: '0 auto', maxWidth: '600px', fontWeight: 500 }}>
          Manage your Dojo contributions securely.
        </p>
        
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(45,212,191,0.1)', padding: '0.4rem 0.8rem', borderRadius: '99px', border: '1px solid rgba(45,212,191,0.2)', marginTop: '1.25rem' }}>
          <ShieldCheck size={14} color="#2dd4bf" />
          <span style={{ color: '#2dd4bf', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Secure 256-bit</span>
        </div>
      </motion.div>

      {/* ── ERROR DISPLAY ── */}
      <AnimatePresence>
        {uiError && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              background: 'rgba(214, 40, 40, 0.15)',
              border: '1px solid rgba(214, 40, 40, 0.3)',
              color: '#ff6b6b',
              padding: '1rem 1.5rem',
              borderRadius: '16px',
              fontSize: '0.95rem',
              marginBottom: '2rem',
              lineHeight: 1.4,
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <span>{uiError}</span>
            </div>
            <button 
              onClick={() => setUiError(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                fontSize: '1.25rem',
                lineHeight: 1,
                padding: '0.2rem',
                flexShrink: 0
              }}
            >
              &times;
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── THE "BLACK CARD" LAYOUT ── */}
      <div className="fees-grid-top" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>

        {/* The Card (Enhanced Liquid Glass) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
          className="fees-black-card"
          style={{
            position: 'relative', width: '100%', aspectRatio: '1.586',
            background: 'linear-gradient(135deg, rgb(16, 20, 31) 0%, rgb(6, 8, 13) 100%)',
            borderRadius: '24px', padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            boxShadow: 'rgba(0, 0, 0, 0.6) 0px 30px 60px, inset 0 0 30px rgba(255,255,255,0.03)',
            overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)',
            borderTop: '1px solid rgba(255,255,255,0.25)', borderLeft: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(30px) saturate(150%)', WebkitBackdropFilter: 'blur(30px) saturate(150%)'
          }}
        >
          {/* Card Holographic/Glow Effects */}
          <div style={{ position: 'absolute', top: '-50%', right: '-30%', width: '100%', height: '100%', background: 'radial-gradient(circle, rgba(214,40,40,0.15) 0%, transparent 70%)', transform: 'rotate(25deg)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-40%', left: '-20%', width: '80%', height: '80%', background: 'radial-gradient(circle, rgba(255,183,3,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
            <div>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                {isClear ? (hasPending ? 'Pending Verification' : 'All Paid') : 'Current Balance'}
              </span>
              <div className="fees-balance" style={{
                fontFamily: 'var(--font-heading, "Outfit")', fontSize: '3.5rem', fontWeight: 900,
                color: '#fff', lineHeight: 1, marginTop: '0.5rem', letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.6) 100%)',
                WebkitBackgroundClip: 'text', backgroundClip: 'text'
              }}>
                <span className="fees-currency" style={{ fontSize: '2rem', verticalAlign: 'top', opacity: 0.5, color: '#fff' }}>₹</span>{totalDue.toLocaleString()}
              </div>
            </div>
            <CreditCard size={36} color="rgba(255,255,255,0.1)" />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 10 }}>
            <div>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                {isClear ? 'Status' : 'Due Date'}
              </span>
              <span style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                {isClear ? (hasPending ? 'In Review' : 'Clear') : dueDateStr}
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Status</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: isClear ? (hasPending ? 'var(--gold, #ffb703)' : '#2dd4bf') : '#ff6b6b' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isClear ? (hasPending ? 'var(--gold, #ffb703)' : '#2dd4bf') : '#ff6b6b', boxShadow: `0 0 10px ${isClear ? (hasPending ? 'var(--gold, #ffb703)' : '#2dd4bf') : '#ff6b6b'}` }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {isClear ? (hasPending ? 'Pending' : 'Clear') : 'Unpaid'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Panel / Payment Flow */}
        <motion.div
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}
        >
          <AnimatePresence mode="wait">
            {hasPending && isClear ? (
              <motion.div key="success" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(45,212,191,0.05)', border: '1px solid rgba(45,212,191,0.2)', borderRadius: '24px', padding: '2rem', textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(45,212,191,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <ShieldCheck size={32} color="#2dd4bf" />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2dd4bf', marginBottom: '0.5rem' }}>Verification Pending</h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  Your payment details have been submitted securely. The Sensei will verify the screenshot and update your ledger shortly.
                </p>
              </motion.div>
            ) : isPaying && !isClear ? (
              <motion.form onSubmit={handleManualSubmit} key="pay-form" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} aria-busy={isSubmitting} style={{ position: 'relative', background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.05)', borderTop: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '2rem', backdropFilter: 'blur(20px)', overflow: 'hidden' }}>
                <AnimatePresence>
                  {isSubmitting && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 20,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        background: 'rgba(6, 8, 13, 0.84)',
                        backdropFilter: 'blur(10px)',
                        textAlign: 'center',
                        padding: '2rem',
                      }}
                    >
                      <Loader2 size={28} color="var(--gold, #ffb703)" style={{ animation: 'spin 1s linear infinite' }} />
                      <strong style={{ color: '#fff', fontSize: '1rem' }}>Submitting proof...</strong>
                      <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem', lineHeight: 1.45 }}>
                        Please wait while we send the screenshot.
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <QrCode size={20} color="var(--gold, #ffb703)" /> Secure UPI Payment
                </h3>

                <div style={{ background: 'rgba(0,0,0,0.5)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', fontWeight: 600 }}>Account Holder:</span>
                    <span style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600 }}>Krishna C</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', fontWeight: 600 }}>Phone Number:</span>
                    <span style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, fontFamily: 'monospace' }}>9611990869</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', fontWeight: 600 }}>UPI ID:</span>
                    <span style={{ color: 'var(--gold, #ffb703)', fontSize: '1rem', fontWeight: 600, fontFamily: 'monospace' }}>skfkarate@axl</span>
                  </div>
                </div>

                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textAlign: 'center', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  <Info size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
                  You can use the Phone Number or the UPI ID above to make the payment using any UPI app.
                </p>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                    Select Fee Records <span style={{ color: '#ff6b6b' }}>*</span>
                  </label>
                  <div style={{ display: 'grid', gap: '0.55rem' }}>
                    {dueRecords.map((fee) => (
                      <label key={fee.key} style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr) auto', alignItems: 'center', gap: '0.8rem', padding: '0.8rem', borderRadius: 12, border: selectedFeeKeys.has(fee.key) ? '1px solid rgba(255,183,3,0.35)' : '1px solid rgba(255,255,255,0.08)', background: selectedFeeKeys.has(fee.key) ? 'rgba(255,183,3,0.08)' : 'rgba(255,255,255,0.03)', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={selectedFeeKeys.has(fee.key)}
                          disabled={isSubmitting}
                          onChange={() => toggleFeeSelection(fee.key)}
                        />
                        <span style={{ color: '#fff', fontWeight: 700, textTransform: 'capitalize' }}>
                          {fee.feeType === 'monthly' ? `${fee.month} ${fee.year}` : `${fee.feeType.replace('_', ' ')} ${fee.year}`}
                        </span>
                        <strong style={{ color: 'var(--gold, #ffb703)' }}>₹{Number(fee.amount || 0).toLocaleString()}</strong>
                      </label>
                    ))}
                  </div>
                  {selectedDueRecords.map((fee) => (
                    <input key={fee.key} type="hidden" name="feeKeys" value={fee.key} />
                  ))}
                  <p style={{ margin: '0.75rem 0 0', color: 'rgba(255,255,255,0.48)', fontSize: '0.8rem' }}>
                    Selected amount: ₹{selectedTotalDue.toLocaleString()}
                  </p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Payment Screenshot <span style={{ color: '#ff6b6b' }}>*</span></label>
                  <input
                    type="file"
                    name="screenshot"
                    accept="image/png,image/jpeg,image/webp"
                    required
                    disabled={isSubmitting}
                    onChange={(e) => {
                      setUiError(null)
                      const file = e.target.files?.[0]
                      if (file && !ALLOWED_SCREENSHOT_TYPES.has(String(file.type || '').toLowerCase())) {
                        setUiError('Please upload a PNG, JPG, or WebP screenshot.')
                        e.currentTarget.value = ''
                        setHasScreenshot(false)
                        return
                      }
                      if (file && file.size > MAX_SCREENSHOT_BYTES) {
                        setUiError('Payment screenshot must be 5 MB or smaller.')
                        e.currentTarget.value = ''
                        setHasScreenshot(false)
                        return
                      }
                      setHasScreenshot(Boolean(file))
                    }}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.8)', padding: '0.75rem', borderRadius: '12px', outline: 'none', fontSize: '0.9rem' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="button" onClick={() => setIsPaying(false)} disabled={isSubmitting} style={{ flex: 1, background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '12px', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.6 : 1 }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting || !hasScreenshot || selectedFeeKeys.size === 0} style={{ flex: 2, background: 'linear-gradient(135deg, var(--crimson, #d62828), #b31b1b)', color: '#fff', border: 'none', padding: '1rem', borderRadius: '12px', fontWeight: 700, cursor: isSubmitting || !hasScreenshot || selectedFeeKeys.size === 0 ? 'not-allowed' : 'pointer', opacity: isSubmitting || !hasScreenshot || selectedFeeKeys.size === 0 ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    {isSubmitting ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</> : <><Upload size={16} /> Submit Proof</>}
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.div key="action-prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.05)', borderTop: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '2rem', backdropFilter: 'blur(20px)' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>Monthly Contribution</h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                  Your dues support Dojo maintenance, master classes, and ongoing digital infrastructure like this Athlete Portal.
                </p>

                <button
                  onClick={() => setIsPaying(true)}
                  disabled={isClear}
                  style={{
                    width: '100%', background: isClear ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, var(--crimson, #d62828), #b31b1b)',
                    color: isClear ? 'rgba(255,255,255,0.2)' : '#fff', border: 'none', padding: '1.25rem', borderRadius: '16px',
                    fontFamily: 'var(--font-heading, "Outfit")', fontSize: '1rem', fontWeight: 800,
                    letterSpacing: '0.15em', textTransform: 'uppercase', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: '0.75rem', cursor: isClear ? 'not-allowed' : 'pointer',
                    boxShadow: isClear ? 'none' : '0 15px 30px rgba(214,40,40,0.3)', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  }}
                  onMouseEnter={e => { if (!isClear) e.currentTarget.style.transform = 'scale(1.02) translateY(-2px)' }}
                  onMouseLeave={e => { if (!isClear) e.currentTarget.style.transform = 'scale(1) translateY(0)' }}
                >
                  <Wallet size={20} />
                  {isClear ? 'All Dues Clear' : 'Make Payment'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── LEDGER / HISTORY ── */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <History size={20} color="rgba(255,255,255,0.4)" />
          <h2 style={{ fontFamily: 'var(--font-heading, "Outfit")', fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>Transaction Ledger</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {visibleFeeRecords.map((tx, idx) => {
            const isPaid = tx.status === 'paid'
            const isRejected = tx.status === 'rejected'
            const isPending = isPendingVerification(tx)
            const isOverdue = tx.status === 'overdue'

            let statusIcon = <AlertCircle size={24} color="var(--crimson, #d62828)" />
            let statusColor = '#ff6b6b'
            let statusBg = 'rgba(214,40,40,0.1)'
            let statusLabel = isOverdue ? 'Overdue' : 'Due'

            if (isPaid) {
              statusIcon = <CheckCircle2 size={24} color="#2dd4bf" />
              statusColor = '#2dd4bf'
              statusBg = 'rgba(45,212,191,0.1)'
              statusLabel = 'Paid'
            } else if (isPending) {
              statusIcon = <Clock size={24} color="var(--gold, #ffb703)" />
              statusColor = 'var(--gold, #ffb703)'
              statusBg = 'rgba(255,183,3,0.1)'
              statusLabel = 'Verification'
            } else if (isRejected) {
              statusIcon = <Info size={24} color="#ff8a8a" />
              statusColor = '#ff8a8a'
              statusBg = 'rgba(214,40,40,0.15)'
              statusLabel = 'Rejected'
            }

            // Capitalize Fee Type
            const feeTypeLabel = tx.feeType === 'monthly' ? `${tx.month} ${tx.year}` : `${tx.feeType} ${tx.year}`.replace('_', ' ').toUpperCase()

            return (
              <div key={tx.key || idx} className="fees-ledger-row" style={{
                display: 'flex', flexDirection: 'column', padding: '1.5rem',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))', 
                borderRadius: '20px', 
                border: `1px solid ${isRejected ? 'rgba(214,40,40,0.3)' : 'rgba(255,255,255,0.05)'}`,
                borderTop: `1px solid ${isRejected ? 'rgba(214,40,40,0.4)' : 'rgba(255,255,255,0.1)'}`,
                backdropFilter: 'blur(10px)',
                transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)', cursor: 'default'
              }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.3)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))'; e.currentTarget.style.boxShadow = 'none'; }}>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '14px', background: statusBg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {statusIcon}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', textTransform: 'capitalize' }}>
                          {feeTypeLabel}
                        </span>
                        <span style={{
                          fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                          color: statusColor, background: statusBg,
                          padding: '0.15rem 0.45rem', borderRadius: '4px',
                          border: `1px solid ${statusColor}33`,
                        }}>
                          {statusLabel}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500, display: 'flex', gap: '0.5rem' }}>
                        {isPaid && tx.paidDate ? new Date(tx.paidDate).toLocaleDateString('en-GB') : ''}
                        {tx.feeType !== 'monthly' && <span style={{ color: 'var(--gold, #ffb703)' }}>{tx.feeType.toUpperCase()}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="fees-ledger-amount" style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ fontFamily: 'var(--font-heading, "Outfit")', fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>
                      ₹{Number(tx.amount || 0).toLocaleString()}
                    </div>
                    {isPaid && tx.receiptId ? (
                      <button
                        onClick={() => handleDownloadReceipt(tx.receiptId!)}
                        disabled={downloadingId === tx.receiptId}
                        title="Download Receipt"
                        style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: '32px', height: '32px', borderRadius: '8px',
                          background: downloadingId === tx.receiptId ? 'rgba(45,212,191,0.2)' : 'rgba(45,212,191,0.1)',
                          border: '1px solid rgba(45,212,191,0.2)',
                          cursor: downloadingId === tx.receiptId ? 'wait' : 'pointer',
                          transition: 'all 0.2s ease',
                          flexShrink: 0,
                        }}
                        onMouseEnter={e => { if (downloadingId !== tx.receiptId) { e.currentTarget.style.background = 'rgba(45,212,191,0.2)'; e.currentTarget.style.transform = 'scale(1.1)' } }}
                        onMouseLeave={e => { if (downloadingId !== tx.receiptId) { e.currentTarget.style.background = 'rgba(45,212,191,0.1)'; e.currentTarget.style.transform = 'scale(1)' } }}
                      >
                        {downloadingId === tx.receiptId
                          ? <Loader2 size={16} color="#2dd4bf" style={{ animation: 'spin 1s linear infinite' }} />
                          : <Download size={16} color="#2dd4bf" />
                        }
                      </button>
                    ) : null}
                  </div>
                </div>

                {isRejected && tx.rejectedReason && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(214,40,40,0.2)', color: '#ff8a8a', fontSize: '0.85rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <AlertCircle size={14} /> <strong>Reason for Rejection:</strong> {tx.rejectedReason}
                  </div>
                )}
              </div>
            )
          })}

          {visibleFeeRecords.length === 0 && (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
              No transactions found in your historical ledger.
            </div>
          )}
        </div>
      </motion.div>


      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .fees-black-card {
            aspect-ratio: auto !important;
            padding: 1.75rem !important;
            border-radius: 20px !important;
            gap: 1.5rem !important;
          }
          .fees-black-card > div {
            gap: 0.75rem !important;
          }
          .fees-black-card .fees-balance {
            font-size: 2.2rem !important;
            margin-top: 0.5rem !important;
          }
          .fees-black-card .fees-currency {
            font-size: 1.3rem !important;
          }
          .fees-grid-top {
            grid-template-columns: 1fr !important;
            gap: 1.25rem !important;
          }
          .fees-ledger-row {
            padding: 1rem !important;
            border-radius: 14px !important;
          }
          .fees-ledger-row > div:first-child {
            flex-wrap: wrap !important;
            gap: 0.75rem !important;
          }
          .fees-ledger-row > div:first-child > div:first-child {
            gap: 0.75rem !important;
          }
          .fees-ledger-row > div:first-child > div:first-child > div:first-child {
            width: 36px !important;
            height: 36px !important;
            border-radius: 10px !important;
          }
          .fees-ledger-row > div:first-child > div:first-child > div:first-child svg {
            width: 18px !important;
            height: 18px !important;
          }
          .fees-ledger-row > div:first-child > div:first-child > div:last-child > div:first-child > span:first-child {
            font-size: 0.95rem !important;
          }
          .fees-ledger-row > div:first-child > div:first-child > div:last-child > div:first-child > span:last-child {
            font-size: 0.55rem !important;
            padding: 0.1rem 0.35rem !important;
          }
          .fees-ledger-amount {
            gap: 0.5rem !important;
          }
          .fees-ledger-amount > div:first-child {
            font-size: 1.1rem !important;
          }
          .fees-ledger-amount button {
            width: 28px !important;
            height: 28px !important;
            border-radius: 6px !important;
          }
          .fees-ledger-amount button svg {
            width: 14px !important;
            height: 14px !important;
          }
        }

        @media (max-width: 400px) {
          .fees-black-card {
            padding: 1.25rem !important;
          }
          .fees-black-card .fees-balance {
            font-size: 1.8rem !important;
          }
          .fees-black-card .fees-currency {
            font-size: 1.1rem !important;
          }
          .fees-ledger-row {
            padding: 0.85rem !important;
          }
          .fees-ledger-row > div:first-child > div:first-child > div:first-child {
            width: 32px !important;
            height: 32px !important;
          }
          .fees-ledger-row > div:first-child > div:first-child > div:last-child > div:first-child > span:first-child {
            font-size: 0.85rem !important;
          }
          .fees-ledger-amount > div:first-child {
            font-size: 1rem !important;
          }
        }
      `}} />
    </div>
  )
}
