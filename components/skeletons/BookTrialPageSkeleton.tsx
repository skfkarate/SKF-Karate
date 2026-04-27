import React from 'react'
import { SkeletonLine, SkeletonBlock, SkeletonButton } from './SkeletonPrimitives'

/**
 * BookTrialPageSkeleton — mirrors book-trial page: Back button → 2-col (hero info + form)
 */
export default function BookTrialPageSkeleton() {
  return (
    <div aria-label="Loading booking form" aria-busy="true" aria-hidden="true" style={{ paddingTop: '5rem', maxWidth: 1280, margin: '0 auto', padding: '5rem 2rem 4rem' }}>
      {/* Back */}
      <SkeletonLine width="80px" height={16} style={{ marginBottom: 32 }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
        {/* Hero side */}
        <div>
          <SkeletonLine width="200px" height={24} style={{ marginBottom: 8 }} />
          <SkeletonLine width="280px" height={48} style={{ marginBottom: 16 }} />
          <SkeletonLine width="100%" height={14} style={{ marginBottom: 6 }} />
          <SkeletonLine width="85%" height={14} style={{ marginBottom: 24 }} />

          {/* Feature list */}
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
              <SkeletonBlock width={20} height={20} radius={4} />
              <SkeletonLine width={`${150 + i * 20}px`} height={14} />
            </div>
          ))}

          {/* Branch preview */}
          <div style={{ marginTop: 24, padding: 20, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
            <SkeletonLine width="100px" height={12} style={{ marginBottom: 8 }} />
            <SkeletonLine width="180px" height={18} style={{ marginBottom: 6 }} />
            <SkeletonLine width="140px" height={13} />
          </div>
        </div>

        {/* Form side */}
        <div style={{ padding: 32, borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
          <SkeletonLine width="180px" height={24} style={{ marginBottom: 24 }} />
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ marginBottom: 20 }}>
              <SkeletonLine width="120px" height={12} style={{ marginBottom: 8 }} />
              <SkeletonBlock height={44} radius={8} />
            </div>
          ))}
          <div style={{ marginBottom: 20 }}>
            <SkeletonLine width="160px" height={12} style={{ marginBottom: 8 }} />
            <SkeletonBlock height={44} radius={8} />
          </div>
          <SkeletonButton width={400} height={48} />
        </div>
      </div>
    </div>
  )
}
