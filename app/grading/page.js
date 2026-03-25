'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { FaArrowRight, FaFistRaised } from 'react-icons/fa'
import { GiBlackBelt, GiYinYang, GiKatana } from 'react-icons/gi'
import './grading.css'

const kyuBelts = [
    { kyu: '10th Kyu', belt: 'White Belt', color: '#f8f9fa', textSync: '#212529', desc: "The empty cup. A state of pure readiness and beginner's mind (Shoshin). The journey of a thousand miles begins here.", requirements: "Basic stances (Dachi), straight punches (Choku Zuki), and blocks (Uke)." },
    { kyu: '9th Kyu', belt: 'Yellow Belt', color: '#ffb703', textSync: '#ffffff', desc: "The first ray of sunlight breaking the darkness. The student begins to understand the mechanics of their own body.", requirements: "Pinan Nidan, basic combinations, and multi-directional movement." },
    { kyu: '8th Kyu', belt: 'Orange Belt', color: '#fb8500', textSync: '#ffffff', desc: "The warming earth. Strength and coordination begin to align. The foundational movements become familiar.", requirements: "Pinan Shodan, introduction to sparring distance (Maai)." },
    { kyu: '7th Kyu', belt: 'Green II', color: '#2a9d8f', textSync: '#ffffff', desc: "The sprouting seed. The student learns to adapt, breathe, and yield before striking.", requirements: "Pinan Sandan, advanced blocking, and breath regulation." },
    { kyu: '6th Kyu', belt: 'Green I', color: '#206a5d', textSync: '#ffffff', desc: "The growing tree. Roots go deep as stances solidify. Techniques generate true mechanical power.", requirements: "Pinan Yondan, continuous striking combinations." },
    { kyu: '5th Kyu', belt: 'Blue Belt', color: '#023e8a', textSync: '#ffffff', desc: "The vast sky. Fluidity of movement takes precedence over sheer force. Mind and body synchronize.", requirements: "Pinan Godan, introduction to fluid counter-striking." },
    { kyu: '4th Kyu', belt: 'Purple Belt', color: '#7209b7', textSync: '#ffffff', desc: "The darkening sky. Transitioning from intermediate to advanced. A deep dive into the hidden applications of kata.", requirements: "Naihanchi Shodan, advanced Kumite tactics, and close-quarters Bunkai." },
    { kyu: '3rd Kyu', belt: 'Brown III', color: '#cd7f32', textSync: '#ffffff', desc: "The ripening harvest. Nearing physical maturity in the art. Every strike is delivered with potent, undeniable intent.", requirements: "Naihanchi Nidan, heavy conditioning, and complex defensive maneuvers." },
    { kyu: '2nd Kyu', belt: 'Brown II', color: '#a0522d', textSync: '#ffffff', desc: "The solid rock. Unwavering mental resilience. The practitioner demonstrates exceptional focus under extreme pressure.", requirements: "Naihanchi Sandan, mastery of all earlier katas." },
    { kyu: '1st Kyu', belt: 'Brown I', color: '#5c4033', textSync: '#ffffff', desc: "The absolute threshold. The final exacting trial before the elite ranks. Perfection of basics is absolutely mandated.", requirements: "Bassai Dai. The final test of spirit, technique, and stamina." },
]

const danGrades = [
    { dan: 'Shodan', level: '1st Dan', desc: 'Mastery of the basics. The student has now become a true beginner of Karate-do.', years: '3-4 Years' },
    { dan: 'Nidan', level: '2nd Dan', desc: 'Technical refinement. Smoothness of technique and introductory dojo leadership.', years: '2+ Years from Shodan' },
    { dan: 'Sandan', level: '3rd Dan', desc: 'Advanced Bunkai (application). Eligibility to act as an instructor.', years: '3+ Years from Nidan' },
    { dan: 'Yondan', level: '4th Dan', desc: 'Sensei level. Physical perfection combined with pedagogical mastery.', years: '4+ Years from Sandan' },
    { dan: 'Godan', level: '5th Dan', desc: 'Shihan eligibility. Moving entirely beyond physical technique into spiritual mastery.', years: '5+ Years from Yondan' },
]

