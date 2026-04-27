import React from 'react'
import { SkeletonLine, SkeletonBlock } from './SkeletonPrimitives'

/**
 * TechniquesPageSkeleton — mirrors techniques page: Hero → Category grid with technique cards
 */
export default function TechniquesPageSkeleton() {
  return (
    <div aria-label="Loading techniques" aria-busy="true" aria-hidden="true" style={{ paddingTop: '5rem' }}>
      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '5rem 2rem 3rem', maxWidth: 700, margin: '0 auto' }}>
        <SkeletonLine width="180px" height={28} style={{ borderRadius: 50, margin: '0 auto 20px' }} />
        <SkeletonLine width="320px" height={48} style={{ margin: '0 auto 12px' }} />
        <SkeletonLine width="80%" height={16} style={{ margin: '0 auto' }} />
      </section>

      {/* Belt filter */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem 2rem' }}>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 40 }}>
          {[...Array(7)].map((_, i) => (
            <SkeletonLine key={i} width={`${70 + i * 5}px`} height={34} style={{ borderRadius: 50 }} />
          ))}
        </div>

        {/* Technique cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ padding: 24, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <SkeletonLine width="60px" height={20} style={{ borderRadius: 50 }} />
                <SkeletonLine width="80px" height={20} style={{ borderRadius: 50 }} />
              </div>
              <SkeletonLine width="75%" height={20} style={{ marginBottom: 8 }} />
              <SkeletonLine width="50%" height={14} style={{ marginBottom: 12 }} />
              <SkeletonLine width="100%" height={13} style={{ marginBottom: 4 }} />
              <SkeletonLine width="85%" height={13} style={{ marginBottom: 4 }} />
              <SkeletonLine width="65%" height={13} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
