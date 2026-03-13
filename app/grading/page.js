'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { FaArrowRight, FaAward } from 'react-icons/fa'
import { GiBlackBelt } from 'react-icons/gi'
import './grading.css'


const kyuBelts = [
    { kyu: '9th Kyu', belt: 'Yellow Belt', color: '#FFD166' },
    { kyu: '8th Kyu', belt: 'Orange Belt', color: '#F77F00' },
    { kyu: '7th Kyu', belt: 'Green II Belt', color: '#52B788' },
    { kyu: '6th Kyu', belt: 'Green I Belt', color: '#2D6A4F' },
    { kyu: '5th Kyu', belt: 'Blue Belt', color: '#118AB2' },
    { kyu: '4th Kyu', belt: 'Purple Belt', color: '#9D4EDD' },
    { kyu: '3rd Kyu', belt: 'Brown III Belt', color: '#D4A373' },
    { kyu: '2nd Kyu', belt: 'Brown II Belt', color: '#A98467' },
    { kyu: '1st Kyu', belt: 'Brown I Belt', color: '#6B3E2E' },
]

const danGrades = [
    { dan: 'Shodan (1st Dan)', years: '3+ years training', focus: 'Mastery of fundamentals, teaching basics' },
    { dan: 'Nidan (2nd Dan)', years: '5+ years', focus: 'Technical refinement, dojo leadership' },
    { dan: 'Sandan (3rd Dan)', years: '8+ years', focus: 'Advanced bunkai, competition coaching' },
    { dan: 'Yondan (4th Dan)', years: '12+ years', focus: 'Sensei level — independent dojo operation' },
    { dan: 'Godan (5th Dan)', years: '17+ years', focus: 'Shihan eligibility — master instructor' },
]

export default function GradingPage() {
    useEffect(() => {
        const handleScroll = () => {
            const cards = document.querySelectorAll('.kyu-card');
            const windowHeight = window.innerHeight;
            const windowCenter = windowHeight / 2;

            // Collect all cards with their distances from center
            const cardDistances = [];

            cards.forEach(card => {
                const rect = card.getBoundingClientRect();
                const cardCenter = rect.top + (rect.height / 2);
                
                const distanceFromCenter = (cardCenter - windowCenter) / windowCenter;
                
                if (distanceFromCenter > -1.5 && distanceFromCenter < 1.5) {
                    if (rect.top < windowHeight - 100) {
                        card.closest('.kyu-timeline__row').classList.add('is-visible');
                    }

                    const rotateX = distanceFromCenter * 8;
                    const translateY = distanceFromCenter * 10;
                    const scale = 0.98 + ((1 - Math.min(Math.abs(distanceFromCenter), 1)) * 0.02);

                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) translateY(${translateY}px) scale(${scale})`;
                    card.style.transition = 'transform 0.1s linear';
                    
                    cardDistances.push({
                        card,
                        distance: Math.abs(distanceFromCenter)
                    });
                }
                
                // Remove scroll-active from all first
                card.classList.remove('scroll-active');
            });

            // Sort by distance and only activate the 2 closest to center
            cardDistances.sort((a, b) => a.distance - b.distance);
            const maxActive = 2;
            for (let i = 0; i < Math.min(maxActive, cardDistances.length); i++) {
                if (cardDistances[i].distance < 0.8) {
                    cardDistances[i].card.classList.add('scroll-active');
                }
            }
        };

        // Initial check and event listener
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="grading-page">
            {/* ===== HERO ===== */}
            <section className="page-hero">
                <div className="page-hero__bg">
                    <div className="glow glow-gold page-hero__glow-1"></div>
                    <div className="glow glow-red page-hero__glow-2"></div>
                </div>
                <div className="container page-hero__content">
                    <span className="section-label"><GiBlackBelt /> Belt System</span>
                    <h1 className="page-hero__title">Kyu & Dan <span className="text-gradient">Grading</span></h1>
                    <p className="page-hero__subtitle">The Path from White Belt to Black Belt and Beyond</p>
                </div>
            </section>

            {/* ===== KYU SYSTEM ===== */}
            <section className="section kyu-section">
                <div className="glow glow-blue kyu-section__glow"></div>
                <div className="container">
                    <div className="kyu-header">
                        <h2 className="section-title">The Journey of a <span className="text-gradient">Karateka</span></h2>
                        <p className="section-subtitle">
                            Every black belt was once a white belt who never quit. The Kyu (color belt) system builds your foundation. The Dan (black belt) system deepens your mastery.
                        </p>
                    </div>

                    <div className="kyu-timeline">
                        <div className="kyu-timeline__line"></div>
                        {kyuBelts.map((rank, index) => (
                            <div 
                                key={rank.kyu} 
                                className={`kyu-timeline__row ${index % 2 === 0 ? 'kyu-timeline__row--left' : 'kyu-timeline__row--right'}`}
                            >
                                <div className="kyu-timeline__dot" style={{ '--belt-color': rank.color }}></div>
                                <div className="kyu-card" style={{ '--belt-color': rank.color }}>
                                    <div className="kyu-card__accent"></div>
                                    <div className="kyu-card__icon">
                                        <GiBlackBelt />
                                    </div>
                                    <div className="kyu-card__info">
                                        <h3 className="kyu-card__level">{rank.kyu}</h3>
                                        <span className="kyu-card__belt">{rank.belt}</span>
                                    </div>
                                    <div className="kyu-card__number">
                                        {9 - index}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== DAN GRADES (ULTIMATE ACHIEVEMENT) ===== */}
            <section className="section dan-section">
                <div className="glow glow-gold dan__glow"></div>
                <div className="container">
                    <div className="kyu-header">
                        <span className="section-label" style={{ backgroundColor: 'rgba(255, 183, 3, 0.1)', color: 'var(--gold)' }}><GiBlackBelt /> The Ultimate Goal</span>
                        <h2 className="section-title">Beyond <span className="text-gradient">Brown I</span></h2>
                        <p className="section-subtitle">Achieving your Black Belt is not the end—it is the ultimate beginning of your lifelong journey in true Karate-Do.</p>
                    </div>

                    <div className="shodan-showcase">
                        <div className="shodan-showcase__bg"></div>
                        <div className="shodan-showcase__content">
                            <div className="shodan-showcase__icon">
                                <GiBlackBelt />
                            </div>
                            <h3 className="shodan-showcase__title">Shodan <span className="shodan-showcase__subtitle">(1st Dan Black Belt)</span></h3>
                            
                            <div className="shodan-showcase__divider"></div>
                            
                            <p className="shodan-showcase__philosophy">
                                "Sho" (初) translates as beginning. "Dan" (段) translates as step or degree. 
                                <br/><br/>
                                <span className="shodan-quote">To wear the Black Belt is to embody the spirit of the Dojo: unyielding resilience, profound humility, and absolute mastery of oneself.</span>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== CTA ===== */}
            <section className="section grading-cta">
                <div className="container">
                    <div className="glass-card grading-cta__inner">
                        <h2 className="section-title">Ready for Your Next Belt?</h2>
                        <p className="section-subtitle" style={{ margin: '0 auto 2rem auto', textAlign: 'center' }}>
                            Check the events calendar for the next grading date and register with your Sensei.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link href="/events" className="btn btn-primary">View Grading Dates <FaArrowRight /></Link>
                            <Link href="/contact" className="btn btn-secondary">Contact Us</Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
