import type { CSSProperties } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import HeroVideo from './HeroVideo'
import { HERO_COPY } from '@/data/constants/homeContent'

export default function HomeHero() {
  return (
    <section className="hero" id="hero">
      {/* Cinematic video background */}
      <div className="hero__bg">
        <HeroVideo />
        <div className="hero__overlay" />
        <div
          className="hero__watermark"
          aria-hidden="true"
        >
          {HERO_COPY.WATERMARK}
        </div>
      </div>

      {/* Floating ambient particles */}
      <div className="hero__particles" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="hero__particle"
            style={{
              left: `${15 + i * 18}%`,
              top: `${20 + (i % 3) * 25}%`,
              width: `${3 + i * 1.5}px`,
              height: `${3 + i * 1.5}px`,
              '--particle-duration': `${4 + i * 0.8}s`,
              '--particle-delay': `${i * 0.6}s`,
            } as CSSProperties}
          />
        ))}
      </div>

      <div className="container hero__content">
        <div className="hero__badge hero__reveal hero__reveal--1">
          {HERO_COPY.BADGE}
        </div>

        <h1 className="hero__title hero__reveal hero__reveal--2">
          {HERO_COPY.TITLE_LINE1}
          <br />
          <span className="text-gradient">{HERO_COPY.TITLE_ACCENT}</span>
        </h1>

        <p className="hero__subtitle hero__reveal hero__reveal--3">
          {HERO_COPY.SUBTITLE}
        </p>

        <p className="hero__desc hero__reveal hero__reveal--4">
          {HERO_COPY.DESCRIPTION}
        </p>

        <div className="hero__actions hero__reveal hero__reveal--5">
          <Link href="/classes" className="btn btn-primary hero__btn">
            Find Classes <ArrowRight size={16} />
          </Link>
          <Link href="/book-trial" className="btn btn-secondary hero__btn">
            Book Free Trial
          </Link>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="hero__scroll-hint hero__scroll-hint--reveal">
        <span className="hero__scroll-text">Scroll</span>
        <span className="hero__scroll-line" />
      </div>
    </section>
  )
}
