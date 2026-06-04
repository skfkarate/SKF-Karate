'use client'

import React from 'react';
import { SkeletonLine, SkeletonCircle, SkeletonButton } from './SkeletonPrimitives';
import { useNonce } from '@/components/NonceProvider';
import '@/app/portal/journey/journey.css';

export const JourneyPageSkeleton = () => {
  const nonce = useNonce();

  return (
  <div style={{ padding: '2rem 1rem 6rem 1rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }} aria-label="Loading journey" aria-busy="true">
    
    {/* Header Skeleton */}
    <div style={{ paddingTop: '3rem', marginBottom: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <SkeletonLine width="300px" height={64} style={{ marginBottom: '0.5rem', borderRadius: '12px' }} />
      <SkeletonLine width="400px" height={20} style={{ borderRadius: '6px' }} />
    </div>

    {/* The Winding Path Timeline Skeleton */}
    <div className="journey-timeline" style={{ position: 'relative', width: '100%', padding: '2rem 0' }}>
      
      {/* Central Line (Desktop) */}
      <div className="timeline-line-desktop" style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '2px', zIndex: 0 }}>
        <div style={{ width: '2px', height: '100%', background: 'rgba(255,255,255,0.05)', position: 'absolute' }} />
      </div>

      {/* Wavy Line (Mobile) */}
      <div className="timeline-line-mobile" style={{ display: 'none', position: 'absolute', top: 0, bottom: 0, left: '20px', width: '2px', zIndex: 0 }}>
        <div style={{ width: '2px', height: '100%', background: 'rgba(255,255,255,0.05)', position: 'absolute' }} />
      </div>

      {[...Array(4)].map((_, idx) => {
        const isLeft = idx % 2 === 0;
        const directionClass = isLeft ? 'node-left' : 'node-right';

        return (
          <div key={idx} className={`timeline-node-container ${directionClass}`} style={{ width: '100%', marginBottom: '4rem', position: 'relative', zIndex: 10 }}>
            <div className="timeline-node-wrapper">
              
              {/* Node Circle */}
              <div className="timeline-node-icon" style={{ background: 'rgba(20,20,20,0.8)', border: '4px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>
                <SkeletonCircle size={20} />
              </div>

              {/* Node Card */}
              <div className="timeline-node-card" style={{ background: 'rgba(20,20,20,0.4)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <SkeletonLine width="80px" height={12} style={{ borderRadius: '4px' }} />
                  {idx === 0 && <SkeletonButton width={60} height={20} style={{ borderRadius: '100px' }} />}
                </div>
                
                <SkeletonLine width="70%" height={24} style={{ marginBottom: '0.75rem', borderRadius: '6px' }} />
                
                <div className="node-description" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <SkeletonLine width="100%" height={14} style={{ borderRadius: '4px' }} />
                  <SkeletonLine width="85%" height={14} style={{ borderRadius: '4px' }} />
                </div>

                <div className="node-footer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <SkeletonCircle size={14} />
                  <SkeletonLine width="100px" height={12} style={{ borderRadius: '4px' }} />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
  );
};
