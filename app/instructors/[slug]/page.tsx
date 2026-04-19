import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { FaArrowLeft, FaAward, FaBuilding, FaCheckCircle, FaStar } from 'react-icons/fa'
import { leadershipData } from '@/lib/leadershipData'

// Generate static params for all defined instructors
export function generateStaticParams() {
    return leadershipData.map((instructor) => ({
        slug: instructor.slug,
    }))
}

// Generate dynamic SEO metadata
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
    const instructor = leadershipData.find(i => i.slug === params.slug)
    
    if (!instructor) {
        return { title: 'Instructor Not Found' }
    }
    
    return {
        title: `${instructor.name} — SKF Karate Master Profile`,
        description: instructor.desc,
    }
}

export default function InstructorProfilePage({ params }: { params: { slug: string } }) {
    const instructor = leadershipData.find(i => i.slug === params.slug)

    if (!instructor) {
        notFound()
    }

    return (
        <div style={{ background: '#05080f', minHeight: '100vh', paddingBottom: '6rem' }}>
            
            {/* ═══════ HERO: Master Header ═══════ */}
            <section style={{ paddingTop: '8rem', paddingBottom: '4rem', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 70% 30%, rgba(214,40,40,0.1) 0%, transparent 60%)', zIndex: 0 }} />
                
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <Link 
                        href="/about" 
                        style={{ 
                            color: 'rgba(255,255,255,0.5)', 
                            textDecoration: 'none', 
                            fontSize: '0.9rem', 
                            letterSpacing: '1px',
                            display: 'inline-flex', 
                            alignItems: 'center',
                            marginBottom: '2rem',
                            textTransform: 'uppercase'
                        }}
                    >
                        <FaArrowLeft style={{ marginRight: '0.5rem' }} /> Back to Academy Leadership
                    </Link>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4rem', alignItems: 'center' }}>
                        {/* Portrait */}
                        <div style={{ flex: '1 1 300px', maxWidth: '400px' }}>
                            <div style={{ position: 'relative', width: '100%', aspectRatio: '3/4', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,183,3,0.2)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                                <Image src={instructor.image} alt={instructor.name} fill style={{ objectFit: 'cover' }} priority />
                            </div>
                        </div>

                        {/* Title Block */}
                        <div style={{ flex: '2 1 400px' }}>
                            <div style={{ color: 'var(--crimson-light)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                                {instructor.title}
                            </div>
                            <h1 style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', color: '#fff', fontFamily: 'var(--font-heading)', lineHeight: 1.1, marginBottom: '1rem', letterSpacing: '-1px' }}>
                                {instructor.name}
                            </h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--gold)', fontWeight: 600, fontSize: '1.2rem', marginBottom: '2rem' }}>
                                <FaAward /> {instructor.dan || instructor.rank}
                            </div>
                            
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem', lineHeight: 1.6, maxWidth: '600px', marginBottom: '2rem' }}>
                                {instructor.desc}
                            </p>

                            {/* Quick Stats Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '1rem 1.5rem', borderRadius: '12px' }}>
                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.3rem' }}>Primary Domain</div>
                                    <div style={{ color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FaCheckCircle style={{ color: 'var(--gold)' }}/> {instructor.specialty || 'Curriculum Standards'}
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '1rem 1.5rem', borderRadius: '12px' }}>
                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.3rem' }}>Location / Branch</div>
                                    <div style={{ color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FaBuilding style={{ color: 'var(--gold)' }}/> {instructor.branch || 'Global'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ CONTENT: Bio & Achievements ═══════ */}
            <section style={{ paddingTop: '5rem' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '5rem' }}>
                        
                        {/* Biography */}
                        <div style={{ flex: 2 }}>
                            <h2 style={{ fontSize: '2rem', color: '#fff', fontFamily: 'var(--font-heading)', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                                Master Biography
                            </h2>
                            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.15rem', lineHeight: 1.8 }}>
                                {instructor.fullBio.split('\n').map((paragraph, index) => (
                                    <p key={index} style={{ marginBottom: '1.5rem' }}>{paragraph}</p>
                                ))}
                            </div>
                        </div>

                        {/* Milestones & Achievements */}
                        <div style={{ flex: 1 }}>
                            <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '3rem 2.5rem' }}>
                                <h3 style={{ fontSize: '1.5rem', color: '#fff', fontFamily: 'var(--font-heading)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                                    <FaStar style={{ color: 'var(--gold)' }}/> Career Milestones
                                </h3>
                                
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {instructor.achievements.map((achievement, idx) => (
                                        <li key={idx} style={{ position: 'relative', paddingLeft: '1.5rem', marginBottom: '1.5rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, fontSize: '1.05rem' }}>
                                            <div style={{ position: 'absolute', left: 0, top: '0.5rem', width: '6px', height: '6px', background: 'var(--crimson-light)', borderRadius: '50%' }} />
                                            {achievement}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

        </div>
    )
}
