import React from 'react';
import { SkeletonLine, SkeletonCircle, SkeletonBlock } from '../_components/skeletons/SkeletonPrimitives';

export default function BlackBeltLoading() {
  return (
    <div style={{ padding: '2rem 1rem 6rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }} aria-label="Loading Black Belt Program" aria-busy="true">
      {/* Premium Header Skeleton */}
      <div style={{ paddingTop: '3rem', marginBottom: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <SkeletonLine width="min(350px, 70%)" height={48} style={{ marginBottom: '1rem', borderRadius: '12px' }} />
        <SkeletonLine width="min(500px, 90%)" height={16} style={{ borderRadius: '6px' }} />
        <SkeletonBlock width="130px" height="26px" radius={99} style={{ marginTop: '1.25rem' }} />
      </div>

      {/* Hero XP / Ring Skeleton */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '24px',
        padding: '2.5rem',
        marginBottom: '2.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '260px'
      }}>
        <SkeletonCircle size={120} style={{ marginBottom: '1.5rem' }} />
        <SkeletonLine width="200px" height={20} style={{ marginBottom: '0.5rem', borderRadius: '6px' }} />
        <SkeletonLine width="150px" height={14} style={{ borderRadius: '4px' }} />
      </div>

      {/* Timeline skeleton */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '3rem', overflow: 'hidden' }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{ flex: '0 0 160px', height: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <SkeletonLine width="40px" height={12} style={{ marginBottom: '0.5rem' }} />
            <SkeletonLine width="80px" height={20} />
          </div>
        ))}
      </div>

      {/* Grid skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ height: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div>
              <SkeletonLine width="50px" height={12} style={{ marginBottom: '0.75rem' }} />
              <SkeletonLine width="180px" height={20} style={{ marginBottom: '0.5rem' }} />
              <SkeletonLine width="120px" height={14} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <SkeletonLine width="80px" height={16} />
              <SkeletonCircle size={24} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
