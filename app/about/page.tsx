'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect } from 'react'
import { FaArrowRight, FaBuilding, FaGlobe, FaCrown } from 'react-icons/fa'
import { GiBlackBelt, GiPunch, GiYinYang } from 'react-icons/gi'
import HomeStatsCounter from '@/app/_components/pages/home/HomeStatsCounter'
import { useTrialModal } from '@/app/_components/TrialModalContext'
import './about.css'

const leadership = [
    { name: 'Renshi Dr. Channegowda UC', role: 'Founder & Technical Director', dan: '7th Dan Black Belt', desc: 'The absolute visionary and technical backbone of SKF Karate, bringing decades of elite pedagogical experience to forge global champions.', isFounder: true },
    { name: 'Sensei Usha C', role: 'President', dan: '4th Dan', desc: 'Leading the association with unwavering dedication and spearheading specialized technical programs.', id: 'usha' },
    { name: 'Sensei Someshekhar', role: 'Vice President', dan: '4th Dan', desc: 'Overseeing metropolitan branch operations and guiding the senior athlete development system.' },
    { name: 'Sensei Rakesh', role: 'General Secretary', dan: '4th Dan', desc: 'Coordinating high-level administrative affairs and leading advanced branch training at the Central Dojo.', id: 'rakesh' },
    { name: 'Latha', role: 'Treasurer', dan: '', desc: 'Managing vital financial governance and supporting the association\'s rapid infrastructure expansion.' },
]

