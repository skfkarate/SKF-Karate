'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { FaArrowRight } from 'react-icons/fa'
import { GiBlackBelt } from 'react-icons/gi'
import './grading.css'
import { kyuBelts } from '@/data/seed/kyuBelts'
import { danGrades } from '@/data/seed/danGrades'

/**
 * One sentence per Dan — precise, poetic, zero syllabus.
 * Each line captures the essence of what that rank *means*.
 */
const danDesc: Record<string, string> = {
    dan_001: 'The door opens. True training begins now.',
    dan_002: 'Strength becomes silk. Teaching becomes understanding.',
    dan_003: 'Every kata holds a life. Read between the movements.',
    dan_004: 'Shape the dojo. Forge the next generation.',
    dan_005: 'No technique remains — only truth in motion.',
}

export default function GradingPage() {
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) =>
                entries.forEach((e) => {
                    if (e.isIntersecting) e.target.classList.add('grd-in-view')
                }),
            { threshold: 0.08, rootMargin: '0px 0px -8% 0px' }
        )
        document.querySelectorAll('.grd-reveal').forEach((el) => observer.observe(el))
        return () => observer.disconnect()
    }, [])

    return (
        <div className="grd-page">
            {/* Ambient Orbs */}
            <div className="grd-orb grd-orb--1" />
            <div className="grd-orb grd-orb--2" />

            {/* Japanese Watermark */}
            <div className="grd-watermark" aria-hidden="true">段</div>

            {/* ═══════ HERO ═══════ */}
            <section className="grd-hero">
                <div className="grd-hero__badge">
                    <span className="grd-hero__badge-dot" />
                    Belt Grading System
                </div>

                <h1 className="grd-hero__title">
                    The Path of<br />
                    <span className="grd-hero__accent">Mastery</span>
                </h1>

                <p className="grd-hero__sub">
                    Every rank earned is a chapter written in discipline.
                    Know the journey — every grade that stands between you and black belt.
                </p>

                {/* Belt colour preview strip */}
                <div className="grd-belt-strip">
                    <div className="grd-belt-strip__track">
                        {kyuBelts.map((belt) => (
                            <div
                                key={belt.id}
                                className="grd-belt-chip"
                                style={{ '--chip-color': belt.color } as React.CSSProperties}
                            >
                                <span className="grd-belt-chip__swatch" style={{ background: belt.color }} />
                                <span className="grd-belt-chip__label">{belt.belt.split(' ')[0]}</span>
                            </div>
                        ))}
                        <div className="grd-belt-chip grd-belt-chip--dan">
                            <GiBlackBelt className="grd-belt-chip__dan-icon" />
                            <span className="grd-belt-chip__label">Dan</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ KYU JOURNEY — ASCENDING LADDER ═══════ */}
            <section className="grd-kyu-section">
                <div className="container">

                    <div className="grd-section-header grd-reveal">
                        <span className="grd-section-tag">Colour Grades</span>
                        <h2 className="grd-section-title">
                            The <span className="text-gradient">Kyu</span> Journey
                        </h2>
                        <p className="grd-section-desc">
                            {kyuBelts.length} colour grades stand between white belt and black belt.
                            Know where you are. Know what remains.
                        </p>
                    </div>

                    {/* Grade count label */}
                    <div className="grd-kyu-count grd-reveal">
                        <span className="grd-kyu-count__highlight">{kyuBelts.length} Kyu Grades</span>
                        <span className="grd-kyu-count__divider">·</span>
                        <span>Ascending to Black Belt</span>
                    </div>

                    {/* The ladder */}
                    <div className="grd-kyu-ladder">

                        {kyuBelts.map((rank, i) => (
                            <div
                                className="grd-kyu-rung grd-reveal"
                                key={rank.id}
                                style={{ '--rung-color': rank.color } as React.CSSProperties}
                            >
                                {/* Step number */}
                                <span className="grd-kyu-rung__index">
                                    {String(kyuBelts.length - i).padStart(2, '0')}
                                </span>

                                {/* Belt pill + name */}
                                <div className="grd-kyu-rung__bar-group">
                                    <div
                                        className="grd-kyu-rung__swatch"
                                        style={{
                                            background: rank.color,
                                            boxShadow: `0 0 12px ${rank.color}55`,
                                        }}
                                    />
                                    <span className="grd-kyu-rung__name">{rank.belt}</span>
                                </div>

                                {/* Kyu label */}
                                <span className="grd-kyu-rung__kyu">{rank.kyu}</span>
                            </div>
                        ))}

                        {/* Destination row — Black Belt */}
                        <div className="grd-kyu-rung grd-kyu-rung--black grd-reveal">
                            <span className="grd-kyu-rung__index">★</span>
                            <div className="grd-kyu-rung__bar-group">
                                <div className="grd-kyu-rung__swatch grd-kyu-rung__swatch--black" />
                                <span className="grd-kyu-rung__name grd-kyu-rung__name--black">
                                    Black Belt
                                </span>
                            </div>
                            <span className="grd-kyu-rung__kyu grd-kyu-rung__kyu--black">Dan</span>
                        </div>

                    </div>
                </div>
            </section>

            {/* ═══════ DAN SANCTUARY ═══════ */}
            <section className="grd-dan-section">
                <div className="grd-dan-section__glow" />
                <div className="container">

                    <div className="grd-section-header grd-reveal">
                        <GiBlackBelt className="grd-dan-icon" />
                        <h2 className="grd-section-title">
                            The <span className="grd-text-gold">Dan</span> Ranks
                        </h2>
                        <p className="grd-section-desc">
                            The black belt is not the finish line — it is where Karate-do truly begins.
                        </p>
                    </div>

                    <div className="grd-dan-grid">
                        {danGrades.map((dan) => (
                            <div className="grd-dan-card grd-reveal" key={dan.id}>
                                <div className="grd-dan-card__shine" />

                                {/* Kanji + Dan name */}
                                <div className="grd-dan-card__top">
                                    <div className="grd-dan-card__kanji">{dan.kanji}</div>
                                    <div>
                                        <h3 className="grd-dan-card__name">{dan.dan}</h3>
                                        <span className="grd-dan-card__level">{dan.level}</span>
                                    </div>
                                </div>

                                {/* Role badge */}
                                <span className="grd-dan-card__role">{dan.role}</span>

                                {/* Single-sentence essence — no syllabus */}
                                <p className="grd-dan-card__desc">
                                    {danDesc[dan.id] ?? dan.desc}
                                </p>
                            </div>
                        ))}
                    </div>

                </div>
            </section>

            {/* ═══════ CTA ═══════ */}
            <section className="grd-cta-section">
                <div className="container">
                    <div className="grd-cta-box grd-reveal">
                        <div className="grd-cta-box__kanji" aria-hidden="true">道</div>

                        <h2 className="grd-cta-box__title">
                            The Path <span className="text-gradient">Awaits</span>
                        </h2>

                        <p className="grd-cta-box__text">
                            &ldquo;A black belt is a white belt who never gave up.&rdquo;
                            <br />
                            Speak with your Sensei. The grading board will summon you when you are ready.
                        </p>

                        <div className="grd-cta-box__actions">
                            <Link href="/events" className="grd-cta-btn grd-cta-btn--primary">
                                Events Calendar <FaArrowRight className="grd-cta-btn__icon" />
                            </Link>
                            <Link href="/classes" className="grd-cta-btn grd-cta-btn--ghost">
                                Start Training
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
