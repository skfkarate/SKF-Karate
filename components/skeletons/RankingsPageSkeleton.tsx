import React from 'react'
import { SkeletonLine, SkeletonBlock, SkeletonCircle } from './SkeletonPrimitives'
import './skeleton.css'

/**
 * RankingsPageSkeleton — mirrors rankings page:
 * Hero → Podium → Leaderboard table
 * Podium wraps on mobile; table rows stay horizontal.
 */
export default function RankingsPageSkeleton() {
  return (
    <div className="skel-page" aria-label="Loading rankings" aria-busy="true" aria-hidden="true">
      {/* ── Hero ── */}
      <section className="skel-hero">
        <SkeletonLine width="140px" height={28} style={{ borderRadius: 50, marginBottom: 20 }} />
        <SkeletonLine width="min(50%, 160px)" height={24} style={{ marginBottom: 8 }} />
        <SkeletonLine width="min(70%, 280px)" height={56} style={{ marginBottom: 16 }} />
        <SkeletonLine width="min(85%, 400px)" height={16} />
      </section>

      {/* ── Podium ── */}
      <div className="skel-podium skel-mb-2xl">
        {[80, 100, 70].map((h, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <SkeletonCircle size={i === 1 ? 72 : 56} style={{ margin: '0 auto' }} />
            <SkeletonLine width="80px" height={14} style={{ margin: '8px auto 4px' }} />
            <SkeletonLine width="40px" height={12} style={{ margin: '0 auto 8px' }} />
            <SkeletonBlock width={80} height={h} radius={8} style={{ margin: '0 auto' }} />
          </div>
        ))}
      </div>

      {/* ── Leaderboard ── */}
      <section className="skel-section">
        <div className="skel-filters">
          {[...Array(4)].map((_, i) => (
            <SkeletonLine key={i} width={`${80 + i * 10}px`} height={34} style={{ borderRadius: 8 }} />
          ))}
        </div>
        {[...Array(10)].map((_, i) => (
          <div className="skel-list-row" key={i}>
            <SkeletonLine width="30px" height={20} />
            <SkeletonCircle size={36} />
            <div className="skel-flex-1">
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