export default function AboutPage() {
    const { openModal } = useTrialModal()

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if(entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

        document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    return (
        <div className="about-page">
            {/* ═══════ CINEMATIC HERO ═══════ */}
            <section className="page-hero about-hero">
                <div className="page-hero__bg"></div>
                
                <div className="container page-hero__content">
                    <Image src="/logo/SKF logo.png" alt="SKF Logo" width={120} height={120} className="about-hero__logo reveal-on-scroll" />
                    <span className="section-label hero-label-pulse reveal-on-scroll delay-1"><FaBuilding /> Our Origin</span>
                    <h1 className="page-hero__title reveal-on-scroll delay-2">
                        The Legacy of <span className="text-gradient">SKF</span>
                    </h1>
                    <p className="page-hero__subtitle reveal-on-scroll delay-3">
                        Sports Karate-do Fitness & Self Defence Association®
                    </p>
                </div>
            </section>

            {/* ═══════ THE ZEN PHILOSOPHY CORE ═══════ */}
            <section className="stats stats-negative-margin">
                <div className="container stats__grid">
                    <HomeStatsCounter target={5100} label="Active Athletes" />
                    <div className="stats__divider"></div>
                    <HomeStatsCounter target={20} label="Expert Instructors" />
                    <div className="stats__divider"></div>
                    <HomeStatsCounter target={15} label="Years Legacy" />
                    <div className="stats__divider"></div>
                    <HomeStatsCounter target={300} label="Championships" />
                </div>
            </section>

            <section className="section zen-philosophy">
                <div className="zen-bg-kanji">空手道</div>
                <div className="container">
                    <div className="zen-grid reveal-on-scroll">
                        <div className="zen-content">
                            <span className="section-label"><GiYinYang /> The Way</span>
                            <h2 className="section-title">Forging Champions <br /><span className="text-gradient">On & Off the Mat</span></h2>
                            
                            <div className="zen-text-block">
                                <p className="lead-text">
                                    SKF Karate is not merely a training facility; it is an elite institution dedicated to the absolute mastery of Sports Karate-Do, physical conditioning, and profound mental discipline.
                                </p>
                                <p>
                                    Built on a foundation of standardized, professional WKF training protocols, we forge resilient champions. Our Senseis bring decades of rigorous competition and coaching experience, ensuring every single karateka receives world-class, tailored guidance to unlock their absolute peak potential.
                                </p>
                            </div>
                            
                            <Link href="/classes" className="btn btn-primary zen-cta">
                                Find a Class Near You
                            </Link>
                        </div>
                        
                        <div className="zen-visual">
                            <div className="zen-glass-card">
                                <div className="zen-glass-card__inner">
                                    <GiPunch className="zen-icon" />
                                    <h3>"Nothing is Impossible"</h3>
                                    <div className="zen-divider"></div>
                                    <p>Our founding doctrine. This single truth drives every training session, every drop of sweat, and every true champion forged in our halls.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ THE VANGUARD (LEADERSHIP) ═══════ */}
            <section className="section vanguard-section section--tint-mid">
                <div className="container">
                    <div className="vanguard-header reveal-on-scroll center">
                        <span className="section-label"><FaCrown /> The Vanguard</span>
                        <h2 className="section-title">Executive <span className="text-gradient">Committee</span></h2>
                        <p className="section-subtitle">
                            The elite council guiding SKF Karate towards absolute global excellence.
                        </p>
                    </div>

                    <div className="vanguard-grid">
                        {leadership.map((leader, idx) => (
                            <div 
                                className={`vanguard-card ${leader.isFounder ? 'vanguard-card--founder' : ''} reveal-on-scroll`} 
                                key={leader.name}
                                style={{ transitionDelay: (idx * 0.1) + 's' }}
                            >
                                <div className="vanguard-card__glow"></div>
                                <div className="vanguard-card__content">
                                    <div className="vanguard-icon-wrap">
                                        {leader.isFounder ? <FaCrown className="founder-icon" /> : <GiBlackBelt className="leader-icon" />}
                                    </div>
                                    <div className="vanguard-meta">
                                        <h3 className="mb-tiny">
                                            {leader.name}
                                        </h3>
                                        <span className="vanguard-role">{leader.role}</span>
                                        {leader.dan && <span className="vanguard-dan">{leader.dan}</span>}
                                    </div>
                                    <p className="vanguard-desc">{leader.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════ GLOBAL STANDARD (AFFILIATIONS) ═══════ */}
            <section className="section global-standard">
                <div className="global-bg-glow"></div>
                <div className="container">
                    <div className="global-header reveal-on-scroll center">
                        <span className="section-label blue-tinted-label">
                            <FaGlobe /> Global Recognition
                        </span>
                        <h2 className="section-title">Elite <span className="text-gradient-blue">Affiliations</span></h2>
                        <p className="section-subtitle">
                            Our training protocols and belt ranks are universally recognized by the highest governing bodies in global Karate.
                        </p>
                    </div>

                    <div className="affiliation-showcase reveal-on-scroll">
                        <div className="affil-node">
                            <div className="affil-glass">
                                <Image src="/affliciation/wkf.png" alt="WKF Logo" width={140} height={100} style={{ objectFit: 'contain' }} />
                                <h4>World Karate Federation</h4>
                            </div>
                        </div>
                        
                        <div className="affil-node affil-primary">
                            <div className="affil-glass">
                                <Image src="/affliciation/akska.png" alt="AKSKA Logo" width={140} height={100} style={{ objectFit: 'contain' }} />
                                <h4>Akhila Karnataka Sports Karate Association</h4>
                            </div>
                        </div>

                        <div className="affil-node">
                            <div className="affil-glass">
                                <Image src="/affliciation/kio.png" alt="KIO Logo" width={140} height={100} style={{ objectFit: 'contain' }} />
                                <h4>Karate India Organisation</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ CTA SECTION ═══════ */}
            <section className="section section--tint-cool origin-cta">
                <div className="container">
                    <div className="origin-cta__card glass-card reveal-on-scroll">
                        <h2 className="section-title">Write Your History With Us</h2>
                        <p className="section-subtitle centered-subtitle mb-standard mx-auto">
                            Whether you are stepping onto the tatami for the first time or returning to the path of mastery, the SKF family welcomes you. Oss!
                        </p>
                        <div className="flex-center-wrap gap-standard">
                            <button className="btn btn-primary" onClick={() => openModal()}>
                                Book Free Trial <FaArrowRight />
                            </button>
                            <Link href="/classes" className="btn btn-secondary">
                                View Classes
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
