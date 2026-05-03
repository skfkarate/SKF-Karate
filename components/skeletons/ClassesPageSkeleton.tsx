import React from 'react'
import { SkeletonLine, SkeletonBlock, SkeletonCircle, SkeletonButton } from './SkeletonPrimitives'
import './skeleton.css'

/**
 * ClassesPageSkeleton — mirrors obs-page layout:
 * Hero (badge + title + sub + 3 stats) → Section header → City cards → 2 CTA cards
 * Uses obs-page class names + responsive skel-* classes.
 */
export default function ClassesPageSkeleton() {
  return (
    <div className="skel-page" aria-label="Loading classes" aria-busy="true" aria-hidden="true">
      {/* ── Hero ── */}
      <section className="skel-hero">
        <SkeletonLine width="200px" height={28} style={{ borderRadius: 50, marginBottom: 24 }} />
        <SkeletonLine width="min(65%, 280px)" height={24} style={{ marginBottom: 8 }} />
        <SkeletonLine width="min(80%, 340px)" height={56} style={{ marginBottom: 20 }} />
        <SkeletonLine width="min(90%, 500px)" height={16} style={{ marginBottom: 6 }} />
        <SkeletonLine width="min(70%, 380px)" height={16} style={{ marginBottom: 32 }} />

        {/* Stats row — responsive via skel-grid--stats3 */}
        <div className="skel-grid--stats3">
          {[...Array(3)].map((_, i) => (
            <div className="skel-stat" key={i}>
              <SkeletonLine width="50px" height={36} style={{ marginBottom: 6 }} />
              <SkeletonLine width="60px" height={14} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Section Header ── */}
      <div className="skel-section">
        <div className="skel-sec-head">
          <SkeletonLine width="120px" height={20} />
          <div className="skel-sec-head__bar" />
        </div>

        {/* ── City Grid — single column like real page ── */}
        <div className="skel-grid skel-grid--list skel-mb-xl">
          {[...Array(4)].map((_, i) => (
            <div className="skel-card" key={i}>
              <SkeletonBlock height={220} radius={0} />
              <div className="skel-card__body">
                <SkeletonLine width="40%" height={12} style={{ marginBottom: 8 }} />
                <SkeletonLine width="70%" height={24} style={{ marginBottom: 12 }} />
                <SkeletonLine width="55%" height={14} style={{ marginBottom: 16 }} />
                <SkeletonLine width="130px" height={14} />
              </div>
            </div>
          ))}
        </div>

        {/* ── CTA Cards — always 2-col ── */}
        <div className="skel-grid skel-grid--cta" style={{ paddingBottom: '4rem' }}>
          {[...Array(2)].map((_, i) => (
            <div className="skel-cta-card" key={i}>
              <SkeletonCircle size={48} />
              <SkeletonLine width="60%" height={22} style={{ margin: '16px 0 8px' }} />
              <SkeletonLine width="100%" height={14} style={{ marginBottom: 6 }} />
              <SkeletonLine width="80%" height={14} style={{ marginBottom: 20 }} />
              <SkeletonButton width={140} height={40} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