export default function GradingPage() {
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if(entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });

        document.querySelectorAll('.slab-reveal, .dan-reveal').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    return (
        <div className="grad-redesign">
            {/* ═══════ THE ZENITH HERO ═══════ */}
            <section className="grad-hero">
                <div className="grad-hero__bg"></div>
                
                <div className="container grad-hero__content">
                    <div className="grad-hero__badge">
                        <GiYinYang className="spin-icon"/> Pathway to Mastery
                    </div>
                    <h1 className="grad-hero__title">
                        The Evolution of <br /><span className="text-gradient">Power & Mind</span>
                    </h1>
                    <p className="grad-hero__subtitle">
                        Grading is not merely a test of physical strength. It is an intricate, agonizing, and profoundly beautiful shedding of limitations. Track the legendary journey from 10th Kyu to 5th Dan.
                    </p>
                </div>

                <div className="grad-hero__kanji-bg">級 / 段</div>
            </section>

            {/* ═══════ THE KYU JOURNEY (Sticky Scroll & Floating Glass) ═══════ */}
            <section className="grad-kyu-section">
                <div className="container">
                    <div className="kyu-split-layout">
                        {/* Left Side: Sticky Header */}
                        <div className="kyu-sticky-header slab-reveal">
                            <span className="section-label"><FaFistRaised /> The Foundation</span>
                            <h2 className="section-title">The Path of <span className="text-gradient">Color</span></h2>
                            <p className="kyu-sticky-desc">
                                The vibrant colors of the Kyu belts represent the shifting elements of nature as a student grows. An arduous journey of shedding ego and building unbreakable spirit.
                            </p>
                            <div className="kyu-scroll-indicator">
                                <span>Scroll the Journey</span>
                                <div className="scroll-line"></div>
                            </div>
                        </div>

                        {/* Right Side: Flowing Glass Cards */}
                        <div className="kyu-cards-flow">
                            {kyuBelts.map((rank, i) => (
                                <div className="kyu-glass-card slab-reveal" key={rank.kyu}>
                                    <div className="kyu-ethereal-glow" style={{ background: `radial-gradient(circle at top right, ${rank.color} 0%, transparent 60%)` }}></div>
                                    <div className="kyu-card-inner">
                                        <div className="kyu-rank-meta">
                                            <div className="kyu-orb" style={{ background: rank.color, boxShadow: `0 0 20px ${rank.color}80` }}></div>
                                            <span className="kyu-number">{10 - i}</span>
                                        </div>
                                        <div className="kyu-text-content">
                                            <div className="kyu-titles">
                                                <h3>{rank.kyu}</h3>
                                                <span className="kyu-belt-name" style={{ color: rank.color }}>{rank.belt}</span>
                                            </div>
                                            <p className="kyu-desc">{rank.desc}</p>
                                            <div className="kyu-req">
                                                <strong>Focus:</strong> {rank.requirements}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ THE DAN SANCTUARY (Sticky Scroll) ═══════ */}
            <section className="grad-dan-sanctuary">
                <div className="sanctuary-bg-glow"></div>
                
                <div className="container">
                    <div className="kyu-split-layout">
                        {/* Left Side: Sticky Header */}
                        <div className="kyu-sticky-header slab-reveal">
                            <GiBlackBelt className="sanctuary-icon" />
                            <h2 className="section-title">The Dan <br/><span className="text-gradient-gold">Sanctuary</span></h2>
                            <p className="kyu-sticky-desc" style={{ color: 'var(--text-light)' }}>
                                Black Belt is the beginning. This is where physical execution transcends into sheer artistry, pedagogical mastery, and unquestionable leadership.
                            </p>
                            <div className="kyu-scroll-indicator" style={{ color: 'var(--gold)' }}>
                                <span>Ascend the Ranks</span>
                                <div className="scroll-line" style={{ background: 'linear-gradient(90deg, rgba(255,183,3,0.3), transparent)' }}></div>
                            </div>
                        </div>

                        {/* Right Side: Flowing Monolith Cards */}
                        <div className="kyu-cards-flow">
                            {danGrades.map((dan, idx) => (
                                <div className="dan-monolith slab-reveal" key={dan.dan}>
                                    <div className="monolith-glow"></div>
                                    <div className="monolith-content">
                                        <div className="monolith-stripe"></div>
                                        <h3 className="monolith-title">{dan.dan}</h3>
                                        <span className="monolith-level">{dan.level}</span>
                                        <p className="monolith-desc">{dan.desc}</p>
                                        <div className="monolith-time">
                                            <strong>Time in Grade:</strong> {dan.years}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ JOURNEY CTA ═══════ */}
            <section className="section grad-cta-section">
                <div className="container">
                    <div className="grad-cta-card slab-reveal">
                        <div className="grad-cta__content">
                            <h2 className="section-title">Are You Ready For Your Trial?</h2>
                            <p className="section-subtitle">
                                The path requires utter devotion. Consult your Sensei to determine if you are mentally and physically prepared for the next grading cycle.
                            </p>
                            <div className="grad-cta__buttons">
                                <Link href="/events" className="btn btn-primary">Check Grading Calendar <FaArrowRight /></Link>
                            </div>
                        </div>
                        <div className="grad-cta__visual">
                            <GiKatana className="cta-katana" />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
