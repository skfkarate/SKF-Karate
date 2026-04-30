import React from 'react'
import { SkeletonLine } from './SkeletonPrimitives'

/**
 * GradingPageSkeleton — mirrors grading page: Hero → Kyu timeline → Dan grid → CTA
 */
export default function GradingPageSkeleton() {
  return (
    <div aria-label="Loading grading" aria-busy="true" aria-hidden="true" style={{ paddingTop: '5rem' }}>
      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '6rem 2rem 4rem', maxWidth: 700, margin: '0 auto' }}>
        <SkeletonLine width="200px" height={28} style={{ borderRadius: 50, margin: '0 auto 20px' }} />
        <SkeletonLine width="280px" height={48} style={{ margin: '0 auto 12px' }} />
        <SkeletonLine width="80%" height={16} style={{ margin: '0 auto 6px' }} />
        <SkeletonLine width="60%" height={16} style={{ margin: '0 auto' }} />
      </section>

      {/* Kyu section */}
      <section style={{ padding: '3rem 2rem', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <SkeletonLine width="160px" height={24} style={{ borderRadius: 50, margin: '0 auto 12px' }} />
        <SkeletonLine width="220px" height={36} style={{ margin: '0 auto 32px' }} />
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: i % 2 === 0 ? 'flex-start' : 'flex-end', marginBottom: 32 }}>
            <div style={{ width: '45%', padding: 24, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                <SkeletonLine width="50px" height={40} style={{ borderRadius: 8 }} />
                <div>
                  <SkeletonLine width="80px" height={14} style={{ marginBottom: 4 }} />
                  <SkeletonLine width="120px" height={18} />
                </div>
              </div>
              <SkeletonLine width="100%" height={13} style={{ marginBottom: 4 }} />
              <SkeletonLine width="75%" height={13} />
            </div>
          </div>
        ))}
      </section>

      {/* Dan section */}
      <section style={{ padding: '3rem 2rem', maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
        <SkeletonLine width="240px" height={36} style={{ margin: '0 auto 32px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ padding: 24, borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
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
