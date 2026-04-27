import React from 'react'
import { SkeletonLine, SkeletonBlock, SkeletonCircle } from './SkeletonPrimitives'

/**
 * ResultsPageSkeleton — mirrors results page: Hero stats → Tournament list
 */
export default function ResultsPageSkeleton() {
  return (
    <div aria-label="Loading results" aria-busy="true" aria-hidden="true" style={{ paddingTop: '80px', minHeight: '100dvh' }}>
      {/* Hero with stats */}
      <section style={{ textAlign: 'center', padding: '4rem 2rem 3rem', maxWidth: 800, margin: '0 auto' }}>
        <SkeletonLine width="140px" height={28} style={{ borderRadius: 50, margin: '0 auto 20px' }} />
        <SkeletonLine width="280px" height={48} style={{ margin: '0 auto 12px' }} />
        <SkeletonLine width="80%" height={16} style={{ margin: '0 auto 32px' }} />
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <SkeletonLine width="50px" height={32} style={{ margin: '0 auto 6px' }} />
              <SkeletonLine width="70px" height={12} style={{ margin: '0 auto' }} />
            </div>
          ))}
        </div>
      </section>

      {/* Tournament cards */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
          {[...Array(4)].map((_, i) => (
            <SkeletonLine key={i} width={`${80 + i * 8}px`} height={34} style={{ borderRadius: 8 }} />
          ))}
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: 20, alignItems: 'center', padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <SkeletonCircle size={48} />
            <div style={{ flex: 1 }}>
              <SkeletonLine width="65%" height={18} style={{ marginBottom: 6 }} />
              <SkeletonLine width="40%" height={13} />
            </div>
            <SkeletonLine width="100px" height={28} style={{ borderRadius: 8 }} />
          </div>
        ))}
      </section>
    </div>
  )
}
