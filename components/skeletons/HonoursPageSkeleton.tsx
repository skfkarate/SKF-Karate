import React from 'react'
import { SkeletonLine, SkeletonCircle } from './SkeletonPrimitives'
import './skeleton.css'

/**
 * HonoursPageSkeleton — mirrors honours page:
 * Hero → Dan carousel → Podium → Medal grids
 * Carousel scrolls on mobile; podium wraps; medal grid collapses.
 */
export default function HonoursPageSkeleton() {
  return (
    <div className="skel-page" aria-label="Loading honours" aria-busy="true" aria-hidden="true">
      {/* ── Hero ── */}
      <section className="skel-hero">
        <SkeletonLine width="140px" height={28} style={{ borderRadius: 50, marginBottom: 20 }} />
        <SkeletonLine width="min(55%, 200px)" height={24} style={{ marginBottom: 8 }} />
        <SkeletonLine width="min(70%, 260px)" height={56} style={{ marginBottom: 16 }} />
        <SkeletonLine width="min(80%, 400px)" height={16} />
      </section>

      {/* ── Dan carousel ── */}
      <section className="skel-section" style={{ textAlign: 'center' }}>
        <SkeletonLine width="120px" height={20} style={{ borderRadius: 50, margin: '0 auto 8px' }} />
        <SkeletonLine width="min(60%, 220px)" height={28} style={{ margin: '0 auto 32px' }} />
        <div className="skel-carousel-row">
          {[...Array(4)].map((_, i) => (
            <div className="skel-carousel-card" key={i}>
              <SkeletonCircle size={80} style={{ margin: '0 auto' }} />
              <SkeletonLine width="70%" height={18} style={{ margin: '12px auto 6px' }} />
              <SkeletonLine width="50%" height={13} style={{ margin: '0 auto 4px' }} />
              <SkeletonLine width="60%" height={12} style={{ margin: '0 auto' }} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Top 3 Podium ── */}
      <section className="skel-section skel-section--narrow" style={{ textAlign: 'center' }}>
        <SkeletonLine width="130px" height={20} style={{ borderRadius: 50, margin: '0 auto 8px' }} />
        <SkeletonLine width="min(50%, 180px)" height={28} style={{ margin: '0 auto 32px' }} />
        <div className="skel-podium">
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ textAlign: 'center', flex: '0 0 auto' }}>
              <SkeletonCircle size={i === 1 ? 72 : 56} style={{ margin: '0 auto' }} />
              <SkeletonLine width="80px" height={16} style={{ margin: '10px auto 4px' }} />
              <SkeletonLine width="50px" height={12} style={{ margin: '0 auto 4px' }} />
              <SkeletonLine width="60px" height={12} style={{ margin: '0 auto 8px' }} />
              <SkeletonLine width="50px" height={20} style={{ margin: '0 auto' }} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Medal grid ── */}
      <section className="skel-section">
        <SkeletonLine width="200px" height={24} style={{ marginBottom: 20 }} />
        <div className="skel-grid skel-grid--medals">
          {[...Array(4)].map((_, i) => (
            <div className="skel-row" key={i} style={{ gap: 12, padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
              <SkeletonCircle size={40} />
              <div className="skel-flex-1">
                <SkeletonLine width="70%" height={15} style={{ marginBottom: 4 }} />
                <SkeletonLine width="50%" height={12} style={{ marginBottom: 4 }} />
                <SkeletonLine width="80%" height={12} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
