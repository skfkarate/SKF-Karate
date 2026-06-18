'use client'

import React from 'react';
import { SkeletonLine, SkeletonBlock } from './SkeletonPrimitives';

/**
 * CreditsPageSkeleton — matches CreditsClient layout precisely
 */
export const CreditsPageSkeleton = () => {
  return (
    <div style={{ padding: '2rem 1rem 6rem', maxWidth: '1100px', margin: '0 auto', width: '100%', minHeight: '70vh' }}>
      {/* ══ HEADER ══ */}
      <div style={{ paddingTop: '3rem', marginBottom: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <SkeletonLine width="320px" height={60} className="mb-2" />
        <SkeletonLine width="420px" height={24} />
      </div>

      <div style={{ display: 'grid', gap: '2rem' }}>
        {/* ══ METRIC CARDS ══ */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {[...Array(2)].map((_, i) => (
            <div key={i} style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20,
              padding: '1.4rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}>
              <SkeletonBlock width="50px" height="50px" radius={16} className="shrink-0" />
              <div style={{ flex: 1 }}>
                <SkeletonLine width="120px" height={14} className="mb-2" />
                <SkeletonLine width="80px" height={32} />
              </div>
            </div>
          ))}
        </section>

        {/* ══ LEDGER ══ */}
        <section style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: '1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <SkeletonBlock width="20px" height="20px" radius={10} />
              <SkeletonLine width="140px" height={28} />
            </div>

            <SkeletonBlock width="220px" height={36} radius={16} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap',
                  alignItems: 'center', 
                  gap: '1rem', 
                  padding: '1rem 1.2rem', 
                  borderRadius: 16, 
                  background: 'rgba(255,255,255,0.025)', 
                  border: '1px solid rgba(255,255,255,0.04)' 
                }}
              >
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                    <SkeletonLine width="140px" height={24} />
                    <SkeletonBlock width="60px" height={20} radius={10} />
                  </div>
                  <SkeletonLine width="180px" height={16} />
                </div>
                
                <div style={{ textAlign: 'right', minWidth: '80px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <SkeletonLine width="60px" height={32} />
                  <SkeletonLine width="80px" height={14} className="mt-1" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
