import React from 'react'
import { SkeletonLine, SkeletonButton } from './SkeletonPrimitives'
import './skeleton.css'

/**
 * HomePageSkeleton — mirrors the home page hero-only layout.
 * The home page currently only renders HomeHero (other sections commented out).
 * Uses CSS classes for full mobile responsiveness.
 */
export default function HomePageSkeleton() {
  return (
    <div className="skel-page" aria-label="Loading page" aria-busy="true" aria-hidden="true">
      {/* ── Hero Section — full viewport centered ── */}
      <section className="skel-hero skel-hero--full">
        {/* Badge */}
        <SkeletonLine width="180px" height={30} style={{ borderRadius: 50, marginBottom: 24 }} />
        {/* Title */}
        <SkeletonLine width="min(70%, 500px)" height={48} style={{ marginBottom: 16 }} />
        {/* Subtitle */}
        <SkeletonLine width="min(55%, 400px)" height={20} style={{ marginBottom: 12 }} />
        <SkeletonLine width="min(40%, 320px)" height={16} style={{ marginBottom: 32 }} />
        {/* CTA Buttons */}
        <div className="skel-row skel-row--center skel-row--wrap" style={{ gap: 16 }}>
          <SkeletonButton width={180} height={48} />
          <SkeletonButton width={160} height={48} />
        </div>
      </section>
    </div>
  )
}
