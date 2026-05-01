'use client'

import { useRef, useEffect } from 'react'
import { motion, useInView, useSpring, useTransform } from 'framer-motion'
import './HomeStatsCounter.css'

function StatItem({ target, label, suffix = '+', index }: { target: number; label: string; suffix?: string; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  const springValue = useSpring(0, {
    stiffness: 40,
    damping: 20,
    mass: 1,
    restDelta: 0.001,
  })

  useEffect(() => {
    if (isInView) {
      springValue.set(target)
    }
  }, [isInView, springValue, target])

  const displayValue = useTransform(springValue, (latest) => Math.floor(latest).toLocaleString())

  return (
    <motion.div
      className="stat-v2"
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <span className="stat-v2__number">
        <motion.span>{displayValue}</motion.span>
        <span className="stat-v2__suffix">{suffix}</span>
      </span>
      <span className="stat-v2__label">{label}</span>
    </motion.div>
  )
}

export default function HomeStatsCounter() {
  return (
    <section className="stats-v2 section" id="stats">
      <div className="container">
        <div className="stats-v2__wrapper">
          <div className="stats-v2__grid">
            <StatItem target={5100} label="Athletes Trained" index={0} />
            <StatItem target={4} label="Cities" suffix="" index={1} />
            <StatItem target={300} label="Championship Medals" index={2} />
            <StatItem target={15} label="Years of Excellence" index={3} />
          </div>
        </div>
      </div>
    </section>
  )
}
