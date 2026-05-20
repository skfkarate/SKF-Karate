import React from 'react';
import { SkeletonLine, SkeletonCircle, SkeletonBlock, SkeletonButton } from './SkeletonPrimitives';

export const FeesPageSkeleton = () => (
  <div style={{ padding: '2rem 1rem 6rem 1rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }} aria-label="Loading fees" aria-busy="true">
    
    {/* Header Skeleton */}
    <div style={{ paddingTop: '3rem', marginBottom: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <SkeletonLine width="250px" height={64} style={{ marginBottom: '0.5rem', borderRadius: '12px' }} />
      <SkeletonLine width="350px" height={20} style={{ borderRadius: '6px' }} />
      <SkeletonLine width="120px" height={24} style={{ marginTop: '1.25rem', borderRadius: '50px' }} />
    </div>

    {/* Top Cards Grid */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
      
      {/* Black Card Skeleton */}
      <div style={{
        position: 'relative', width: '100%', aspectRatio: '1.586',
        background: 'rgba(20,20,20,0.4)', borderRadius: '24px', padding: '2.5rem',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        border: '1px solid rgba(255, 255, 255, 0.05)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <SkeletonLine width="100px" height={12} style={{ marginBottom: '0.5rem', borderRadius: '4px' }} />
            <SkeletonLine width="180px" height={48} style={{ borderRadius: '8px' }} />
          </div>
          <SkeletonCircle size={40} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <SkeletonLine width="60px" height={10} style={{ marginBottom: '0.25rem', borderRadius: '4px' }} />
            <SkeletonLine width="80px" height={16} style={{ borderRadius: '4px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <SkeletonLine width="50px" height={10} style={{ marginBottom: '0.25rem', borderRadius: '4px' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <SkeletonCircle size={8} />
              <SkeletonLine width="60px" height={14} style={{ borderRadius: '4px' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Action Panel Skeleton */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
        <div style={{
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '24px', padding: '2rem', minHeight: '220px', display: 'flex',
          flexDirection: 'column', justifyContent: 'space-between'
        }}>
          <div>
            <SkeletonLine width="180px" height={24} style={{ marginBottom: '1rem', borderRadius: '6px' }} />
            <SkeletonLine width="100%" height={14} style={{ marginBottom: '0.5rem', borderRadius: '4px' }} />
            <SkeletonLine width="90%" height={14} style={{ marginBottom: '2rem', borderRadius: '4px' }} />
          </div>
          <SkeletonButton width="100%" height={56} style={{ borderRadius: '16px' }} />
        </div>
      </div>
    </div>

    {/* Ledger / History Skeleton */}
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <SkeletonCircle size={20} />
        <SkeletonLine width="220px" height={28} style={{ borderRadius: '6px' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', padding: '1.5rem',
            background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <SkeletonBlock width="48px" height="48px" radius={14} />
              <div>
                <SkeletonLine width="120px" height={20} style={{ marginBottom: '0.35rem', borderRadius: '4px' }} />
                <SkeletonLine width="160px" height={12} style={{ borderRadius: '4px' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
              <SkeletonLine width="90px" height={24} style={{ marginBottom: '0.35rem', borderRadius: '6px' }} />
              <SkeletonLine width="60px" height={12} style={{ borderRadius: '4px' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
