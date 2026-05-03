import React from 'react'
import { SkeletonLine, SkeletonBlock, SkeletonButton } from './SkeletonPrimitives'
import './skeleton.css'

/**
 * BookTrialPageSkeleton — mirrors book-trial page:
 * Back button → 2-col (hero info + form)
 * Columns stack on mobile with form below info.
 */
export default function BookTrialPageSkeleton() {
  return (
    <div className="skel-page" aria-label="Loading booking form" aria-busy="true" aria-hidden="true">
      <div className="skel-section skel-section--wide" style={{ paddingTop: '6rem' }}>
        {/* Back */}
        <SkeletonLine width="80px" height={16} style={{ marginBottom: 32 }} />

        <div className="skel-grid skel-grid--2col">
          {/* ── Hero side ── */}
          <div>
            <SkeletonLine width="min(80%, 200px)" height={24} style={{ marginBottom: 8 }} />
            <SkeletonLine width="min(90%, 280px)" height={48} style={{ marginBottom: 16 }} />
            <SkeletonLine width="100%" height={14} style={{ marginBottom: 6 }} />
            <SkeletonLine width="85%" height={14} style={{ marginBottom: 24 }} />

            {/* Feature list */}
            {[...Array(4)].map((_, i) => (
              <div className="skel-row skel-mb-sm" key={i} style={{ gap: 10 }}>
                <SkeletonBlock width={20} height={20} radius={4} />
                <SkeletonLine width={`${150 + i * 20}px`} height={14} style={{ maxWidth: '80%' }} />
              </div>
            ))}

            {/* Branch preview */}
            <div className="skel-info-card skel-mt-lg">
              <SkeletonLine width="100px" height={12} style={{ marginBottom: 8 }} />
              <SkeletonLine width="180px" height={18} style={{ marginBottom: 6 }} />
              <SkeletonLine width="140px" height={13} />
            </div>
          </div>

          {/* ── Form side ── */}
          <div className="skel-form-card">
            <SkeletonLine width="180px" height={24} style={{ marginBottom: 24 }} />
            {[...Array(4)].map((_, i) => (
              <div className="skel-field" key={i}>
                <SkeletonLine width="120px" height={12} style={{ marginBottom: 8 }} />
                <SkeletonBlock height={44} radius={8} />
              </div>
            ))}
            <div className="skel-field">
              <SkeletonLine width="160px" height={12} style={{ marginBottom: 8 }} />
              <SkeletonBlock height={44} radius={8} />
            </div>
            <SkeletonButton width="100%" height={48} style={{ marginTop: 8 }} />
          </div>
        </div>
      </div>
    </div>
  )
}
