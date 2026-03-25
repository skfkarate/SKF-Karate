'use client';
import { useRef, useEffect } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';
import './HomeStatsCounter.css';

export default function HomeStatsCounter({ target, label, suffix = '+' }) {
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
