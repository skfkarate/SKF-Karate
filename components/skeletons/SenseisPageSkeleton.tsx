import React from 'react'
import { SkeletonLine, SkeletonCircle, SkeletonButton } from './SkeletonPrimitives'

/**
 * SenseisPageSkeleton — mirrors senseis page: Hero → Alternating spotlight cards → CTA
 */
export default function SenseisPageSkeleton() {
  return (
    <div aria-label="Loading senseis" aria-busy="true" aria-hidden="true" style={{ paddingTop: '5rem' }}>
      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '6rem 2rem 4rem', maxWidth: 700, margin: '0 auto' }}>
        <SkeletonLine width="200px" height={28} style={{ borderRadius: 50, margin: '0 auto 20px' }} />
        <SkeletonLine width="300px" height={48} style={{ margin: '0 auto 12px' }} />
        <SkeletonLine width="80%" height={16} style={{ margin: '0 auto 6px' }} />
        <SkeletonLine width="65%" height={16} style={{ margin: '0 auto' }} />
      </section>

      {/* Spotlight cards */}
      {[...Array(4)].map((_, i) => (
        <section key={i} style={{ padding: '5rem 2rem', maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 48, alignItems: 'center', flexDirection: i % 2 === 0 ? 'row' : 'row-reverse' }}>
            {/* Visual */}
            <div style={{ textAlign: 'center' }}>
              <SkeletonCircle size={180} className="" />
              <SkeletonLine width="80px" height={20} style={{ borderRadius: 50, margin: '16px auto 0' }} />
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
              <SkeletonLine width="120px" height={14} style={{ marginBottom: 8 }} />
              <SkeletonLine width="200px" height={32} style={{ marginBottom: 16 }} />
              <div style={{ padding: 16, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)', marginBottom: 20 }}>
                <SkeletonLine width="100%" height={14} style={{ marginBottom: 4 }} />
                <SkeletonLine width="80%" height={14} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
                {[...Array(3)].map((_, j) => (
                  <div key={j}>
                    <SkeletonLine width="80px" height={12} style={{ marginBottom: 4 }} />
                    <SkeletonLine width="120px" height={14} />
                  </div>
                ))}
              </div>
              <SkeletonButton width={180} height={44} />
            </div>
          </div>
        </section>
      ))}
    </div>
  )
}
