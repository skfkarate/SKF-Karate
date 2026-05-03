import React from 'react'
import { SkeletonLine, SkeletonBlock } from './SkeletonPrimitives'
import './skeleton.css'

/**
 * GalleryPageSkeleton — mirrors gallery-page layout:
 * Hero (badge + title + stats row) → Filter bar → Section header → Masonry grid
 * Masonry collapses: 3→2→1 columns on mobile.
 */
export default function GalleryPageSkeleton() {
  return (
    <div className="skel-page" aria-label="Loading gallery" aria-busy="true" aria-hidden="true">
      {/* ── Hero ── */}
      <section className="skel-hero">
        <SkeletonLine width="160px" height={28} style={{ borderRadius: 50, marginBottom: 20 }} />
        <SkeletonLine width="min(70%, 280px)" height={48} style={{ marginBottom: 12 }} />
        <SkeletonLine width="min(80%, 400px)" height={16} style={{ marginBottom: 32 }} />
        {/* Stats row */}
        <div className="skel-row skel-row--center skel-row--wrap" style={{ gap: 32 }}>
          <div style={{ textAlign: 'center' }}>
            <SkeletonLine width="40px" height={28} style={{ margin: '0 auto 4px' }} />
            <SkeletonLine width="50px" height={12} style={{ margin: '0 auto' }} />
          </div>
          <SkeletonBlock width={1} height={30} radius={0} />
          <div style={{ textAlign: 'center' }}>
            <SkeletonLine width="30px" height={28} style={{ margin: '0 auto 4px' }} />
            <SkeletonLine width="70px" height={12} style={{ margin: '0 auto' }} />
          </div>
          <SkeletonBlock width={1} height={30} radius={0} />
          <div style={{ textAlign: 'center' }}>
            <SkeletonLine width="25px" height={28} style={{ margin: '0 auto 4px' }} />
            <SkeletonLine width="60px" height={12} style={{ margin: '0 auto' }} />
          </div>
        </div>
      </section>

      {/* ── Filter Bar ── */}
      <div className="skel-section skel-section--wide skel-section--flush">
        <div className="skel-filters">
          {[...Array(6)].map((_, i) => (
            <SkeletonLine key={i} width={`${70 + i * 10}px`} height={34} style={{ borderRadius: 50 }} />
          ))}
        </div>

        {/* Section header */}
        <div className="skel-row skel-row--between skel-mb-lg">
          <SkeletonLine width="180px" height={28} />
          <SkeletonLine width="80px" height={14} />
        </div>

        {/* ── Masonry Grid — responsive 3→2→1 columns ── */}
        <div className="skel-masonry">
          {[220, 300, 180, 280, 200, 320, 240, 260, 190, 310, 230, 270].map((h, i) => (
            <SkeletonBlock key={i} height={h} radius={12} />
          ))}
        </div>
      </div>
    </div>
  )
}
