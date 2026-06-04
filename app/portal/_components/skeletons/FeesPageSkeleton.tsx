'use client'

import React from 'react';
import { SkeletonLine, SkeletonCircle, SkeletonBlock, SkeletonButton } from './SkeletonPrimitives';
import { useNonce } from '@/components/NonceProvider';

/**
 * FeesPageSkeleton — matches FeesClient layout precisely
 * Desktop: Header → 2-col grid (Black card + Action panel) → Ledger list
 * Tablet: Same 2-col but tighter
 * Mobile: Single column, card loses aspect-ratio, compact ledger rows
 * Small phone: Even more compact with smaller text placeholders
 */
export const FeesPageSkeleton = () => {
  const nonce = useNonce();

  return (
  <div className="skel-fees" style={{ padding: '2rem 1rem 6rem 1rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }} aria-label="Loading fees" aria-busy="true">

    {/* ══ HEADER ══ */}
    <div className="skel-fees-header">
      <SkeletonLine width="250px" height={64} className="skel-fees-title" style={{ marginBottom: '0.5rem', borderRadius: '12px' }} />
      <SkeletonLine width="350px" height={20} className="skel-fees-sub" style={{ borderRadius: '6px' }} />
      <SkeletonLine width="120px" height={24} style={{ marginTop: '1.25rem', borderRadius: '50px' }} />
    </div>

    {/* ══ TOP GRID: Black Card + Action Panel ══ */}
    <div className="skel-fees-grid">

      {/* The Black Card */}
      <div className="skel-fees-card">
        {/* Ambient glows */}
        <div className="skel-fees-card__glow skel-fees-card__glow--tr" />
        <div className="skel-fees-card__glow skel-fees-card__glow--bl" />

        {/* Top row: Balance + icon */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
          <div>
            <SkeletonLine width="100px" height={12} style={{ marginBottom: '0.5rem', borderRadius: '4px' }} />
            <SkeletonLine width="180px" height={48} className="skel-fees-balance" style={{ borderRadius: '8px' }} />
          </div>
          <SkeletonCircle size={36} style={{ opacity: 0.3 }} />
        </div>

        {/* Bottom row: Due date + Status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 10 }}>
          <div>
            <SkeletonLine width="60px" height={10} style={{ marginBottom: '0.25rem', borderRadius: '4px' }} />
            <SkeletonLine width="80px" height={16} style={{ borderRadius: '4px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <SkeletonLine width="50px" height={10} style={{ marginBottom: '0.25rem', borderRadius: '4px' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <SkeletonCircle size={6} />
              <SkeletonLine width="55px" height={14} style={{ borderRadius: '4px' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Action Panel */}
      <div className="skel-fees-action">
        <div className="skel-fees-action__inner">
          <div>
            <SkeletonLine width="160px" height={22} style={{ marginBottom: '1rem', borderRadius: '6px' }} />
            <SkeletonLine width="100%" height={14} style={{ marginBottom: '0.5rem', borderRadius: '4px' }} />
            <SkeletonLine width="85%" height={14} style={{ marginBottom: '2rem', borderRadius: '4px' }} />
          </div>
          <SkeletonButton width="100%" height={56} style={{ borderRadius: '16px' }} />
        </div>
      </div>
    </div>

    {/* ══ LEDGER ══ */}
    <div className="skel-fees-ledger">
      <div className="skel-fees-ledger__head">
        <SkeletonCircle size={20} />
        <SkeletonLine width="200px" height={26} style={{ borderRadius: '6px' }} />
      </div>

      <div className="skel-fees-ledger__list">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skel-fees-ledger__row">
            <div className="skel-fees-ledger__left">
              <SkeletonBlock width="48px" height="48px" radius={14} className="skel-fees-ledger__icon" />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <SkeletonLine width="110px" height={18} style={{ borderRadius: '4px' }} />
                  <SkeletonLine width="50px" height={14} style={{ borderRadius: '4px' }} />
                </div>
                <SkeletonLine width="140px" height={12} style={{ borderRadius: '4px' }} />
              </div>
            </div>
            <div className="skel-fees-ledger__right">
              <SkeletonLine width="80px" height={22} style={{ borderRadius: '6px' }} />
            </div>
          </div>
        ))}
      </div>
    </div>

    <style nonce={nonce} dangerouslySetInnerHTML={{__html: `
      /* ═══ HEADER ═══ */
      .skel-fees-header {
        padding-top: 3rem; margin-bottom: 3rem; text-align: center;
        display: flex; flex-direction: column; align-items: center;
      }

      /* ═══ TOP GRID ═══ */
      .skel-fees-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 2rem;
        margin-bottom: 4rem;
      }

      /* ═══ BLACK CARD ═══ */
      .skel-fees-card {
        position: relative; width: 100%; aspect-ratio: 1.586;
        background: linear-gradient(135deg, rgb(16, 20, 31) 0%, rgb(6, 8, 13) 100%);
        borderRadius: 24px; padding: 2.5rem;
        display: flex; flex-direction: column; justify-content: space-between;
        border: 1px solid rgba(255,255,255,0.1);
        border-top: 1px solid rgba(255,255,255,0.25);
        border-left: 1px solid rgba(255,255,255,0.2);
        border-radius: 24px;
        overflow: hidden;
        box-shadow: rgba(0,0,0,0.6) 0px 30px 60px, inset 0 0 30px rgba(255,255,255,0.03);
      }
      .skel-fees-card__glow {
        position: absolute; width: 100%; height: 100%; pointer-events: none;
      }
      .skel-fees-card__glow--tr {
        top: -50%; right: -30%;
        background: radial-gradient(circle, rgba(214,40,40,0.12) 0%, transparent 70%);
        transform: rotate(25deg);
      }
      .skel-fees-card__glow--bl {
        bottom: -40%; left: -20%; width: 80%; height: 80%;
        background: radial-gradient(circle, rgba(255,183,3,0.08) 0%, transparent 70%);
      }

      /* ═══ ACTION PANEL ═══ */
      .skel-fees-action {
        display: flex; flex-direction: column; gap: 1rem; justify-content: center;
      }
      .skel-fees-action__inner {
        background: linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
        border: 1px solid rgba(255,255,255,0.05);
        border-top: 1px solid rgba(255,255,255,0.1);
        border-radius: 24px;
        padding: 2rem;
        min-height: 220px;
        display: flex; flex-direction: column; justify-content: space-between;
        backdrop-filter: blur(20px);
      }

      /* ═══ LEDGER ═══ */
      .skel-fees-ledger { margin-top: 0; }
      .skel-fees-ledger__head {
        display: flex; align-items: center; gap: 0.75rem;
        margin-bottom: 2rem; padding-bottom: 1rem;
        border-bottom: 1px solid rgba(255,255,255,0.05);
      }
      .skel-fees-ledger__list {
        display: flex; flex-direction: column; gap: 0.75rem;
      }
      .skel-fees-ledger__row {
        display: flex; justify-content: space-between; align-items: center;
        padding: 1.5rem;
        background: linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
        border-radius: 20px;
        border: 1px solid rgba(255,255,255,0.05);
        border-top: 1px solid rgba(255,255,255,0.1);
      }
      .skel-fees-ledger__left {
        display: flex; align-items: center; gap: 1.25rem;
      }
      .skel-fees-ledger__right {
        display: flex; align-items: center; gap: 0.75rem;
      }

      /* ═══ TABLET (≤1024px) ═══ */
      @media (max-width: 1024px) {
        .skel-fees-card { padding: 2rem; }
      }

      /* ═══ MOBILE (≤768px) ═══ */
      @media (max-width: 768px) {
        .skel-fees-header { padding-top: 2rem; margin-bottom: 2rem; }
        .skel-fees-title { width: 200px !important; height: 48px !important; }
        .skel-fees-sub { width: 260px !important; }

        .skel-fees-grid {
          gap: 1.25rem;
        }
        .skel-fees-card {
          aspect-ratio: auto !important;
          padding: 1.75rem !important;
          border-radius: 20px !important;
          gap: 1.5rem;
        }
        .skel-fees-balance {
          width: 140px !important;
          height: 36px !important;
        }
        .skel-fees-action__inner {
          padding: 1.5rem;
          min-height: auto;
          border-radius: 20px;
        }

        .skel-fees-ledger__row {
          padding: 1rem;
          border-radius: 14px;
        }
        .skel-fees-ledger__icon {
          width: 36px !important; height: 36px !important;
          border-radius: 10px !important;
        }
        .skel-fees-ledger__left { gap: 0.75rem; }
        .skel-fees-ledger__left > div > div:first-child .skeleton-shimmer:first-child {
          width: 90px !important;
        }
      }

      /* ═══ SMALL PHONE (≤400px) ═══ */
      @media (max-width: 400px) {
        .skel-fees-card {
          padding: 1.25rem !important;
        }
        .skel-fees-balance {
          width: 120px !important; height: 30px !important;
        }
        .skel-fees-ledger__row {
          padding: 0.85rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .skel-fees-ledger__icon {
          width: 32px !important; height: 32px !important;
        }
        .skel-fees-ledger__right .skeleton-shimmer {
          width: 65px !important; height: 18px !important;
        }
      }
    `}} />
  </div>
  );
};
