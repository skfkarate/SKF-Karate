'use client'

import { useMemo, useState } from 'react'

type TrainingFeeStatus = 'paid' | 'due' | 'overdue'

type TrainingFeeEntry = {
  key: string
  skfId: string
  athleteName: string
  branch: string
  month: string
  year: number
  amount: number
  status: TrainingFeeStatus
  paidDate: string | null
  receiptId: string | null
  paymentMethod: string | null
}

type TrainingFeeLedger = {
  brand: {
    featureName: string
    subtitle: string
  }
  filters: {
    year: number
    month: string
    status: string
    branch: string
    search: string
  }
  summary: {
    totalRows: number
    totalExpected: number
    totalPaid: number
    totalDue: number
    paidCount: number
    dueCount: number
    overdueCount: number
  }
  operations?: {
    activeAthletes: number
    trackedAthletes: number
    activeBranches: number
    creditsInCirculation: number
    lifetimeCredits: number
    creditHolders: number
  }
  entries: TrainingFeeEntry[]
}

const MONTHS = [
  'All',
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const rupee = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})
const compactNumber = new Intl.NumberFormat('en-IN')

function unwrapApiPayload<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
    return (payload as { data: T }).data
  }
  return payload as T
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

function formatDate(value: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function statusBadge(status: TrainingFeeStatus) {
  if (status === 'paid') {
    return {
      label: 'Paid',
      color: '#2dd4bf',
      background: 'rgba(45,212,191,0.12)',
      border: 'rgba(45,212,191,0.3)',
    }
  }

  if (status === 'overdue') {
    return {
      label: 'Overdue',
      color: '#fb7185',
      background: 'rgba(251,113,133,0.14)',
      border: 'rgba(251,113,133,0.35)',
    }
  }

  return {
    label: 'Due',
    color: '#facc15',
    background: 'rgba(250,204,21,0.12)',
    border: 'rgba(250,204,21,0.35)',
  }
}

export default function TrainingFeeAdminClient({
  initialLedger,
  initialYear,
}: {
  initialLedger: TrainingFeeLedger
  initialYear: number
}) {
  const [ledger, setLedger] = useState<TrainingFeeLedger>(initialLedger)
  const [year, setYear] = useState(initialLedger.filters.year || initialYear)
  const [month, setMonth] = useState(initialLedger.filters.month || 'All')
  const [status, setStatus] = useState(initialLedger.filters.status || 'all')
  const [branch, setBranch] = useState(initialLedger.filters.branch === 'all' ? '' : initialLedger.filters.branch)
  const [search, setSearch] = useState(initialLedger.filters.search || '')
  const [loading, setLoading] = useState(false)
  const [working, setWorking] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const currentYear = new Date().getFullYear()
  const yearOptions = useMemo(() => [currentYear + 1, currentYear, currentYear - 1, currentYear - 2], [currentYear])
  const branchOptions = useMemo(
    () =>
      Array.from(new Set(ledger.entries.map((entry) => String(entry.branch || '').trim()).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b)
      ),
    [ledger.entries]
  )

  async function loadLedger() {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const params = new URLSearchParams()
      params.set('year', String(year))
      if (month && month !== 'All') params.set('month', month)
      if (status && status !== 'all') params.set('status', status)
      if (branch) params.set('branch', branch)
      if (search.trim()) params.set('search', search.trim())

      const response = await fetch(`/api/admin/training-fee?${params.toString()}`, {
        method: 'GET',
        credentials: 'same-origin',
      })
      const payload = await response.json()
      const data = unwrapApiPayload<TrainingFeeLedger>(payload)

      if (!response.ok) {
        throw new Error(payload?.error?.message || 'Unable to load training fee ledger.')
      }

      setLedger(data)
    } catch (loadError: unknown) {
      setError(getErrorMessage(loadError, 'Unable to load training fee ledger.'))
    } finally {
      setLoading(false)
    }
  }

  async function postAction(body: Record<string, unknown>, successMessage: string, actionKey: string) {
    setWorking(actionKey)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/admin/training-fee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(body),
      })

      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload?.error?.message || 'Unable to update training fee record.')
      }

      setMessage(successMessage)
      await loadLedger()
    } catch (actionError: unknown) {
      setError(getErrorMessage(actionError, 'Unable to update training fee record.'))
    } finally {
      setWorking('')
    }
  }

  async function handleMarkPaid(entry: TrainingFeeEntry) {
    const confirmed = window.confirm(
      `Mark ${entry.skfId} ${entry.month} ${entry.year} as paid? This will unlock receipt download in athlete portal.`
    )
    if (!confirmed) return

    await postAction(
      {
        action: 'mark_paid',
        skfId: entry.skfId,
        month: entry.month,
        year: entry.year,
        paymentMethod: 'Manual Entry',
      },
      `Marked ${entry.skfId} ${entry.month} ${entry.year} as paid.`,
      `mark_paid:${entry.key}`
    )
  }

  async function handleMarkDue(entry: TrainingFeeEntry) {
    const confirmed = window.confirm(
      `Mark ${entry.skfId} ${entry.month} ${entry.year} as due? This will clear receipt and payment reference.`
    )
    if (!confirmed) return

    await postAction(
      {
        action: 'mark_due',
        skfId: entry.skfId,
        month: entry.month,
        year: entry.year,
      },
      `Marked ${entry.skfId} ${entry.month} ${entry.year} as due.`,
      `mark_due:${entry.key}`
    )
  }

  async function handleSyncStudent(skfId: string) {
    await postAction(
      { action: 'sync_student', skfId, year },
      `Training fee rows synced for ${skfId}.`,
      `sync_student:${skfId}`
    )
  }

  async function handleSyncAll() {
    const confirmed = window.confirm(`Sync all active athletes for ${year}?`)
    if (!confirmed) return

    await postAction(
      { action: 'sync_all', year },
      `Active athlete training fee rows synced for ${year}.`,
      `sync_all:${year}`
    )
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#050505', color: '#fff', paddingBottom: '4rem' }}>
      <header style={{ borderBottom: '1px solid #161616', padding: '2.2rem 2.5rem', background: '#000' }}>
        <p
          style={{
            color: '#666',
            fontSize: '0.8rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            margin: 0,
          }}
        >
          Monthly Training Fee Operations
        </p>
        <h1 style={{ margin: '0.8rem 0 0', fontSize: '2.5rem', fontWeight: 500, letterSpacing: '-0.03em' }}>
          {ledger.brand.featureName}
        </h1>
        <p style={{ margin: '0.65rem 0 0', color: '#888', maxWidth: '800px', lineHeight: 1.6 }}>
          Unified monthly training fee tracking for masters and admins. Every manual status update here flows
          directly into athlete portal due states and receipt eligibility.
        </p>
      </header>

      <div style={{ padding: '1.8rem 2.5rem', display: 'grid', gap: '1.2rem' }}>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          {[
            ['Rows', String(ledger.summary.totalRows)],
            ['Expected', rupee.format(ledger.summary.totalExpected)],
            ['Collected', rupee.format(ledger.summary.totalPaid)],
            ['Pending', rupee.format(ledger.summary.totalDue)],
            ['Overdue', String(ledger.summary.overdueCount)],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                border: '1px solid #1a1a1a',
                background: 'linear-gradient(160deg, #0e0e0e 0%, #060606 100%)',
                borderRadius: '16px',
                padding: '1rem 1.1rem',
              }}
            >
              <div style={{ color: '#666', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {label}
              </div>
              <div style={{ marginTop: '0.45rem', fontSize: '1.35rem', fontWeight: 700 }}>{value}</div>
            </div>
          ))}
        </div>

        {ledger.operations ? (
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            {[
              ['Active Athletes', compactNumber.format(ledger.operations.activeAthletes)],
              ['Tracked Athletes', compactNumber.format(ledger.operations.trackedAthletes)],
              ['Active Branches', compactNumber.format(ledger.operations.activeBranches)],
              ['Credits in Circulation', compactNumber.format(ledger.operations.creditsInCirculation)],
              ['Credit Holders', compactNumber.format(ledger.operations.creditHolders)],
              ['Lifetime Credits', compactNumber.format(ledger.operations.lifetimeCredits)],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  border: '1px solid #1a1a1a',
                  background: 'linear-gradient(160deg, #0e0e0e 0%, #060606 100%)',
                  borderRadius: '16px',
                  padding: '1rem 1.1rem',
                }}
              >
                <div style={{ color: '#666', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {label}
                </div>
                <div style={{ marginTop: '0.45rem', fontSize: '1.35rem', fontWeight: 700 }}>{value}</div>
              </div>
            ))}
          </div>
        ) : null}

        <div style={{ border: '1px solid #1a1a1a', background: '#0a0a0a', borderRadius: '16px', padding: '1rem' }}>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              void loadLedger()
            }}
            style={{
              display: 'grid',
              gap: '0.75rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              alignItems: 'center',
            }}
          >
            <select value={year} onChange={(event) => setYear(Number(event.target.value))} style={fieldStyle}>
              {yearOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>

            <select value={month} onChange={(event) => setMonth(event.target.value)} style={fieldStyle}>
              {MONTHS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <select value={status} onChange={(event) => setStatus(event.target.value)} style={fieldStyle}>
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="due">Due</option>
              <option value="overdue">Overdue</option>
            </select>

            <select value={branch} onChange={(event) => setBranch(event.target.value)} style={fieldStyle}>
              <option value="">All Branches</option>
              {branchOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search ID, athlete, branch"
              style={fieldStyle}
            />

            <button type="submit" style={primaryButton} disabled={loading}>
              {loading ? 'Refreshing...' : 'Apply Filters'}
            </button>
          </form>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: '0.85rem' }}>
            <button type="button" style={secondaryButton} onClick={() => void loadLedger()} disabled={loading}>
              Refresh
            </button>
            <button
              type="button"
              style={secondaryButton}
              onClick={() => void handleSyncAll()}
              disabled={working === `sync_all:${year}`}
            >
              {working === `sync_all:${year}` ? 'Syncing...' : `Sync Active Athletes (${year})`}
            </button>
          </div>
        </div>

        {message ? (
          <div style={{ border: '1px solid rgba(45,212,191,0.35)', background: 'rgba(45,212,191,0.08)', color: '#7df4de', padding: '0.8rem 1rem', borderRadius: '12px' }}>
            {message}
          </div>
        ) : null}
        {error ? (
          <div style={{ border: '1px solid rgba(251,113,133,0.35)', background: 'rgba(251,113,133,0.08)', color: '#ff9fb1', padding: '0.8rem 1rem', borderRadius: '12px' }}>
            {error}
          </div>
        ) : null}

        <div style={{ border: '1px solid #1a1a1a', background: '#090909', borderRadius: '16px', overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 1160, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                {['Athlete', 'Branch', 'Period', 'Amount', 'Status', 'Paid Date', 'Receipt', 'Actions'].map((label) => (
                  <th
                    key={label}
                    style={{
                      textAlign: 'left',
                      padding: '0.85rem 1rem',
                      color: '#666',
                      fontSize: '0.73rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ledger.entries.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '2rem 1rem', textAlign: 'center', color: '#666' }}>
                    No training fee rows match the current filters.
                  </td>
                </tr>
              ) : (
                ledger.entries.map((entry) => {
                  const badge = statusBadge(entry.status)
                  return (
                    <tr key={entry.key} style={{ borderBottom: '1px solid #141414' }}>
                      <td style={cellStyle}>
                        <div style={{ fontWeight: 600 }}>{entry.athleteName}</div>
                        <div style={{ color: '#777', fontSize: '0.78rem', marginTop: '0.2rem' }}>{entry.skfId}</div>
                      </td>
                      <td style={cellStyle}>{entry.branch}</td>
                      <td style={cellStyle}>
                        {entry.month} {entry.year}
                      </td>
                      <td style={cellStyle}>{rupee.format(entry.amount)}</td>
                      <td style={cellStyle}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '0.3rem 0.65rem',
                            borderRadius: '999px',
                            border: `1px solid ${badge.border}`,
                            background: badge.background,
                            color: badge.color,
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            letterSpacing: '0.03em',
                            textTransform: 'uppercase',
                          }}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td style={cellStyle}>{formatDate(entry.paidDate)}</td>
                      <td style={cellStyle}>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{entry.receiptId || '—'}</div>
                        {entry.paymentMethod ? (
                          <div style={{ color: '#666', fontSize: '0.72rem', marginTop: '0.2rem' }}>{entry.paymentMethod}</div>
                        ) : null}
                      </td>
                      <td style={{ ...cellStyle, minWidth: 240 }}>
                        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                          {entry.status === 'paid' ? (
                            <button
                              type="button"
                              style={secondaryButton}
                              onClick={() => void handleMarkDue(entry)}
                              disabled={working === `mark_due:${entry.key}`}
                            >
                              {working === `mark_due:${entry.key}` ? 'Updating...' : 'Mark Due'}
                            </button>
                          ) : (
                            <button
                              type="button"
                              style={secondaryButton}
                              onClick={() => void handleMarkPaid(entry)}
                              disabled={working === `mark_paid:${entry.key}`}
                            >
                              {working === `mark_paid:${entry.key}` ? 'Updating...' : 'Mark Paid'}
                            </button>
                          )}

                          <button
                            type="button"
                            style={secondaryButton}
                            onClick={() => void handleSyncStudent(entry.skfId)}
                            disabled={working === `sync_student:${entry.skfId}`}
                          >
                            {working === `sync_student:${entry.skfId}` ? 'Syncing...' : 'Sync Student'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const fieldStyle = {
  width: '100%',
  padding: '0.72rem 0.78rem',
  background: '#060606',
  border: '1px solid #222',
  color: '#fff',
  borderRadius: '10px',
  fontSize: '0.9rem',
} as const

const primaryButton = {
  border: '1px solid #fff',
  background: '#fff',
  color: '#000',
  borderRadius: '10px',
  padding: '0.72rem 0.95rem',
  fontWeight: 700,
  cursor: 'pointer',
} as const

const secondaryButton = {
  border: '1px solid #2a2a2a',
  background: '#101010',
  color: '#d2d2d2',
  borderRadius: '9px',
  padding: '0.45rem 0.7rem',
  fontSize: '0.78rem',
  fontWeight: 600,
  cursor: 'pointer',
} as const

const cellStyle = {
  padding: '0.78rem 1rem',
  fontSize: '0.88rem',
  color: '#e5e5e5',
  verticalAlign: 'top',
} as const
