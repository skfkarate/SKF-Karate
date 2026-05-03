import React from 'react'
import { SkeletonLine } from './SkeletonPrimitives'
import './skeleton.css'

/**
 * GradingPageSkeleton — mirrors grading page:
 * Hero → Kyu timeline → Dan grid → CTA
 * Timeline items go full-width on mobile; dan grid collapses.
 */
export default function GradingPageSkeleton() {
  return (
    <div className="skel-page" aria-label="Loading grading" aria-busy="true" aria-hidden="true">
      {/* ── Hero ── */}
      <section className="skel-hero">
        <SkeletonLine width="200px" height={28} style={{ borderRadius: 50, marginBottom: 20 }} />
        <SkeletonLine width="min(70%, 280px)" height={48} style={{ marginBottom: 12 }} />
        <SkeletonLine width="min(80%, 400px)" height={16} style={{ marginBottom: 6 }} />
        <SkeletonLine width="min(60%, 300px)" height={16} />
      </section>

      {/* ── Kyu section ── */}
      <section className="skel-section skel-section--narrow" style={{ textAlign: 'center' }}>
        <SkeletonLine width="160px" height={24} style={{ borderRadius: 50, margin: '0 auto 12px' }} />
        <SkeletonLine width="min(60%, 220px)" height={36} style={{ margin: '0 auto 32px' }} />
        <div className="skel-timeline">
          {[...Array(6)].map((_, i) => (
            <div className="skel-timeline-item" key={i}>
              <SkeletonLine width="50px" height={40} style={{ borderRadius: 8, flexShrink: 0 }} />
              <div className="skel-flex-1">
                <SkeletonLine width="80px" height={14} style={{ marginBottom: 4 }} />
                <SkeletonLine width="120px" height={18} style={{ marginBottom: 8 }} />
                <SkeletonLine width="100%" height={13} style={{ marginBottom: 4 }} />
                <SkeletonLine width="75%" height={13} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Dan section ── */}
      <section className="skel-section" style={{ textAlign: 'center' }}>
        <SkeletonLine width="min(60%, 240px)" height={36} style={{ margin: '0 auto 32px' }} />
        <div className="skel-grid skel-grid--dan">
          {[...Array(5)].map((_, i) => (
            <div className="skel-card--padded" key={i} style={{ textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '1.5rem' }}>
              <SkeletonLine width="40px" height={40} style={{ margin: '0 auto 12px' }} />
              <SkeletonLine width="80%" height={18} style={{ margin: '0 auto 6px' }} />
              <SkeletonLine width="60%" height={13} style={{ margin: '0 auto 12px' }} />
              <SkeletonLine width="100%" height={12} style={{ marginBottom: 4 }} />
              <SkeletonLine width="85%" height={12} />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
