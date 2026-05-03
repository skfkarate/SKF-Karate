import React from 'react'
import { SkeletonLine, SkeletonBlock, SkeletonButton } from './SkeletonPrimitives'
import './skeleton.css'

/**
 * ContactPageSkeleton — mirrors contact-page layout:
 * Hero → 2-column grid (form + info sidebar) → FAQs
 * Grid collapses to single column on mobile.
 */
export default function ContactPageSkeleton() {
  return (
    <div className="skel-page" aria-label="Loading contact" aria-busy="true" aria-hidden="true">
      {/* ── Hero ── */}
      <section className="skel-hero">
        <SkeletonLine width="140px" height={28} style={{ borderRadius: 50, marginBottom: 20 }} />
        <SkeletonLine width="min(70%, 260px)" height={48} style={{ marginBottom: 12 }} />
        <SkeletonLine width="min(85%, 420px)" height={16} style={{ marginBottom: 6 }} />
        <SkeletonLine width="min(65%, 320px)" height={16} />
      </section>

      {/* ── Grid (form + info sidebar) — collapses on mobile ── */}
      <div className="skel-section skel-section--wide">
        <div className="skel-grid skel-grid--2col-sidebar skel-mb-xl">
          {/* Form */}
          <div className="skel-form-card">
            <SkeletonLine width="180px" height={24} style={{ marginBottom: 24 }} />
            {[...Array(4)].map((_, i) => (
              <div className="skel-field" key={i}>
                <SkeletonLine width="100px" height={12} style={{ marginBottom: 8 }} />
                <SkeletonBlock height={44} radius={8} />
              </div>
            ))}
            <div className="skel-field">
              <SkeletonLine width="80px" height={12} style={{ marginBottom: 8 }} />
              <SkeletonBlock height={100} radius={8} />
            </div>
            <SkeletonButton width={200} height={48} style={{ marginTop: 8 }} />
          </div>

          {/* Info sidebar */}
          <div className="skel-col" style={{ gap: '1.25rem' }}>
            {[...Array(3)].map((_, i) => (
              <div className="skel-info-card" key={i}>
                <SkeletonLine width="60%" height={18} style={{ marginBottom: 12 }} />
                <SkeletonLine width="100%" height={14} style={{ marginBottom: 6 }} />
                <SkeletonLine width="80%" height={14} />
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQs ── */}
        <div className="skel-mb-xl">
          <SkeletonLine width="170px" height={22} style={{ marginBottom: 16 }} />
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <SkeletonLine width={`${70 + (i % 3) * 10}%`} height={16} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
