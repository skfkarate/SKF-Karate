'use client'

import React from 'react';
import { SkeletonLine, SkeletonCircle, SkeletonBlock } from './SkeletonPrimitives';
import { useNonce } from '@/components/NonceProvider';

/**
 * PointsPageSkeleton — matches PointsClient layout precisely
 * Desktop: Header → 3-col metric cards → Tier progress bar → Leaderboard + History
 * Mobile: Single column metrics, compact leaderboard rows
 */
export const PointsPageSkeleton = () => {
  const nonce = useNonce();

  return (
  <div className="skel-points" style={{ padding: '2rem 1rem 6rem', maxWidth: '1100px', margin: '0 auto', width: '100%', minHeight: '70vh' }} aria-label="Loading points" aria-busy="true">

    {/* ══ HEADER ══ */}
    <div className="skel-points-header">
      <SkeletonLine width="380px" height={56} className="skel-points-title" style={{ marginBottom: '0.5rem', borderRadius: '12px' }} />
      <SkeletonLine width="350px" height={20} className="skel-points-sub" style={{ borderRadius: '6px' }} />
    </div>

    <div style={{ display: 'grid', gap: '2rem' }}>
      {/* ══ METRIC CARDS — 3 columns ══ */}
      <section className="skel-points-metrics">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skel-points-metric">
            <SkeletonBlock width="50px" height="50px" radius={16} className="skel-points-metric__icon" />
            <div>
              <SkeletonLine width="80px" height={12} style={{ marginBottom: '0.5rem', borderRadius: '4px' }} />
              <SkeletonLine width="100px" height={32} className="skel-points-metric__val" style={{ borderRadius: '6px' }} />
            </div>
          </div>
        ))}
      </section>

      {/* ══ TIER PROGRESS BAR ══ */}
      <div className="skel-points-tier">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <SkeletonLine width="140px" height={18} style={{ borderRadius: '4px' }} />
          <SkeletonLine width="80px" height={14} style={{ borderRadius: '4px' }} />
        </div>
        <SkeletonBlock width="100%" height={12} radius={999} style={{ marginBottom: '0.75rem' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {[...Array(5)].map((_, i) => (
            <SkeletonLine key={i} width="40px" height={10} style={{ borderRadius: '4px' }} />
          ))}
        </div>
      </div>

      {/* ══ LEADERBOARD ══ */}
      <section className="skel-points-leaderboard">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
          <SkeletonCircle size={20} />
          <SkeletonLine width="180px" height={24} style={{ borderRadius: '6px' }} />
        </div>
        <div style={{ display: 'grid', gap: '0.65rem' }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skel-points-lb-row">
              <SkeletonLine width="28px" height={20} style={{ borderRadius: '4px' }} />
              <div style={{ flex: 1 }}>
                <SkeletonLine width="120px" height={16} style={{ marginBottom: '0.3rem', borderRadius: '4px' }} />
                <SkeletonLine width="60px" height={12} style={{ borderRadius: '4px' }} />
              </div>
              <SkeletonLine width="70px" height={16} style={{ borderRadius: '4px' }} />
            </div>
          ))}
        </div>
      </section>

      {/* ══ POINTS HISTORY ══ */}
      <section className="skel-points-history">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
          <SkeletonCircle size={20} />
          <SkeletonLine width="140px" height={24} style={{ borderRadius: '6px' }} />
        </div>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skel-points-history-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                <SkeletonBlock width="40px" height="40px" radius={12} />
                <div>
                  <SkeletonLine width="140px" height={14} style={{ marginBottom: '0.3rem', borderRadius: '4px' }} />
                  <SkeletonLine width="80px" height={11} style={{ borderRadius: '4px' }} />
                </div>
              </div>
              <SkeletonLine width="55px" height={18} style={{ borderRadius: '6px' }} />
            </div>
          ))}
        </div>
      </section>
    </div>

    <style nonce={nonce} dangerouslySetInnerHTML={{__html: `
      .skel-points-header {
        padding-top: 5rem; margin-bottom: 3rem; text-align: center;
        display: flex; flex-direction: column; align-items: center;
      }

      /* ═══ METRICS ═══ */
      .skel-points-metrics {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 1rem;
      }
      .skel-points-metric {
        background: linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015));
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 20px;
        padding: 1.4rem;
        display: flex; align-items: center; gap: 1rem;
      }

      /* ═══ TIER ═══ */
      .skel-points-tier {
        padding: 1.5rem;
        background: rgba(255,255,255,0.02);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 20px;
      }

      /* ═══ LEADERBOARD ═══ */
      .skel-points-leaderboard {
        background: rgba(255,255,255,0.02);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 24px;
        padding: 1.5rem;
      }
      .skel-points-lb-row {
        display: grid;
        grid-template-columns: 44px minmax(0, 1fr) auto;
        gap: 0.9rem;
        align-items: center;
        padding: 0.9rem;
        border-radius: 16px;
        background: rgba(255,255,255,0.025);
        border: 1px solid rgba(255,255,255,0.04);
      }

      /* ═══ HISTORY ═══ */
      .skel-points-history {
        background: rgba(255,255,255,0.02);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 24px;
        padding: 1.5rem;
      }
      .skel-points-history-row {
        display: flex; justify-content: space-between; align-items: center;
        padding: 0.75rem;
        border-radius: 12px;
        background: rgba(255,255,255,0.02);
      }

      /* ═══ TABLET (≤1024px) ═══ */
      @media (max-width: 1024px) {
        .skel-points-metrics { gap: 0.75rem; }
      }

      /* ═══ MOBILE (≤768px) ═══ */
      @media (max-width: 768px) {
        .skel-points-header { padding-top: 3rem; margin-bottom: 2rem; }
        .skel-points-title { width: 280px !important; height: 42px !important; }
        .skel-points-sub { width: 260px !important; }

        .skel-points-metric {
          padding: 1.2rem;
          border-radius: 16px;
        }
        .skel-points-metric__icon { width: 42px !important; height: 42px !important; }
        .skel-points-metric__val { width: 80px !important; height: 26px !important; }

        .skel-points-tier { padding: 1.25rem; border-radius: 16px; }
        .skel-points-leaderboard { padding: 1.25rem; border-radius: 18px; }
        .skel-points-lb-row {
          grid-template-columns: 36px minmax(0, 1fr) auto;
          padding: 0.75rem;
          border-radius: 12px;
        }
        .skel-points-history { padding: 1.25rem; border-radius: 18px; }
      }

      /* ═══ SMALL PHONE (≤480px) ═══ */
      @media (max-width: 480px) {
        .skel-points-header { padding-top: 2.5rem; }
        .skel-points-title { width: 220px !important; height: 36px !important; }
        .skel-points-sub { width: 200px !important; }
        .skel-points-metric { padding: 1rem; gap: 0.75rem; }
        .skel-points-metric__icon { width: 36px !important; height: 36px !important; border-radius: 12px !important; }
        .skel-points-metric__val { width: 70px !important; height: 22px !important; }
        .skel-points-lb-row {
          grid-template-columns: 30px minmax(0, 1fr) auto;
          gap: 0.65rem;
          padding: 0.65rem;
        }
      }
    `}} />
  </div>
  );
};
