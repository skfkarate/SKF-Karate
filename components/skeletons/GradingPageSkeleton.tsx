import React from 'react'
import { SkeletonLine, SkeletonCircle } from './SkeletonPrimitives'
import '@/app/grading/grading.css'

/**
 * GradingPageSkeleton — mirrors grading page:
 * Hero → Kyu timeline → Dan grid → CTA
 */
export default function GradingPageSkeleton() {
  return (
    <div className="grd-page" aria-label="Loading grading" aria-busy="true" aria-hidden="true">
      <div className="grd-orb grd-orb--1" />
      <div className="grd-orb grd-orb--2" />
      <div className="grd-watermark" aria-hidden="true">段</div>

      {/* ── Hero ── */}
      <section className="grd-hero">
        <SkeletonLine width="160px" height={28} style={{ borderRadius: 50, marginBottom: 20 }} />
        
        <div className="grd-hero__title" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
           <SkeletonLine width="300px" height={60} />
           <SkeletonLine width="360px" height={60} />
        </div>
        
        <div className="grd-hero__sub" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
           <SkeletonLine width="500px" height={16} />
           <SkeletonLine width="400px" height={16} />
        </div>

        {/* Belt colour preview strip */}
        <div className="grd-belt-strip" style={{ marginTop: '3rem' }}>
            <div className="grd-belt-strip__track">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="grd-belt-chip" style={{ width: 100, border: '1px solid rgba(255,255,255,0.1)' }}>
                       <SkeletonLine width="100%" height={24} style={{ background: 'transparent' }} />
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* ── Kyu section ── */}
      <section className="grd-kyu-section">
        <div className="container">
          <div className="grd-section-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <SkeletonLine width="120px" height={24} style={{ borderRadius: 50 }} />
            <SkeletonLine width="320px" height={48} />
            <SkeletonLine width="400px" height={16} />
          </div>

          <div className="grd-kyu-ladder" style={{ marginTop: '4rem' }}>
            {[...Array(6)].map((_, i) => (
              <div className="grd-kyu-rung" key={i}>
                <SkeletonLine width="40px" height={40} style={{ borderRadius: 8, flexShrink: 0 }} />
                <div className="grd-kyu-rung__bar-group" style={{ flex: 1, padding: '0 2rem' }}>
                   <SkeletonLine width="100%" height={16} />
                </div>
                <SkeletonLine width="60px" height={16} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
