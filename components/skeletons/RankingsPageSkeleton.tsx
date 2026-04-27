import React from 'react'
import { SkeletonLine, SkeletonBlock, SkeletonCircle } from './SkeletonPrimitives'

/**
 * RankingsPageSkeleton — mirrors rankings page: Hero → Podium → Leaderboard table
 */
export default function RankingsPageSkeleton() {
  return (
    <div aria-label="Loading rankings" aria-busy="true" aria-hidden="true" style={{ paddingTop: '5rem' }}>
      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '4rem 2rem 3rem', maxWidth: 700, margin: '0 auto' }}>
        <SkeletonLine width="140px" height={28} style={{ borderRadius: 50, margin: '0 auto 20px' }} />
        <SkeletonLine width="160px" height={24} style={{ margin: '0 auto 8px' }} />
        <SkeletonLine width="280px" height={56} style={{ margin: '0 auto 16px' }} />
        <SkeletonLine width="85%" height={16} style={{ margin: '0 auto' }} />
      </section>

      {/* Podium */}
      <section style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 24, padding: '2rem', marginBottom: 48 }}>
        {[80, 100, 70].map((h, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <SkeletonCircle size={i === 1 ? 72 : 56} />
            <SkeletonLine width="80px" height={14} style={{ margin: '8px auto 4px' }} />
            <SkeletonLine width="40px" height={12} style={{ margin: '0 auto 8px' }} />
            <SkeletonBlock width={80} height={h} radius={8} style={{ margin: '0 auto' }} />
          </div>
        ))}
      </section>

      {/* Leaderboard */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '0 2rem 4rem' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          {[...Array(4)].map((_, i) => (
            <SkeletonLine key={i} width={`${80 + i * 10}px`} height={34} style={{ borderRadius: 8 }} />
          ))}
        </div>
        {[...Array(10)].map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <SkeletonLine width="30px" height={20} />
            <SkeletonCircle size={36} />
            <div style={{ flex: 1 }}>
              <SkeletonLine width="55%" height={15} style={{ marginBottom: 4 }} />
              <SkeletonLine width="35%" height={11} />
            </div>
            <SkeletonLine width="60px" height={20} />
          </div>
        ))}
      </section>
    </div>
  )
}
