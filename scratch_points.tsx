'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Crown, Medal, TrendingUp, Trophy } from 'lucide-react'

import PointsHistory from '@/app/_components/points/PointsHistory'
import TierProgressBar from '@/app/_components/points/TierProgressBar'
import { PointsPageSkeleton } from '../_components/skeletons/PointsPageSkeleton'

type BalanceState = {
  balance: number
  tier: string
  totalEarned: number
}

type LeaderboardEntry = {
  rank: number
  name: string
  belt: string
  points: number
}

export default function PointsClient() {
  const [balance, setBalance] = useState<BalanceState | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadPoints() {
      setLoading(true)
      setError('')

      try {
        const [balanceRes, leaderboardRes] = await Promise.all([
          fetch('/api/points/balance', { cache: 'no-store' }),
          fetch('/api/points/leaderboard', { cache: 'no-store' }),
        ])

        if (balanceRes.status === 401 || leaderboardRes.status === 401) {
          window.location.href = '/portal/login'
          return
        }

        if (!balanceRes.ok) throw new Error('Unable to load points balance.')
        if (!leaderboardRes.ok) throw new Error('Unable to load leaderboard.')

        const balanceData = await balanceRes.json()
        const leaderboardData = await leaderboardRes.json()

        if (!cancelled) {
          setBalance({
            balance: Number(balanceData.balance || 0),
            tier: String(balanceData.tier || 'white'),
            totalEarned: Number(balanceData.totalEarned || 0),
          })
          setLeaderboard(leaderboardData.leaderboard || [])
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load points.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadPoints()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return <PointsPageSkeleton />
  }

  return (
    <div style={{ padding: '2rem 1rem 6rem', maxWidth: '1100px', margin: '0 auto', width: '100%', minHeight: '70vh' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ paddingTop: '5rem', marginBottom: '3rem', textAlign: 'center' }}>
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
          SKF Rewards Program
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', margin: '0 auto', maxWidth: '620px', fontWeight: 500, lineHeight: 1.6 }}>
          Track earned points, tier progress, and monthly leaderboard activity.
        </p>
      </motion.div>

      {error ? (
        <div style={{ padding: '3rem 2rem', borderRadius: 24, border: '1px solid rgba(214,40,40,0.25)', background: 'rgba(214,40,40,0.08)', color: '#ffb4b4', textAlign: 'center', fontWeight: 700 }}>
          {error}
        </div>
      ) : balance ? (
        <div style={{ display: 'grid', gap: '2rem' }}>
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <MetricCard icon={<Crown size={24} />} label="Current Balance" value={balance.balance.toLocaleString()} />
            <MetricCard icon={<TrendingUp size={24} />} label="Lifetime Points" value={balance.totalEarned.toLocaleString()} />
            <MetricCard icon={<Medal size={24} />} label="Current Tier" value={balance.tier.replace(/-/g, ' ')} />
          </section>

          <TierProgressBar currentTier={balance.tier} totalEarned={balance.totalEarned} />

          <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '2rem' }}>
            <Leaderboard entries={leaderboard} />
            <PointsHistory />
          </section>
        </div>
      ) : null}
    </div>
  )
}

function MetricCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 20,
      padding: '1.4rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    }}>
      <div style={{ width: 50, height: 50, borderRadius: 16, background: 'rgba(255,183,3,0.11)', color: 'var(--gold, #ffb703)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <div>
        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800 }}>{label}</div>
        <div style={{ color: '#fff', fontFamily: 'var(--font-heading, "Outfit")', fontSize: '1.8rem', fontWeight: 900, textTransform: label === 'Current Tier' ? 'capitalize' : undefined }}>{value}</div>
      </div>
    </div>
  )
}

function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <section style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: '1.5rem' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', margin: '0 0 1rem', color: '#fff', fontSize: '1.4rem', fontWeight: 850 }}>
        <Trophy size={20} color="var(--gold, #ffb703)" />
        Monthly Leaderboard
      </h2>
      {entries.length === 0 ? (
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.45)' }}>No leaderboard activity for this month yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: '0.65rem' }}>
          {entries.map((entry) => (
            <div key={`${entry.rank}-${entry.name}`} style={{ display: 'grid', gridTemplateColumns: '44px minmax(0, 1fr) auto', gap: '0.9rem', alignItems: 'center', padding: '0.9rem', borderRadius: 16, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <strong style={{ color: entry.rank <= 3 ? 'var(--gold, #ffb703)' : 'rgba(255,255,255,0.55)', fontSize: '1.1rem' }}>#{entry.rank}</strong>
              <div>
                <div style={{ color: '#fff', fontWeight: 800 }}>{entry.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.42)', fontSize: '0.78rem', textTransform: 'capitalize' }}>{entry.belt} belt</div>
              </div>
              <strong style={{ color: '#2dd4bf' }}>{entry.points.toLocaleString()} pts</strong>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
