'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { FaArrowRight, FaFistRaised } from 'react-icons/fa'
import { GiBlackBelt, GiYinYang } from 'react-icons/gi'
import './grading.css'
import { allDojos } from '@/data/seed/dojos'
import { kyuBelts } from '@/data/seed/kyuBelts'
import { danGrades } from '@/data/seed/danGrades'

export default function GradingPage() {
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if(entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -15% 0px' });

        document.querySelectorAll('.reveal-elem').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    return (
        <div className="grad-redesign">
            {/* ═══════ THE ZENITH HERO ═══════ */}
            <section className="grad-hero">
                <div className="grad-hero__vid-overlay" />
                <div className="grad-hero__vignette" />
                
                <div className="container grad-hero__content text-center">
                    <div className="grad-hero__badge reveal-elem">
                        <GiYinYang className="spin-icon"/> The Path Overcomes All
                    </div>
                    <h1 className="grad-hero__title reveal-elem">
                        Ascension of <br /><span className="text-gradient">Body & Spirit</span>
                    </h1>
                    <p className="grad-hero__subtitle reveal-elem">
                        Grading is not a test. It is a rite of passage. 
                        Trace the ancient steps from the humble white belt to the ultimate mastery of the Dan grades.
                    </p>
                </div>

                <div className="grad-hero__scroll-down indicator-bounce">
                    <span>Begin Journey</span>
                    <div className="scroll-line-vertical"></div>
                </div>
            </section>

            {/* ═══════ THE KYU JOURNEY (Central Path Design) ═══════ */}
            <section className="grad-kyu-section">
                <div className="container">
                    
                    <div className="kyu-header text-center reveal-elem">
                        <span className="section-label"><FaFistRaised /> Foundational Testing</span>
                        <h2 className="section-title">The <span className="text-gradient">Kyu</span> Ranks</h2>
                        <p className="section-desc max-w-2xl mx-auto">
                            The vibrant colors of the Kyu belts represent the shifting elements of nature as a student grows. An arduous journey of shedding ego and building unbreakable spirit.
                        </p>
                    </div>

                    <div className="kyu-timeline-container">
                        <div className="kyu-timeline-spine">
                            <div className="kyu-timeline-tracker"></div>
                        </div>

                        <div className="kyu-timeline-events">
                            {kyuBelts.map((rank, i) => (
                                <div className={`kyu-belt-ribbon reveal-elem ${i % 2 === 0 ? 'ribbon-left' : 'ribbon-right'}`} key={rank.kyu}>
                                    
                                    {/* Connection Point */}
                                    <div className="kyu-belt-node" style={{ borderColor: rank.color, boxShadow: `0 0 20px ${rank.color}60` }}>
                                        <div className="kyu-belt-dot" style={{ background: rank.color }}></div>
                                    </div>

                                    {/* The Card */}
                                    <div className="kyu-ribbon-card">
                                        <div className="kyu-ribbon__glow" style={{ background: `radial-gradient(ellipse at top, ${rank.color} 0%, transparent 70%)` }}></div>
                                        
                                        <div className="kyu-ribbon__content">
                                            <div className="kyu-ribbon__header">
                                                <div className="kyu-ribbon__rank-num" style={{ WebkitTextStrokeColor: rank.color }}>
                                                    {10 - i}
                                                </div>
                                                <div className="kyu-ribbon__titles">
                                                    <span className="kyu-belt-name" style={{ color: rank.color }}>{rank.belt}</span>
                                                    <h3>{rank.kyu}</h3>
                                                </div>
                                            </div>
                                            <p className="kyu-ribbon__desc">{rank.desc}</p>
                                        </div>
                                    </div>

                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ THE DAN SANCTUARY (Imposing Monolith Grid) ═══════ */}
            <section className="grad-dan-sanctuary">
                <div className="sanctuary-bg-glow"></div>
                
                <div className="container">
                    <div className="dan-header text-center reveal-elem">
                        <GiBlackBelt className="sanctuary-icon" />
                        <h2 className="section-title">The <span className="text-gradient-gold">Black Belt</span> Sanctuary</h2>
                        <p className="section-desc text-secondary max-w-2xl mx-auto">
                            The black belt is not the finish line—it is the beginning of true understanding. Physical execution transcends into sheer artistry and pedagogy.
                        </p>
                    </div>

                    <div className="dan-monolith-grid">
                        {danGrades.map((dan, idx) => (
                            <div className={`dan-monolith reveal-elem delay-${idx % 3}`} key={dan.dan}>
                                <div className="monolith-glow"></div>
                                
                                <div className="monolith-header">
                                    <div className="monolith-kanji">{dan.kanji}</div>
                                    <div className="monolith-titles">
                                        <h3 className="monolith-title">{dan.dan}</h3>
                                        <span className="monolith-level">{dan.level}</span>
                                    </div>
                                </div>
                                
                                <div className="monolith-content">
                                    <span className="monolith-role">{dan.role}</span>
                                    <p className="monolith-desc">{dan.desc}</p>
                                    <div className="monolith-principle">
                                        <em>"{dan.principle}"</em>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════ GRADING LOCATION SELECTOR ═══════ */}
            <section className="grad-branches-section reveal-elem pb-standard pt-huge center-text">
                <div className="container">
                    <span className="section-label">Find Your Examiner</span>
                    <h2 className="section-title">Book Your <span className="text-gradient">Grading</span></h2>
                    <p className="text-secondary contained-subtitle mb-standard mx-auto">
                        Grading sessions are conducted locally at your primary dojo. Select your branch below to view Sensei details and arrange your Kyu test.
                    </p>
                    <div className="flex-center-wrap gap-small jc-center">
                        {allDojos.map(dojo => (
                            <Link 
                                key={dojo.id} 
                                href={`/dojos/${dojo.slug}`}
                                className="styled-dojo-link"
                            >
                                {dojo.name.split(' ')[0]} <FaArrowRight className="link-arrow"/>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════ JOURNEY CTA ═══════ */}
            <section className="grad-cta-section">
                <div className="container">
                    <div className="grad-cta-portal reveal-elem">
                        <div className="grad-cta-portal__bg"></div>
                        <div className="grad-cta-portal__kanji">道</div>
                        
                        <div className="grad-cta-portal__content">
                            <h2 className="grad-cta-portal__title">The Path <span className="text-gradient">Awaits</span></h2>
                            <p className="grad-cta-portal__subtitle">
                                "A black belt is simply a white belt who never gave up."<br />
                                Speak with your Sensei. The grading board will summon you when you are ready.
                            </p>
                            <div className="grad-cta-portal__actions">
                                <Link href="/events" className="btn-portal btn-portal--primary">Events Calendar <FaArrowRight /></Link>
                                <Link href="/classes" className="btn-portal btn-portal--secondary">Start Training</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
