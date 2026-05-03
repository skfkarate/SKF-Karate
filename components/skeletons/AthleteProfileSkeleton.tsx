import React from 'react'
import { SkeletonLine, SkeletonCircle } from './SkeletonPrimitives'
import './skeleton.css'

/**
 * AthleteProfileSkeleton — mirrors athlete/[skfId] profile page.
 * Profile header stacks on mobile (avatar above name).
 * Stats row goes 2x2 on mobile. Achievement grid collapses.
 */
export default function AthleteProfileSkeleton() {
  return (
    <div className="skel-page" aria-label="Loading athlete profile" aria-busy="true" aria-hidden="true">
      <div className="skel-section" style={{ paddingTop: '6rem' }}>
        {/* ── Profile header — stacks on mobile ── */}
        <div className="skel-profile-head">
          <SkeletonCircle size={120} />
          <div className="skel-flex-1">
            <SkeletonLine width="100px" height={14} style={{ marginBottom: 8 }} />
            <SkeletonLine width="min(80%, 250px)" height={36} style={{ marginBottom: 8 }} />
            <div className="skel-row skel-row--wrap skel-mb-sm" style={{ gap: 10 }}>
              <SkeletonLine width="80px" height={24} style={{ borderRadius: 50 }} />
              <SkeletonLine width="100px" height={24} style={{ borderRadius: 50 }} />
              <SkeletonLine width="90px" height={24} style={{ borderRadius: 50 }} />
            </div>
            <SkeletonLine width="200px" height={14} />
          </div>
        </div>

        {/* ── Stats row — 4→2 columns on mobile ── */}
        <div className="skel-grid skel-grid--stats4 skel-mb-2xl">
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ padding: '1.5rem', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <SkeletonLine width="50px" height={32} style={{ margin: '0 auto 8px' }} />
              <SkeletonLine width="80px" height={13} style={{ margin: '0 auto' }} />
            </div>
          ))}
        </div>

        {/* ── Achievement section ── */}
        <SkeletonLine width="180px" height={24} style={{ marginBottom: 20 }} />
        <div className="skel-grid skel-grid--medals">
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ padding: 20, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
              <SkeletonLine width="60%" height={16} style={{ marginBottom: 8 }} />
              <SkeletonLine width="80%" height={13} style={{ marginBottom: 6 }} />
              <SkeletonLine width="50%" height={13} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
