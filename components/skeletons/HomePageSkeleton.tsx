import React from 'react'
import { SkeletonLine, SkeletonBlock, SkeletonButton } from './SkeletonPrimitives'

/**
 * HomePageSkeleton — mirrors the home page hero + sections structure.
 * Home is SSR so this rarely shows, but it's the root loading.tsx fallback.
 */
export default function HomePageSkeleton() {
  return (
    <div aria-label="Loading page" aria-busy="true" aria-hidden="true">
      {/* ── Hero Section ── */}
      <section style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem', textAlign: 'center' }}>
        {/* Badge */}
        <SkeletonLine width="180px" height={30} style={{ borderRadius: 50, marginBottom: 24 }} />
        {/* Title */}
        <SkeletonLine width="70%" height={48} style={{ marginBottom: 16, maxWidth: 600 }} />
        {/* Subtitle */}
        <SkeletonLine width="55%" height={20} style={{ marginBottom: 12, maxWidth: 500 }} />
        <SkeletonLine width="40%" height={16} style={{ marginBottom: 32, maxWidth: 400 }} />
        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <SkeletonButton width={180} height={48} />
          <SkeletonButton width={160} height={48} />
        </div>
      </section>

      {/* ── Values Section ── */}
      <section style={{ padding: '5rem 2rem', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <SkeletonLine width="120px" height={24} style={{ borderRadius: 50, margin: '0 auto 16px' }} />
          <SkeletonLine width="300px" height={36} style={{ margin: '0 auto 12px' }} />
          <SkeletonLine width="60%" height={16} style={{ margin: '0 auto', maxWidth: 500 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ padding: 24, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
              <SkeletonBlock height={48} width={48} radius={12} style={{ marginBottom: 16 }} />
              <SkeletonLine width="70%" height={20} style={{ marginBottom: 8 }} />
              <SkeletonLine width="100%" height={12} style={{ marginBottom: 6 }} />
              <SkeletonLine width="85%" height={12} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Classes Preview ── */}
      <section style={{ padding: '5rem 2rem', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <SkeletonLine width="100px" height={24} style={{ borderRadius: 50, margin: '0 auto 16px' }} />
          <SkeletonLine width="280px" height={36} style={{ margin: '0 auto' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
              <SkeletonBlock height={200} radius={0} />
              <div style={{ padding: 20 }}>
                <SkeletonLine width="40%" height={12} style={{ marginBottom: 8 }} />
                <SkeletonLine width="75%" height={22} style={{ marginBottom: 12 }} />
                <SkeletonLine width="60%" height={14} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
