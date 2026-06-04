'use client'

import React, { useEffect } from 'react';
import { SkeletonLine, SkeletonCircle, SkeletonBlock } from '../_components/skeletons/SkeletonPrimitives';
import { useNonce } from '@/components/NonceProvider';
import { markRouteLoadingVisible } from '@/components/navigation/routeTransitionTelemetry';
import './blackbelt.css';

/**
 * BlackBeltLoading — matches Black Belt Program page layout
 * Desktop: Header → XP Ring hero → Horizontal timeline → 2-col card grid
 * Tablet: Timeline scrollable, grid wraps
 * Mobile: Full-width stacked, compact ring, smaller cards
 */
export default function BlackBeltLoading() {
  const nonce = useNonce();
  useEffect(() => { markRouteLoadingVisible() }, []);

  return (
    <div className="skel-bb" style={{ padding: '2rem 1rem 6rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }} aria-label="Loading Black Belt Program" aria-busy="true">

      {/* ══ HEADER ══ */}
      <div className="skel-bb-header">
        <SkeletonLine width="min(350px, 70%)" height={48} className="skel-bb-title" style={{ marginBottom: '1rem', borderRadius: '12px' }} />
        <SkeletonLine width="min(500px, 90%)" height={16} className="skel-bb-sub" style={{ borderRadius: '6px' }} />
        <SkeletonBlock width="130px" height="26px" radius={99} style={{ marginTop: '1.25rem' }} />
      </div>

      {/* ══ XP RING HERO ══ */}
      <div className="skel-bb-ring">
        <SkeletonCircle size={120} className="skel-bb-ring__circle" style={{ marginBottom: '1.5rem' }} />
        <SkeletonLine width="200px" height={20} style={{ marginBottom: '0.5rem', borderRadius: '6px' }} />
        <SkeletonLine width="150px" height={14} style={{ borderRadius: '4px' }} />
      </div>

      {/* ══ TIMELINE ══ */}
      <div className="skel-bb-timeline">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skel-bb-timeline__item">
            <SkeletonLine width="40px" height={12} style={{ marginBottom: '0.5rem' }} />
            <SkeletonLine width="80px" height={20} />
          </div>
        ))}
      </div>

      {/* ══ CARD GRID ══ */}
      <div className="skel-bb-grid">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skel-bb-card">
            <div>
              <SkeletonLine width="50px" height={12} style={{ marginBottom: '0.75rem' }} />
              <SkeletonLine width="180px" height={20} className="skel-bb-card__title" style={{ marginBottom: '0.5rem' }} />
              <SkeletonLine width="120px" height={14} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <SkeletonLine width="80px" height={16} />
              <SkeletonCircle size={24} />
            </div>
          </div>
        ))}
      </div>

      <style nonce={nonce} dangerouslySetInnerHTML={{__html: `
        .skel-bb-header {
          padding-top: 3rem; margin-bottom: 3rem; text-align: center;
          display: flex; flex-direction: column; align-items: center;
        }
        .skel-bb-ring {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 24px;
          padding: 2.5rem;
          margin-bottom: 2.5rem;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          min-height: 260px;
        }
        .skel-bb-timeline {
          display: flex; gap: 0.75rem;
          margin-bottom: 3rem;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .skel-bb-timeline::-webkit-scrollbar { display: none; }
        .skel-bb-timeline__item {
          flex: 0 0 160px;
          height: 100px;
          display: flex; flex-direction: column; justify-content: center; align-items: center;
          padding: 1rem;
          background: rgba(255,255,255,0.02);
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .skel-bb-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.25rem;
        }
        .skel-bb-card {
          height: 180px;
          display: flex; flex-direction: column; justify-content: space-between;
          padding: 1.5rem;
          background: rgba(255,255,255,0.02);
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.05);
        }

        /* ═══ MOBILE (≤768px) ═══ */
        @media (max-width: 768px) {
          .skel-bb-header { padding-top: 2rem; margin-bottom: 2rem; }
          .skel-bb-title { height: 36px !important; }
          .skel-bb-ring {
            padding: 2rem;
            min-height: 200px;
            border-radius: 20px;
            margin-bottom: 2rem;
          }
          .skel-bb-ring__circle { width: 90px !important; height: 90px !important; }
          .skel-bb-timeline { margin-bottom: 2rem; }
          .skel-bb-timeline__item {
            flex: 0 0 130px;
            height: 80px;
            border-radius: 18px;
            padding: 0.75rem;
          }
          .skel-bb-grid {
            gap: 1rem;
          }
          .skel-bb-card {
            height: auto;
            min-height: 140px;
            padding: 1.25rem;
            border-radius: 20px;
          }
          .skel-bb-card__title { width: 150px !important; }
        }

        /* ═══ SMALL PHONE (≤480px) ═══ */
        @media (max-width: 480px) {
          .skel-bb-ring {
            padding: 1.5rem;
            border-radius: 16px;
          }
          .skel-bb-ring__circle { width: 70px !important; height: 70px !important; }
          .skel-bb-timeline__item {
            flex: 0 0 110px;
            height: 70px;
            border-radius: 14px;
          }
          .skel-bb-card {
            padding: 1rem;
            border-radius: 16px;
            min-height: 120px;
          }
        }
      `}} />
    </div>
  );
}
