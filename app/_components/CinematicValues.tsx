'use client'

import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { cinematicValuesData as values } from '@/data/constants/homeContent'
import { useNonce } from '@/components/NonceProvider'

export default function CinematicValues() {
  const nonce = useNonce()
  const marqueeItems = [...values, ...values]
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 })

  return (
    <section
      ref={sectionRef}
      className="cinematic-marquee-section section"
      style={{ overflow: 'hidden', padding: '4rem 0', background: 'var(--bg-body)' }}
    >
      <motion.div
        style={{ textAlign: 'center', marginBottom: '2rem' }}
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
      >
        <h2 className="section-title" style={{ fontSize: '1.5rem', opacity: 0.8 }}>
          The Way of <span className="text-gradient">SKF</span>
        </h2>
      </motion.div>

      <style nonce={nonce}>{`
        .marquee-container {
          display: flex;
          width: 200vw;
          animation: marquee 35s linear infinite;
          gap: 3rem;
          align-items: center;
        }
        .marquee-container:hover {
          animation-play-state: paused;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-item {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-shrink: 0;
        }
        .marquee-text {
          font-family: var(--font-heading);
          font-size: clamp(2rem, 5vw, 4rem);
          font-weight: 900;
          text-transform: uppercase;
          color: transparent;
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }
        .marquee-item:hover .marquee-text {
          color: var(--gold);
          -webkit-text-stroke: 0px;
          text-shadow: 0 0 20px rgba(212, 175, 55, 0.4);
        }
        .marquee-image-container {
          position: relative;
          width: clamp(80px, 15vw, 120px);
          height: clamp(50px, 10vw, 80px);
          border-radius: 100px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
          opacity: 0.6;
          transition: all 0.3s ease;
          filter: grayscale(100%);
        }
        .marquee-item:hover .marquee-image-container {
          opacity: 1;
          filter: grayscale(0%);
          transform: scale(1.1) rotate(2deg);
          border-color: var(--gold);
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-container { animation: none; width: 100%; flex-wrap: wrap; justify-content: center; }
        }
      `}</style>

      <div
        style={{
          position: 'relative',
          width: '100vw',
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw',
          overflow: 'hidden',
        }}
      >
        <div className="marquee-container">
          {marqueeItems.map((v, i) => (
            <div className="marquee-item" key={i}>
              <h3 className="marquee-text">{v.text}</h3>
              {!v.isLogo && v.img && (
                <div className="marquee-image-container">
                  <Image
                    src={v.img}
                    alt={v.text}
                    fill
                    sizes="120px"
                    style={{ objectFit: 'cover', objectPosition: v.pos || 'center' }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Gradient fades on edges */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '10vw',
            background: 'linear-gradient(to right, var(--bg-body), transparent)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '10vw',
            background: 'linear-gradient(to left, var(--bg-body), transparent)',
            pointerEvents: 'none',
          }}
        />
      </div>
    </section>
  )
}
