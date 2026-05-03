import React from 'react'
import { SkeletonLine } from './SkeletonPrimitives'
import './skeleton.css'

/**
 * TechniquesPageSkeleton — mirrors techniques page:
 * Hero → Belt filter pills → Technique cards grid
 * Grid collapses to single column on mobile.
 */
export default function TechniquesPageSkeleton() {
  return (
    <div className="skel-page" aria-label="Loading techniques" aria-busy="true" aria-hidden="true">
      {/* ── Hero ── */}
      <section className="skel-hero">
        <SkeletonLine width="180px" height={28} style={{ borderRadius: 50, marginBottom: 20 }} />
        <SkeletonLine width="min(80%, 320px)" height={48} style={{ marginBottom: 12 }} />
        <SkeletonLine width="min(80%, 400px)" height={16} />
      </section>

      {/* ── Content ── */}
      <div className="skel-section skel-section--wide">
        {/* Belt filter */}
        <div className="skel-filters skel-filters--center">
          {[...Array(7)].map((_, i) => (
            <SkeletonLine key={i} width={`${70 + i * 5}px`} height={34} style={{ borderRadius: 50 }} />
          ))}
        </div>

        {/* Technique cards */}
        <div className="skel-grid skel-grid--techniques">
          {[...Array(6)].map((_, i) => (
            <div className="skel-card--padded" key={i} style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: '1.5rem' }}>
              <div className="skel-row skel-mb-md" style={{ gap: 8 }}>
                <SkeletonLine width="60px" height={20} style={{ borderRadius: 50 }} />
                <SkeletonLine width="80px" height={20} style={{ borderRadius: 50 }} />
              </div>
              <SkeletonLine width="75%" height={20} style={{ marginBottom: 8 }} />
              <SkeletonLine width="50%" height={14} style={{ marginBottom: 12 }} />
              <SkeletonLine width="100%" height={13} style={{ marginBottom: 4 }} />
              <SkeletonLine width="85%" height={13} style={{ marginBottom: 4 }} />
              <SkeletonLine width="65%" height={13} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
