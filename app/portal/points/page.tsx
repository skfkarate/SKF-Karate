'use client'

import { useEffect, useState } from 'react'
import { FaCoins } from 'react-icons/fa'
import { usePortalAuth } from '@/app/_components/portal/usePortalAuth'
import PointsHistory from '@/app/_components/points/PointsHistory'
import TierProgressBar from '@/app/_components/points/TierProgressBar'

type PointsBalance = {
  balance: number
  tier: string
  totalEarned: number
}

export default function PortalPointsPage() {
  usePortalAuth()

  const [balance, setBalance] = useState<PointsBalance | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadBalance() {
      try {
        const response = await fetch('/api/points/balance', { cache: 'no-store' })
        const payload = await response.json().catch(() => null)
        if (!response.ok || !payload) {
          throw new Error('Unable to load points balance.')
        }

        if (!cancelled) {
          setBalance({
            balance: Number(payload.balance || 0),
            tier: String(payload.tier || 'white'),
            totalEarned: Number(payload.totalEarned || 0),
          })
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load points balance.')
        }
      }
    }

    const id = window.setTimeout(loadBalance, 0)
    return () => {
      cancelled = true
      window.clearTimeout(id)
    }
  }, [])

  return (
    <div style={{ padding: '2rem 1rem 4rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <header style={{ marginBottom: '2rem' }}>
        <p style={{ color: 'var(--gold, #ffb703)', textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 800, fontSize: '0.8rem', marginBottom: '0.7rem' }}>
          SKF Rewards
        </p>
        <h1 style={{ margin: 0, color: '#fff', fontSize: 'clamp(2.4rem, 5vw, 4rem)', fontFamily: 'var(--font-heading, "Outfit")', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <FaCoins color="var(--gold, #ffb703)" />
          Points
        </h1>
      </header>

      {error ? (
        <div style={{ color: '#ff8a8a', border: '1px solid rgba(214,40,40,0.35)', background: 'rgba(214,40,40,0.08)', padding: '1rem', borderRadius: '12px', marginBottom: '2rem' }}>
          {error}
        </div>
      ) : null}

      {balance ? (
        <>
          <div style={{ background: 'linear-gradient(145deg, rgba(20,26,38,0.9), rgba(10,14,22,0.96))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.75rem', fontWeight: 800 }}>Available Balance</div>
            <div style={{ color: 'var(--gold, #ffb703)', fontSize: '3rem', fontWeight: 900, lineHeight: 1.1 }}>{balance.balance.toLocaleString()}</div>
          </div>
          <TierProgressBar currentTier={balance.tier} totalEarned={balance.totalEarned} />
        </>
      ) : (
        <div style={{ color: 'rgba(255,255,255,0.55)', padding: '2rem', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', marginBottom: '2rem' }}>
          Loading points...
        </div>
      )}

      <PointsHistory />
    </div>
  )
}
