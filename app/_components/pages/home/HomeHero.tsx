'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import HeroVideo from './HeroVideo'
import { HERO_COPY } from '@/data/constants/homeContent'

const ease = [0.25, 0.46, 0.45, 0.94]

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 40, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.9, ease },
  },
}

const scaleFade = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.2, ease },
  },
}

export default function HomeHero() {
  return (
    <section className="hero" id="hero">
      {/* Cinematic video background */}
      <div className="hero__bg">
        <HeroVideo />
        <div className="hero__overlay" />
        <motion.div
          className="hero__watermark"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2.5, ease }}
        >
          {HERO_COPY.WATERMARK}
        </motion.div>
      </div>

      {/* Floating ambient particles */}
      <div className="hero__particles" aria-hidden="true">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="hero__particle"
            style={{
              left: `${15 + i * 18}%`,
              top: `${20 + (i % 3) * 25}%`,
              width: `${3 + i * 1.5}px`,
              height: `${3 + i * 1.5}px`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 4 + i * 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.6,
            }}
          />
        ))}
      </div>

      <motion.div
        className="container hero__content"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="hero__badge" variants={fadeUp}>
          {HERO_COPY.BADGE}
        </motion.div>

        <motion.h1 className="hero__title" variants={fadeUp}>
          {HERO_COPY.TITLE_LINE1}
          <br />
          <span className="text-gradient">{HERO_COPY.TITLE_ACCENT}</span>
        </motion.h1>

        <motion.p className="hero__subtitle" variants={fadeUp}>
          {HERO_COPY.SUBTITLE}
        </motion.p>

        <motion.p className="hero__desc" variants={fadeUp}>
          {HERO_COPY.DESCRIPTION}
        </motion.p>

        <motion.div className="hero__actions" variants={fadeUp}>
          <Link href="/classes" className="btn btn-primary hero__btn">
            Find Classes <ArrowRight size={16} />
          </Link>
          <Link href="/book-trial" className="btn btn-secondary hero__btn">
            Book Free Trial
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        className="hero__scroll-hint"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <span className="hero__scroll-text">Scroll</span>
        <span className="hero__scroll-line" />
      </motion.div>
    </section>
  )
}
