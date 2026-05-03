import React from 'react'
import { SkeletonLine, SkeletonBlock } from './SkeletonPrimitives'
import './skeleton.css'

/**
 * ShopPageSkeleton — mirrors shop listing:
 * Header → Filter tabs → Product grid
 * Product grid collapses to single column on mobile.
 */
export default function ShopPageSkeleton() {
  return (
    <div className="skel-page" aria-label="Loading shop" aria-busy="true" aria-hidden="true">
      {/* ── Header ── */}
      <section className="skel-hero skel-hero--compact">
        <SkeletonLine width="min(60%, 200px)" height={40} style={{ marginBottom: 12 }} />
        <SkeletonLine width="min(80%, 400px)" height={16} style={{ marginBottom: 6 }} />
        <SkeletonLine width="min(60%, 320px)" height={16} />
      </section>

      {/* ── Content ── */}
      <div className="skel-section skel-section--wide skel-section--flush">
        {/* Filter tabs */}
        <div className="skel-filters skel-filters--center">
          {[...Array(5)].map((_, i) => (
            <SkeletonLine key={i} width={`${70 + i * 12}px`} height={36} style={{ borderRadius: 8 }} />
          ))}
        </div>

        {/* Product grid */}
        <div className="skel-grid skel-grid--products">
          {[...Array(6)].map((_, i) => (
            <div className="skel-card" key={i}>
              <SkeletonBlock height={300} radius={0} />
              <div className="skel-card__body">
                <SkeletonLine width="50%" height={11} style={{ marginBottom: 8 }} />
                <SkeletonLine width="80%" height={20} style={{ marginBottom: 12 }} />
                <SkeletonLine width="80px" height={22} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
