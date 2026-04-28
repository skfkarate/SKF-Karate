import React from 'react';
import { SkeletonLine, SkeletonCircle, SkeletonBlock, SkeletonButton } from './SkeletonPrimitives';

export const VideosPageSkeleton = () => (
  <div style={{ paddingBottom: '2rem', maxWidth: '1420px', margin: '0 auto', width: '100%' }} aria-label="Loading videos" aria-busy="true">
    
    {/* ── HERO VIDEO SECTION SKELETON ── */}
    <div style={{
      position: 'relative', width: '100%', height: '70vh', minHeight: '500px',
      borderRadius: '32px', overflow: 'hidden', marginBottom: '3rem',
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(255,255,255,0.02)'
    }}>
      <div style={{ position: 'absolute', bottom: 'clamp(1.5rem, 5vw, 4rem)', left: 'clamp(1.5rem, 5vw, 4rem)', right: 'clamp(1.5rem, 5vw, 4rem)', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
           <SkeletonButton width={160} height={28} style={{ borderRadius: '6px' }} />
           <SkeletonLine width="80px" height={16} />
        </div>
        
        <SkeletonLine width="60%" height={80} style={{ marginBottom: '1rem', borderRadius: '12px' }} />
        
        <SkeletonLine width="40%" height={20} style={{ marginBottom: '2.5rem' }} />

        <SkeletonButton width={240} height={60} style={{ borderRadius: '16px' }} />
      </div>
    </div>

    {/* ── CONTINUE TRAINING SKELETON ── */}
    <div style={{ marginBottom: '5rem', paddingLeft: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
         <SkeletonCircle size={20} />
         <SkeletonLine width="200px" height={24} />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '1.5rem' }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1rem',
            padding: '0.75rem'
          }}>
            <SkeletonBlock width="120px" height="70px" radius={10} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, paddingRight: '0.5rem' }}>
              <SkeletonLine width="100%" height={16} style={{ marginBottom: '0.5rem' }} />
              <SkeletonBlock width="100%" height={4} radius={2} style={{ marginBottom: '0.25rem' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <SkeletonLine width="60px" height={10} />
                <SkeletonLine width="40px" height={10} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* ── CAROUSEL SECTION SKELETON ── */}
    {[...Array(2)].map((_, i) => (
      <div key={`carousel-${i}`} style={{ marginBottom: '4rem' }}>
        <div style={{ marginBottom: '1.5rem', paddingLeft: '0.5rem' }}>
          <SkeletonLine width="180px" height={28} style={{ marginBottom: '0.25rem' }} />
          <SkeletonLine width="280px" height={14} />
        </div>

        <div style={{ display: 'flex', gap: '1.25rem', overflowX: 'hidden', paddingBottom: '2rem', paddingLeft: '0.5rem' }}>
          {[...Array(4)].map((_, j) => (
            <div key={j} style={{ minWidth: '280px', width: '280px', flexShrink: 0 }}>
              <SkeletonBlock width="100%" height="auto" radius={16} style={{ aspectRatio: '16/9', marginBottom: '1rem' }} />
              <SkeletonLine width="90%" height={16} style={{ marginBottom: '0.25rem' }} />
              <SkeletonLine width="60%" height={12} />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);
