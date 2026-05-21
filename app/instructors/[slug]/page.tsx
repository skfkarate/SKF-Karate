import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { FaArrowLeft, FaAward, FaBuilding, FaCheckCircle, FaStar } from 'react-icons/fa'
import {
    getPublicExecutiveCommitteeLive,
    getPublicSenseiBySlugLive,
    getPublicSenseisLive,
} from '@/lib/server/repositories/senseis-live'
import type { SenseiBranchAssignment, SenseiProfile } from '@/lib/types/sensei'
import JsonLdScript from '@/components/JsonLdScript'
import { buildBreadcrumbJsonLd, buildSeoMetadata } from '@/data/constants/seo'

export const revalidate = 300

type PageProps = {
    params: Promise<{ slug: string }>
}

function formatAssignmentLabel(assignments: SenseiBranchAssignment[] = []) {
    const branchNames = Array.from(
        new Set(assignments.map((assignment) => assignment.branchName.trim()).filter(Boolean))
    )

    return branchNames.join(', ')
}

function getDisplayRank(instructor: Pick<SenseiProfile, 'dan' | 'isFounder' | 'name'>) {
    const rank = String(instructor.dan || '').trim()
    if (!rank) return ''

    if (rank === 'Lead Instructor' && !instructor.isFounder && !/^sensei\b/i.test(instructor.name)) {
        return ''
    }

    return rank
}

// Generate static params for all defined instructors
export async function generateStaticParams() {
    const [senseis, executiveCommittee] = await Promise.all([
        getPublicSenseisLive(),
        getPublicExecutiveCommitteeLive(),
    ])
    const routes = new Map(
        [...senseis, ...executiveCommittee].map((instructor) => [instructor.slug, instructor])
    )

    return Array.from(routes.values()).map((instructor) => ({
        slug: instructor.slug,
    }))
}

// Generate dynamic SEO metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const instructor = await getPublicSenseiBySlugLive(slug)
    
    if (!instructor) {
        return buildSeoMetadata(
            '/about',
            'Learn about SKF Karate, a Karnataka karate association training students in traditional karate, self-defense, kata, kumite, and black belt discipline.'
        )
    }

    return buildSeoMetadata(
        `/instructors/${instructor.slug}`,
        `${instructor.name}, ${instructor.title} at SKF Karate. ${instructor.description}`,
        { image: instructor.imageUrl, imageAlt: instructor.name }
    )
}

export default async function InstructorProfilePage({ params }: PageProps) {
    const { slug } = await params
    const instructor = await getPublicSenseiBySlugLive(slug)

    if (!instructor) {
        notFound()
    }

    const breadcrumbJsonLd = buildBreadcrumbJsonLd(
        instructor.name,
        `/instructors/${instructor.slug}`
    )
    const assignmentLabel = formatAssignmentLabel(instructor.assignments)
    const rankLabel = getDisplayRank(instructor)

    return (
        <div style={{ background: '#05080f', minHeight: '100dvh', paddingBottom: '6rem' }}>
            <JsonLdScript data={breadcrumbJsonLd} />
            
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
                                <Image
                                    src={instructor.imageUrl}
                                    alt={instructor.name}
                                    fill
                                    style={{
                                        objectFit: instructor.hidePhoto ? 'contain' : 'cover',
                                        objectPosition: instructor.hidePhoto ? 'center 25%' : (instructor.objectPosition || 'center'),
                                        opacity: instructor.hidePhoto ? 0.35 : 1,
                                        inset: instructor.hidePhoto ? '3rem' : '0'
                                    }}
                                    priority
                                />
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
                            {rankLabel && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--gold)', fontWeight: 600, fontSize: '1.2rem', marginBottom: '2rem' }}>
                                    <FaAward /> {rankLabel}
                                </div>
                            )}
                            
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem', lineHeight: 1.6, maxWidth: '600px', marginBottom: '2rem' }}>
                                {instructor.description}
                            </p>

                            {/* Quick Stats Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '1rem 1.5rem', borderRadius: '12px' }}>
                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.3rem' }}>Primary Domain</div>
                                    <div style={{ color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <FaCheckCircle style={{ color: 'var(--gold)' }}/> {instructor.specialty || 'Curriculum Standards'}
                                    </div>
                                </div>
                                {assignmentLabel && (
                                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '1rem 1.5rem', borderRadius: '12px' }}>
                                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.3rem' }}>Branch Assignment</div>
                                        <div style={{ color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <FaBuilding style={{ color: 'var(--gold)' }}/> {assignmentLabel}
                                        </div>
                                    </div>
                                )}
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
                                {instructor.fullBio.split('\n').filter(Boolean).map((paragraph, index) => (
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
