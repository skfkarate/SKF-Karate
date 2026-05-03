import React from 'react'
import { SkeletonLine, SkeletonCircle } from './SkeletonPrimitives'
import './skeleton.css'

/**
 * ResultsPageSkeleton — mirrors results page:
 * Hero stats → Filter tabs → Tournament list
 * Stats row and filters wrap on mobile.
 */
export default function ResultsPageSkeleton() {
  return (
    <div className="skel-page" aria-label="Loading results" aria-busy="true" aria-hidden="true">
      {/* ── Hero with stats ── */}
      <section className="skel-hero">
        <SkeletonLine width="140px" height={28} style={{ borderRadius: 50, marginBottom: 20 }} />
        <SkeletonLine width="min(70%, 280px)" height={48} style={{ marginBottom: 12 }} />
        <SkeletonLine width="min(80%, 400px)" height={16} style={{ marginBottom: 32 }} />
        <div className="skel-row skel-row--center skel-row--wrap" style={{ gap: 32 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <SkeletonLine width="50px" height={32} style={{ margin: '0 auto 6px' }} />
              <SkeletonLine width="70px" height={12} style={{ margin: '0 auto' }} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Tournament cards ── */}
      <section className="skel-section skel-section--wide">
        <div className="skel-filters">
          {[...Array(4)].map((_, i) => (
            <SkeletonLine key={i} width={`${80 + i * 8}px`} height={34} style={{ borderRadius: 8 }} />
          ))}
        </div>
        {[...Array(6)].map((_, i) => (
          <div className="skel-list-row" key={i} style={{ gap: '1.25rem' }}>
            <SkeletonCircle size={48} />
            <div className="skel-flex-1">
              <SkeletonLine width="65%" height={18} style={{ marginBottom: 6 }} />
              <SkeletonLine width="40%" height={13} />
            </div>
            <SkeletonLine width="100px" height={28} style={{ borderRadius: 8 }} />
          </div>
        ))}
      </section>
    </div>
  )
}
