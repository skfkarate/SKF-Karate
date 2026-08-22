'use client'

import React from 'react'

import { SkeletonBlock, SkeletonLine } from './SkeletonPrimitives'

/** Matches the compact library screen so navigation never opens onto a blank hero. */
export const VideosPageSkeleton = () => (
  <div style={{ minHeight: '100dvh', width: '100%', background: '#000', padding: '5rem 4% 6rem' }} aria-label="Loading Home Practice" aria-busy="true">
    <SkeletonLine width="min(420px, 82%)" height={46} style={{ borderRadius: 10 }} />
    <SkeletonLine width="min(560px, 96%)" height={16} style={{ marginTop: '1rem', borderRadius: 6 }} />
    <SkeletonBlock width="min(440px, 100%)" height={44} radius={12} style={{ marginTop: '1.25rem' }} />
    {[0, 1].map((row) => (
      <section key={row} style={{ marginTop: row ? '2.5rem' : '3rem' }}>
        <SkeletonLine width={row ? '210px' : '180px'} height={22} style={{ borderRadius: 6, marginBottom: '1rem' }} />
        <div style={{ display: 'flex', gap: '0.8rem', overflow: 'hidden' }}>
          {[0, 1, 2, 3].map((card) => <SkeletonBlock key={card} width={row ? 'clamp(190px, 22vw, 280px)' : 'clamp(170px, 18vw, 240px)'} height="auto" radius={12} style={{ flex: '0 0 auto', aspectRatio: row ? '1.35 / 1' : '16 / 9' }} />)}
        </div>
      </section>
    ))}
  </div>
)
