import Link from 'next/link'
import { FaArrowRight, FaQuoteLeft, FaTrophy } from 'react-icons/fa'
import { GiBlackBelt, GiKatana, GiMeditation, GiYinYang, GiPunch } from 'react-icons/gi'
import './senseis.css'
import { getSenseis } from '@/data/seed/instructors'
import type { ReactNode } from 'react'

/** Icon map — JSX elements can't live in data files */
const ICON_MAP: Record<string, ReactNode> = {
  akira: <GiKatana />,
  ravi: <GiBlackBelt />,
  meera: <GiYinYang />,
  arjun: <GiPunch />,
  priya: <GiMeditation />,
  karthik: <GiBlackBelt />,
}

const allSenseis = getSenseis().map(s => ({
  id: s.slug,
  name: s.name,
  dan: s.dan,
  role: s.role || s.title,
  spec: s.specialty || 'General Karate',
  dojos: s.dojos || '',
  dojoSlug: s.dojoSlug || '',
  exp: s.experience || '',
  achievements: s.achievements.join(' • '),
  quote: s.quote || '',
  icon: ICON_MAP[s.slug] || <GiBlackBelt />,
  color: s.color || 'gold',
}))

export default function SenseisPage() {
    return (
        <div className="senseis-page">
            {/* ═══════ IMMERSIVE HERO ═══════ */}
            <section className="page-hero sensei-hero">
                <div className="page-hero__bg"></div>
                <div className="container page-hero__content">
                    <span className="section-label hero-label-pulse"><GiBlackBelt /> Guardians of the Art</span>
                    <h1 className="page-hero__title">
                        Meet Our <span className="text-gradient">Senseis</span>
                    </h1>
                    <p className="page-hero__subtitle">
                        Architects of discipline, engineers of strength, and crafters of unyielding spirit. 
                        Train under the guidance of absolute mastery.
                    </p>
                </div>
            </section>

            {/* ═══════ MASTERS LIST ═══════ */}
            <div className="masters-list">
                {allSenseis.map((master, idx) => {
                    const isReverse = idx % 2 !== 0;
                    
                    // Assign subtle alternating background tints
                    const tintClass = idx % 3 === 0 ? "section--tint-cool" : idx % 3 === 1 ? "section--tint-mid" : "section--tint-warm";
                    
                    // Assign colored rings
                    const ringClass = master.color === 'crimson' ? 'spotlight-avatar-ring--crimson' : 
                                      master.color === 'blue' ? 'spotlight-avatar-ring--blue' : 'spotlight-avatar-ring--gold';

                    return (
                        <section key={master.id} className={`section spotlight-section ${tintClass}`}>
                            <div className="container">
                                <div className={`spotlight-card ${isReverse ? 'spotlight-card--reverse' : ''}`}>
                                    <div className="spotlight-card__visual">
                                        <div className={`spotlight-avatar-ring ${ringClass}`}>
                                            <div className="spotlight-avatar">
                                                {master.icon}
                                            </div>
                                        </div>
                                        <div className="spotlight-badge">
                                            <span className="spotlight-badge__rank">{master.dan}</span>
                                        </div>
                                    </div>

                                    <div className="spotlight-card__content">
                                        <span className="spotlight-role">{master.role}</span>
                                        <h2 className="spotlight-name">{master.name}</h2>
                                        
                                        <blockquote className="spotlight-quote">
                                            <FaQuoteLeft className="spotlight-quote-icon" />
                                            {master.quote}
                                        </blockquote>

                                        <div className="spotlight-stats">
                                            <div className="spotlight-stat">
                                                <strong className="text-gold">Specialty</strong>
                                                <span>{master.spec}</span>
                                            </div>
                                            <div className="spotlight-stat">
                                                <strong className="text-gold">Experience</strong>
                                                <span>{master.exp}</span>
                                            </div>
                                            <div className="spotlight-stat">
                                                <strong className="text-gold">Dojo</strong>
                                                <span>
                                                    <Link href={`/dojos/${master.dojoSlug}`} className="link-underline border-white">
                                                        {master.dojos}
                                                    </Link>
                                                </span>
                                            </div>
                                        </div>

                                        <div className="spotlight-achievements">
                                            <strong><FaTrophy className="text-gold mr-half" /> Legacy & Honors</strong>
                                            <p>{master.achievements}</p>
                                        </div>

                                        <div className="spotlight-action">
                                            <Link href={`/senseis/${master.id}`} className="btn btn-primary btn--outline profile-btn">
                                                View Full Profile <FaArrowRight />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    );
                })}
            </div>

            {/* ═══════ JOURNEY CTA ═══════ */}
            <section className="section sensei-cta section--tint-cool">
                <div className="container">
                    <div className="sensei-cta__card glass-card">
                        <div className="sensei-cta__bg-glow"></div>
                        <h2 className="section-title">Step Onto The Mat</h2>
                        <p className="section-subtitle sensei-cta__subtitle">
                            The master has walked the path a thousand times. Now, it is your turn to take the first step. Find a dojo near you and begin your journey.
                        </p>
                        <div className="sensei-cta__actions">
                            <Link href="/dojos" className="btn btn-primary">Find Your Dojo <FaArrowRight /></Link>
                            <Link href="/contact" className="btn btn-secondary">Contact Administration</Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
