'use client'

import React from 'react';
import { SkeletonLine, SkeletonCircle, SkeletonBlock, SkeletonButton } from './SkeletonPrimitives';
import { useNonce } from '@/components/NonceProvider';

/**
 * EventsPageSkeleton — matches PortalEventsPage layout precisely
 * Desktop: Header → Section title with badge → 2-col event cards grid
 * Tablet: 2-col cards remain
 * Mobile: Single column, compact card headers (badge above date), smaller text
 */
export const EventsPageSkeleton = () => {
  const nonce = useNonce();

  return (
  <div className="skel-portal-events" style={{ padding: '2rem 1rem 6rem', maxWidth: '1000px', margin: '0 auto', width: '100%', minHeight: '70vh', display: 'flex', flexDirection: 'column' }} aria-label="Loading events" aria-busy="true">

    {/* ══ HEADER ══ */}
    <div className="skel-pe-header">
      <SkeletonLine width="350px" height={64} className="skel-pe-title" style={{ marginBottom: '0.5rem', borderRadius: '12px' }} />
      <SkeletonLine width="420px" height={20} className="skel-pe-sub" style={{ borderRadius: '6px' }} />
    </div>

    {/* ══ SECTION HEADING ══ */}
    <div className="skel-pe-sections">
      <div className="skel-pe-sec-head">
        <div className="skel-pe-sec-icon">
          <SkeletonCircle size={20} />
        </div>
        <SkeletonLine width="160px" height={24} style={{ borderRadius: '6px' }} />
        <SkeletonLine width="32px" height={22} style={{ borderRadius: '999px' }} />
      </div>

      {/* ══ EVENT CARDS GRID ══ */}
      <div className="skel-pe-grid">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skel-pe-card">
            {/* Ambient glow */}
            <div className="skel-pe-card__glow" />

            {/* Header: Date + Badge */}
            <div className="skel-pe-card__header">
              <div>
                <SkeletonLine width="60px" height={40} className="skel-pe-card__date" style={{ borderRadius: '6px', marginBottom: '0.35rem' }} />
                <SkeletonLine width="80px" height={14} style={{ borderRadius: '4px' }} />
              </div>
              <SkeletonButton width={80} height={26} style={{ borderRadius: '100px' }} />
            </div>

            {/* Body */}
            <div className="skel-pe-card__body">
              <SkeletonLine width="80%" height={28} className="skel-pe-card__title" style={{ marginBottom: '0.9rem', borderRadius: '6px' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <SkeletonCircle size={16} />
                <SkeletonLine width="55%" height={15} style={{ borderRadius: '4px' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.5rem' }}>
                <SkeletonLine width="100%" height={14} style={{ borderRadius: '4px' }} />
                <SkeletonLine width="88%" height={14} style={{ borderRadius: '4px' }} />
                <SkeletonLine width="72%" height={14} style={{ borderRadius: '4px' }} />
              </div>

              {/* View details link */}
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <SkeletonLine width="90px" height={14} style={{ borderRadius: '4px' }} />
                <SkeletonCircle size={14} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    <style nonce={nonce} dangerouslySetInnerHTML={{__html: `
      /* ═══ HEADER ═══ */
      .skel-pe-header {
        padding-top: 3rem; margin-bottom: 3rem; text-align: center;
        display: flex; flex-direction: column; align-items: center;
      }

      .skel-pe-sections {
        display: flex; flex-direction: column; gap: 1.2rem;
      }

      /* ═══ SECTION HEAD ═══ */
      .skel-pe-sec-head {
        display: flex; align-items: center; gap: 0.75rem;
      }
      .skel-pe-sec-icon {
        background: rgba(255,183,3,0.1);
        padding: 0.4rem;
        border-radius: 8px;
        display: flex; align-items: center; justify-content: center;
      }

      /* ═══ GRID ═══ */
      .skel-pe-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.25rem;
      }

      /* ═══ CARD ═══ */
      .skel-pe-card {
        position: relative;
        display: flex; flex-direction: column;
        min-height: 260px;
        background: rgba(20,20,20,0.4);
        border-radius: 24px;
        border: 1px solid rgba(255,255,255,0.08);
        padding: 2rem;
        overflow: hidden;
        box-shadow: 0 20px 40px rgba(0,0,0,0.45);
      }
      .skel-pe-card__glow {
        position: absolute; top: -60px; right: -60px;
        width: 190px; height: 190px;
        background: rgba(255,255,255,0.04);
        filter: blur(80px);
        border-radius: 50%;
        pointer-events: none;
      }
      .skel-pe-card__header {
        display: flex; justify-content: space-between; align-items: flex-start;
        gap: 1rem; margin-bottom: 2rem; position: relative; z-index: 1;
      }
      .skel-pe-card__body {
        position: relative; z-index: 1;
        display: flex; flex-direction: column; flex: 1;
      }

      /* ═══ TABLET (≤1024px) ═══ */
      @media (max-width: 1024px) {
        .skel-pe-grid { gap: 1rem; }
      }

      /* ═══ MOBILE (≤768px) ═══ */
      @media (max-width: 768px) {
        .skel-pe-header { padding-top: 2rem; margin-bottom: 2rem; }
        .skel-pe-title { width: 260px !important; height: 48px !important; }
        .skel-pe-sub { width: 280px !important; }

        .skel-pe-grid {
          gap: 1rem;
        }
        .skel-pe-card {
          padding: 1.5rem;
          min-height: auto;
          border-radius: 20px;
        }
        .skel-pe-card__header {
          flex-direction: column-reverse;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
        }
        .skel-pe-card__date {
          height: 32px !important;
        }
        .skel-pe-card__title {
          height: 22px !important;
          width: 70% !important;
        }
      }

      /* ═══ SMALL PHONE (≤480px) ═══ */
      @media (max-width: 480px) {
        .skel-pe-card { padding: 1.25rem; border-radius: 18px; }
        .skel-pe-card__header { gap: 0.5rem; margin-bottom: 1rem; }
        .skel-pe-card__date { height: 28px !important; width: 50px !important; }
        .skel-pe-card__title { height: 20px !important; }
        .skel-pe-sec-head .skeleton-shimmer:nth-child(2) {
          width: 120px !important;
        }
      }
    `}} />
  </div>
  );
};
