'use client'

import React from 'react';
import { SkeletonLine, SkeletonBlock, SkeletonButton } from './SkeletonPrimitives';
import { useNonce } from '@/components/NonceProvider';

export const TimetablePageSkeleton = () => {
  const nonce = useNonce();

  return (
  <div style={{ paddingBottom: '6rem', width: '100%', minHeight: '100vh', position: 'relative' }} aria-label="Loading timetable" aria-busy="true">
    <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      
      {/* ── HEADER ── */}
      <div style={{ textAlign: 'center', padding: '5rem 1rem 3rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <SkeletonLine width="350px" height={64} style={{ marginBottom: '1rem', borderRadius: '12px' }} />
        <SkeletonLine width="500px" height={20} style={{ margin: '0 auto 2rem auto', borderRadius: '6px' }} />

        {/* Meta Info Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <SkeletonButton width={160} height={44} style={{ borderRadius: '16px' }} />
          <SkeletonButton width={140} height={44} style={{ borderRadius: '16px' }} />
          <SkeletonButton width={120} height={44} style={{ borderRadius: '16px' }} />
        </div>
      </div>

      {/* ── TIMETABLE VIEWER ── */}
      <div
        className="timetable-viewer-skeleton"
        style={{
          width: '100%',
          borderRadius: '24px',
          overflow: 'hidden',
          background: 'rgba(10, 14, 22, 0.4)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Action Bar */}
        <div style={{ 
          display: 'flex', justifyContent: 'flex-end', alignItems: 'center', 
          padding: '1.25rem', background: 'rgba(10,14,22,0.8)',
          borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}>
          <SkeletonButton width={120} height={36} style={{ borderRadius: '12px' }} />
        </div>

        {/* Image Container */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/10' }}>
          <SkeletonBlock width="100%" height="100%" radius={0} />
        </div>
      </div>

      <style nonce={nonce} dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .timetable-viewer-skeleton {
            border-radius: 0 !important;
            border-left: none !important;
            border-right: none !important;
          }
        }
      `}} />
    </div>
  </div>
  );
};
