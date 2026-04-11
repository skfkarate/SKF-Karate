import Link from 'next/link'
import { FaArrowRight, FaQuoteLeft, FaTrophy } from 'react-icons/fa'
import { GiBlackBelt, GiKatana, GiMeditation, GiYinYang, GiPunch } from 'react-icons/gi'
import './senseis.css'

const allSenseis = [
    {
        id: 'akira',
        name: 'Sensei Akira',
        dan: '5th Dan — Godan',
        role: 'Chief Instructor & Founder',
        spec: 'Kata & Kumite Mastery',
        dojos: 'SKF Headquarters',
        dojoSlug: 'koramangala',
        exp: '20+ years of relentless dedication',
        achievements: 'National Champion (3x), State Kata Champion, WKF-certified Elite Coach',
        quote: "True mastery is not found in the defeat of an opponent, but in the perfection of the self through tireless discipline.",
        icon: <GiKatana />,
        color: 'gold'
    },
    {
        id: 'ravi',
        name: 'Sensei Ravi',
        dan: '4th Dan — Yondan',
        role: 'Senior Instructor',
        spec: 'Advanced Kumite',
        dojos: 'Central Dojo',
        dojoSlug: 'central',
        exp: '15+ years',
        achievements: 'State Kumite Champion (5x) • National Team Coach • Elite Tactic Specialist',
        quote: "The mat is a mirror. It reflects your fears, but more importantly, it shows you the warrior you can become.",
        icon: <GiBlackBelt />,
        color: 'crimson'
    },
    {
        id: 'meera',
        name: 'Sensei Meera',
        dan: '3rd Dan — Sandan',
        role: 'Instructor',
        spec: 'Technical Kata',
        dojos: 'East District Dojo',
        dojoSlug: 'east',
        exp: '12+ years',
        achievements: 'State Kata Champion (2x) • Certified Kata Judge • Form Correction Expert',
        quote: "Every form contains a thousand battles. Precision is the ultimate weapon against chaos.",
        icon: <GiYinYang />,
        color: 'blue'
    },
    {
        id: 'arjun',
        name: 'Sensei Arjun',
        dan: '3rd Dan — Sandan',
        role: 'Instructor',
        spec: 'Kumite & Self-Defence',
        dojos: 'North District Dojo',
        dojoSlug: 'north',
        exp: '10+ years',
        achievements: 'National Kumite Bronze • Self-Defence Program Director • Street-Ready Tactical Lead',
        quote: "We train for the fights we never wish to have. Preparedness brings peace.",
        icon: <GiPunch />,
        color: 'gold'
    },
    {
        id: 'priya',
        name: 'Sensei Priya',
        dan: '2nd Dan — Nidan',
        role: 'Assistant Instructor',
        spec: 'Junior Training',
        dojos: 'SKF Headquarters',
        dojoSlug: 'koramangala',
        exp: '8+ years',
        achievements: 'Junior Development Lead • State Medalist • Child Psychology inside the Dojo',
        quote: "The hardest belt to earn is the white belt. My duty is to turn that first step into a lifelong journey.",
        icon: <GiMeditation />,
        color: 'crimson'
    },
    {
        id: 'karthik',
        name: 'Sensei Karthik',
        dan: '2nd Dan — Nidan',
        role: 'Assistant Instructor',
        spec: 'Fitness Conditioning',
        dojos: 'South District Dojo',
        dojoSlug: 'south',
        exp: '7+ years',
        achievements: 'Conditioning Specialist • Core Strengthening • Agility & Reflex Mastery',
        quote: "Fatigue makes cowards of us all. I forge bodies so the spirit never has to surrender.",
        icon: <GiBlackBelt />,
        color: 'blue'
    }
];

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
