'use client'

import React from 'react'

import { SkeletonBlock, SkeletonLine } from './SkeletonPrimitives'

/**
 * Mirror of the Dojo Stream library shell so the swap from loading to
 * loaded is a seamless morph: hero (title → description → stats → search),
 * then a rail shelf and the folder grid, all on pure black.
 */
export const VideosPageSkeleton = () => (
  <div
    style={{ minHeight: '100dvh', width: '100%', background: '#000', padding: 'clamp(2.5rem, 7vw, 4.25rem) max(4%, 1rem) 6rem' }}
    aria-label="Loading Home Practice"
    aria-busy="true"
  >
    {/* Hero */}
    <SkeletonLine width="min(430px, 82%)" height={40} style={{ borderRadius: 12 }} />
    <SkeletonLine width="min(560px, 88%)" height={14} style={{ borderRadius: 6, marginTop: '0.7rem' }} />

    {/* Stats strip */}
    <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap', marginTop: '1.9rem' }}>
      {[0, 1, 2, 3].map((stat) => (
        <SkeletonBlock key={stat} width={172} height={76} radius={18} />
      ))}
    </div>

    {/* Search */}
    <SkeletonBlock width="min(540px, 100%)" height={54} radius={18} style={{ marginTop: '1.7rem' }} />

    {/* Rail shelf */}
    <section style={{ marginTop: '3rem' }}>
      <SkeletonLine width={200} height={24} style={{ borderRadius: 8 }} />
      <div style={{ display: 'flex', gap: '1rem', overflow: 'hidden', marginTop: '1.05rem' }}>
        {[0, 1, 2, 3].map((card) => (
          <SkeletonBlock key={card} width="clamp(230px, 24vw, 330px)" height="auto" radius={18} style={{ flex: '0 0 auto', aspectRatio: '16 / 9' }} />
        ))}
      </div>
    </section>

    {/* Folder grid shelf */}
    <section style={{ marginTop: '2.75rem' }}>
      <SkeletonLine width={176} height={24} style={{ borderRadius: 8 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.15rem', marginTop: '1.05rem' }}>
        {[0, 1, 2].map((card) => (
          <SkeletonBlock key={card} height={196} radius={20} />
        ))}
      </div>
    </section>
  </div>
)
