import React from 'react';
import { SkeletonLine, SkeletonCircle, SkeletonBlock, SkeletonButton } from './SkeletonPrimitives';

export const FeesPageSkeleton = () => (
  <div aria-label="Loading fees" aria-busy="true">
    {/* Outstanding Card Skeleton */}
    <div
      style={{
        width: '100%',
        maxWidth: '520px',
        aspectRatio: '1.586',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: 'clamp(16px, 3vw, 22px)',
        padding: 'clamp(1.15rem, 3.5vw, 2rem)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        border: '1px solid rgba(255,255,255,0.05)',
        marginBottom: '2rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <SkeletonLine width="75px" height={10} style={{ marginBottom: '8px' }} />
          <SkeletonLine width="130px" height={36} />
        </div>
        <SkeletonCircle size={28} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <SkeletonLine width="55px" height={9} style={{ marginBottom: '6px' }} />
          <SkeletonLine width="90px" height={14} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <SkeletonLine width="45px" height={9} style={{ marginBottom: '6px' }} />
          <SkeletonLine width="55px" height={14} />
        </div>
      </div>
    </div>

    {/* Fee History Skeleton */}
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <SkeletonCircle size={18} />
        <SkeletonLine width="200px" height={18} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.25rem',
              background: 'rgba(255,255,255,0.015)',
              borderRadius: '14px',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <SkeletonBlock width="40px" height="40px" radius={12} />
              <div>
                <SkeletonLine width="85px" height={14} style={{ marginBottom: '5px' }} />
                <SkeletonLine width="130px" height={10} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <SkeletonLine width="65px" height={16} />
              <SkeletonButton width={48} height={18} style={{ borderRadius: '999px' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
