import Link from 'next/link'
import { FaArrowRight } from 'react-icons/fa'
import { GiBlackBelt } from 'react-icons/gi'
import './senseis.css'



const senseis = [
    { name: 'Sensei Akira', dan: '5th Dan — Godan', role: 'Chief Instructor', spec: 'Kata & Kumite', dojos: 'SKF Headquarters', exp: '20+ years', achievements: 'National Champion (3x), State Kata Champion, WKF-certified Coach' },
    { name: 'Sensei Ravi', dan: '4th Dan — Yondan', role: 'Senior Instructor', spec: 'Kumite', dojos: 'Central Dojo, West District', exp: '15+ years', achievements: 'State Kumite Champion (5x), National Team Coach' },
    { name: 'Sensei Meera', dan: '3rd Dan — Sandan', role: 'Instructor', spec: 'Kata', dojos: 'East District Dojo', exp: '12+ years', achievements: 'State Kata Champion (2x), Certified Kata Judge' },
    { name: 'Sensei Arjun', dan: '3rd Dan — Sandan', role: 'Instructor', spec: 'Kumite & Self-Defence', dojos: 'North District Dojo', exp: '10+ years', achievements: 'National Kumite Bronze, Self-Defence Program Director' },
    { name: 'Sensei Priya', dan: '2nd Dan — Nidan', role: 'Assistant Instructor', spec: 'Junior Training', dojos: 'SKF Headquarters', exp: '8+ years', achievements: 'Junior Development Lead, State Medalist' },
    { name: 'Sensei Karthik', dan: '2nd Dan — Nidan', role: 'Assistant Instructor', spec: 'Kata & Fitness', dojos: 'South District Dojo', exp: '7+ years', achievements: 'Fitness Conditioning Specialist, State Champion' },
]

export default function SenseisPage() {
    return (
        <div className="senseis-page">
            <section className="page-hero">
                <div className="page-hero__bg">
                    <div className="glow glow-red page-hero__glow-1"></div>
                    <div className="glow glow-blue page-hero__glow-2"></div>
                </div>
                <div className="container page-hero__content">
                    <span className="section-label"><GiBlackBelt /> Our Senseis</span>
                    <h1 className="page-hero__title">Meet Our <span className="text-gradient">Senseis</span></h1>
                    <p className="page-hero__subtitle">Masters Who Forge Champions</p>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <div className="senseis__intro">
                        <p className="section-subtitle" style={{ margin: '0 auto', textAlign: 'center' }}>
                            Our Senseis are not just instructors — they are mentors, role models, and lifelong practitioners of Karate-Do. Every one of them brings real competition experience and professional coaching certifications.
                        </p>
                    </div>

                    <div className="senseis__grid">
                        {senseis.map((s, i) => (
                            <div className="glass-card sensei-card" key={i}>
                                <div className="sensei-card__avatar">
                                    <GiBlackBelt />
                                </div>
                                <h3>{s.name}</h3>
                                <span className="sensei-card__dan">{s.dan}</span>
                                <span className="sensei-card__role">{s.role}</span>

                                <div className="sensei-card__details">
                                    <div className="sensei-detail"><strong>Specialization</strong><span>{s.spec}</span></div>
                                    <div className="sensei-detail"><strong>Dojo</strong><span>{s.dojos}</span></div>
                                    <div className="sensei-detail"><strong>Experience</strong><span>{s.exp}</span></div>
                                </div>
                                <p className="sensei-card__achievements">{s.achievements}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                        <h2 className="section-title">Train Under the Best</h2>
                        <p className="section-subtitle" style={{ margin: '0 auto 2rem auto', textAlign: 'center' }}>
                            Find a dojo near you and begin your journey with one of our experienced Senseis.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link href="/dojos" className="btn btn-primary">Find a Dojo <FaArrowRight /></Link>
                            <Link href="/contact" className="btn btn-secondary">Contact Us</Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
