import React from 'react'
import { SkeletonLine, SkeletonCircle } from './SkeletonPrimitives'

/**
 * HonoursPageSkeleton — mirrors honours page: Hero → Dan carousel → Podium → Medal grids
 */
export default function HonoursPageSkeleton() {
  return (
    <div aria-label="Loading honours" aria-busy="true" aria-hidden="true" style={{ paddingTop: '5rem' }}>
      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '4rem 2rem 3rem', maxWidth: 700, margin: '0 auto' }}>
        <SkeletonLine width="140px" height={28} style={{ borderRadius: 50, margin: '0 auto 20px' }} />
        <SkeletonLine width="200px" height={24} style={{ margin: '0 auto 8px' }} />
        <SkeletonLine width="260px" height={56} style={{ margin: '0 auto 16px' }} />
        <SkeletonLine width="80%" height={16} style={{ margin: '0 auto' }} />
      </section>

      {/* Dan carousel */}
      <section style={{ padding: '2rem', maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
        <SkeletonLine width="120px" height={20} style={{ borderRadius: 50, margin: '0 auto 8px' }} />
        <SkeletonLine width="220px" height={28} style={{ margin: '0 auto 32px' }} />
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', overflow: 'hidden' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ minWidth: 200, padding: 24, borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
              <SkeletonCircle size={80} className="" />
              <SkeletonLine width="70%" height={18} style={{ margin: '12px auto 6px' }} />
              <SkeletonLine width="50%" height={13} style={{ margin: '0 auto 4px' }} />
              <SkeletonLine width="60%" height={12} style={{ margin: '0 auto' }} />
            </div>
          ))}
        </div>
      </section>

      {/* Top 3 Podium */}
      <section style={{ padding: '3rem 2rem', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <SkeletonLine width="130px" height={20} style={{ borderRadius: 50, margin: '0 auto 8px' }} />
        <SkeletonLine width="180px" height={28} style={{ margin: '0 auto 32px' }} />
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ padding: 24, borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', width: 200, textAlign: 'center' }}>
              <SkeletonCircle size={i === 1 ? 72 : 56} className="" />
              <SkeletonLine width="80%" height={16} style={{ margin: '10px auto 4px' }} />
              <SkeletonLine width="50%" height={12} style={{ margin: '0 auto 4px' }} />
              <SkeletonLine width="60%" height={12} style={{ margin: '0 auto 8px' }} />
              <SkeletonLine width="50px" height={20} style={{ margin: '0 auto' }} />
            </div>
          ))}
        </div>
      </section>

      {/* Medal grid */}
      <section style={{ padding: '2rem', maxWidth: 1000, margin: '0 auto' }}>
        <SkeletonLine width="200px" height={24} style={{ marginBottom: 20 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
              <SkeletonCircle size={40} />
              <div style={{ flex: 1 }}>
                <SkeletonLine width="70%" height={15} style={{ marginBottom: 4 }} />
                <SkeletonLine width="50%" height={12} style={{ marginBottom: 4 }} />
                <SkeletonLine width="80%" height={12} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
