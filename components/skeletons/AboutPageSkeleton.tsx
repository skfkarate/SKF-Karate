import React from 'react'
import { SkeletonLine, SkeletonBlock, SkeletonCircle } from './SkeletonPrimitives'
import './skeleton.css'

/**
 * AboutPageSkeleton — mirrors about page:
 * Hero (logo + badge + title + stats bento) → Legacy section (text + image) →
 * Committee grid → Affiliations → CTA
 * All grids collapse responsively on mobile.
 */
export default function AboutPageSkeleton() {
  return (
    <div className="skel-page" aria-label="Loading about page" aria-busy="true" aria-hidden="true">
      {/* ── Hero ── */}
      <section className="skel-hero">
        <SkeletonCircle size={100} />
        <SkeletonLine width="100px" height={24} style={{ borderRadius: 50, marginTop: 20, marginBottom: 24 }} />
        <SkeletonLine width="min(60%, 250px)" height={24} style={{ marginBottom: 8 }} />
        <SkeletonLine width="min(70%, 280px)" height={56} style={{ marginBottom: 16 }} />
        <SkeletonLine width="min(80%, 400px)" height={16} style={{ marginBottom: 32 }} />

        {/* Stats bento — responsive 4→2 columns */}
        <div className="skel-grid skel-grid--stats4" style={{ width: '100%' }}>
          {[...Array(4)].map((_, i) => (
            <div className="skel-card--padded" key={i} style={{ textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: '1.25rem' }}>
              <SkeletonLine width="60px" height={32} style={{ margin: '0 auto 8px' }} />
              <SkeletonLine width="80px" height={14} style={{ margin: '0 auto' }} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Legacy section (text + image) ── */}
      <section className="skel-section">
        <div className="skel-legacy-grid">
          <div>
            <SkeletonLine width="90px" height={20} style={{ borderRadius: 50, marginBottom: 12 }} />
            <SkeletonLine width="min(80%, 250px)" height={32} style={{ marginBottom: 16 }} />
            <SkeletonLine width="min(60%, 180px)" height={18} style={{ marginBottom: 16 }} />
            <SkeletonLine width="100%" height={14} style={{ marginBottom: 6 }} />
            <SkeletonLine width="95%" height={14} style={{ marginBottom: 6 }} />
            <SkeletonLine width="88%" height={14} style={{ marginBottom: 6 }} />
            <SkeletonLine width="70%" height={14} style={{ marginBottom: 24 }} />
            {/* Quote block */}
            <div className="skel-quote">
              <SkeletonLine width="100%" height={14} style={{ marginBottom: 6 }} />
              <SkeletonLine width="80%" height={14} style={{ marginBottom: 12 }} />
              <SkeletonLine width="140px" height={12} />
            </div>
          </div>
          <SkeletonBlock height={420} radius={16} />
        </div>
      </section>

      {/* ── Committee grid ── */}
      <section className="skel-section" style={{ textAlign: 'center' }}>
        <SkeletonLine width="100px" height={20} style={{ borderRadius: 50, margin: '0 auto 12px' }} />
        <SkeletonLine width="min(60%, 240px)" height={32} style={{ margin: '0 auto 12px' }} />
        <SkeletonLine width="min(70%, 400px)" height={14} style={{ margin: '0 auto 40px' }} />
        <div className="skel-grid skel-grid--roster">
          {[...Array(4)].map((_, i) => (
            <div className="skel-card" key={i}>
              <SkeletonBlock height={280} radius={0} />
              <div className="skel-card__body">
                <SkeletonLine width="60%" height={12} style={{ marginBottom: 6 }} />
                <SkeletonLine width="80%" height={18} style={{ marginBottom: 10 }} />
                <div className="skel-row" style={{ gap: 8 }}>
                  <SkeletonLine width="80px" height={22} style={{ borderRadius: 50 }} />
                  <SkeletonLine width="90px" height={22} style={{ borderRadius: 50 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
