'use client';
import { useRef, useEffect } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';
import './HomeStatsCounter.css';
import ScrollReveal from '@/app/_components/ScrollReveal';

function StatItem({ target, label, suffix = '+' }: { target: number, label: string, suffix?: string }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    
    // Physics-based spring config
    const springValue = useSpring(0, {
        stiffness: 40,
        damping: 20,
        mass: 1,
        restDelta: 0.001
    });

    useEffect(() => {
        if (isInView) {
            springValue.set(target);
        }
    }, [isInView, springValue, target]);

    // Format output as a clean localized string
    const displayValue = useTransform(springValue, latest => Math.floor(latest).toLocaleString());

    return (
        <div className="stat" ref={ref}>
            <span className="stat__number">
                <motion.span>{displayValue}</motion.span>{suffix}
            </span>
            <span className="stat__label">{label}</span>
        </div>
    );
}

export default function HomeStatsCounter() {
    return (
        <section className="stats container">
            <ScrollReveal>
                <div className="stats__grid">
                    <StatItem target={5100} label="Athletes Trained" />
                    <div className="stats__divider" />
                    <StatItem target={4} label="Cities" suffix="" />
                    <div className="stats__divider" />
                    <StatItem target={300} label="Championship Medals" />
                    <div className="stats__divider" />
                    <StatItem target={15} label="Years of Excellence" />
                </div>
            </ScrollReveal>
        </section>
    );
}
