import React from 'react'
import { SkeletonLine, SkeletonBlock, SkeletonCircle } from './SkeletonPrimitives'

/**
 * AboutPageSkeleton — mirrors about page layout:
 * Hero (logo + badge + title + stats bento) → Legacy sections → Committee grid → Affiliations → CTA
 */
export default function AboutPageSkeleton() {
  return (
    <div aria-label="Loading about page" aria-busy="true" aria-hidden="true" style={{ paddingTop: '5rem' }}>
      {/* Hero */}
      <header style={{ textAlign: 'center', padding: '4rem 2rem 3rem', maxWidth: 800, margin: '0 auto' }}>
        <SkeletonCircle size={100} className="" />
        <div style={{ margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
          <SkeletonLine width="100px" height={24} style={{ borderRadius: 50, marginTop: 20, marginBottom: 24 }} />
        </div>
        <SkeletonLine width="250px" height={24} style={{ margin: '0 auto 8px' }} />
        <SkeletonLine width="280px" height={56} style={{ margin: '0 auto 16px' }} />
        <SkeletonLine width="80%" height={16} style={{ margin: '0 auto 32px' }} />

        {/* Stats bento */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ padding: 20, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <SkeletonLine width="60px" height={32} style={{ margin: '0 auto 8px' }} />
              <SkeletonLine width="80px" height={14} style={{ margin: '0 auto' }} />
            </div>
          ))}
        </div>
      </header>

      {/* Legacy section */}
      <section style={{ padding: '4rem 2rem', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
          <div>
            <SkeletonLine width="90px" height={20} style={{ borderRadius: 50, marginBottom: 12 }} />
            <SkeletonLine width="250px" height={32} style={{ marginBottom: 16 }} />
            <SkeletonLine width="180px" height={18} style={{ marginBottom: 16 }} />
            <SkeletonLine width="100%" height={14} style={{ marginBottom: 6 }} />
            <SkeletonLine width="95%" height={14} style={{ marginBottom: 6 }} />
            <SkeletonLine width="88%" height={14} style={{ marginBottom: 6 }} />
            <SkeletonLine width="70%" height={14} style={{ marginBottom: 24 }} />
            {/* Quote block */}
            <div style={{ padding: 20, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
              <SkeletonLine width="100%" height={14} style={{ marginBottom: 6 }} />
              <SkeletonLine width="80%" height={14} style={{ marginBottom: 12 }} />
              <SkeletonLine width="140px" height={12} />
            </div>
          </div>
          <SkeletonBlock height={420} radius={16} />
        </div>
      </section>

      {/* Committee grid */}
      <section style={{ padding: '4rem 2rem', maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
        <SkeletonLine width="100px" height={20} style={{ borderRadius: 50, margin: '0 auto 12px' }} />
        <SkeletonLine width="240px" height={32} style={{ margin: '0 auto 12px' }} />
        <SkeletonLine width="70%" height={14} style={{ margin: '0 auto 40px', maxWidth: 500 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
              <SkeletonBlock height={280} radius={0} />
              <div style={{ padding: 16 }}>
                <SkeletonLine width="60%" height={12} style={{ marginBottom: 6 }} />
                <SkeletonLine width="80%" height={18} style={{ marginBottom: 10 }} />
                <div style={{ display: 'flex', gap: 8 }}>
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
