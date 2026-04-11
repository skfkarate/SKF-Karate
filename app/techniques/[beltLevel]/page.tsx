import { getTechniqueVideos } from '@/lib/server/sheets'
import { Metadata } from 'next'
import TechniquesClient from '../TechniquesClient'
import Link from 'next/link'
import { FaArrowLeft, FaAward } from 'react-icons/fa'

export const revalidate = 3600

export async function generateStaticParams() {
    const belts = ['white', 'yellow', 'orange', 'green', 'blue', 'brown', 'black']
    return belts.map(b => ({ beltLevel: b }))
}

type Props = {
    params: Promise<{ beltLevel: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { beltLevel } = await params
    const capitalizedBelt = beltLevel.charAt(0).toUpperCase() + beltLevel.slice(1)
    
    return {
        title: `${capitalizedBelt} Belt Techniques — SKF Karate`,
        description: `All kata and kumite reference videos for ${capitalizedBelt} belt students`
    }
}

export default async function BeltTechniquesPage({ params }: Props) {
    const { beltLevel } = await params
    const capitalizedBelt = beltLevel.charAt(0).toUpperCase() + beltLevel.slice(1)
    
    // We fetch everything and filter down, or pass beltLevel to the server function.
    // The server function takes `beltLevel` as the first argument.
    const videos = await getTechniqueVideos(beltLevel)

    return (
        <div style={{ minHeight: '100vh', padding: '120px 2rem 4rem', background: '#050a15', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                
                <Link href="/techniques" style={{ 
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem', 
                    color: 'rgba(255,255,255,0.6)', textDecoration: 'none', 
                    marginBottom: '2rem', fontSize: '0.9rem',
                    transition: 'color 0.2s'
                }}>
                    <FaArrowLeft /> Back to All Techniques
                </Link>

                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1.5rem', color: 'var(--gold, #ffb703)', fontSize: '2rem' }}>
                        <FaAward />
                    </div>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900, margin: 0, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
                        <span style={{ color: 'var(--gold, #ffb703)' }}>{capitalizedBelt} Belt</span> Techniques
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '1.5rem', fontSize: '1.1rem', maxWidth: '600px', margin: '1.5rem auto 0' }}>
                        All categorized reference videos for {capitalizedBelt} belt students.
                    </p>
                </div>

                <div style={{ paddingBottom: '2rem' }}>
                    {/* Reusing TechniquesClient with hideBeltFilter=true since the server already filtered it */}
                    <TechniquesClient videos={videos} hideBeltFilter={true} />
                </div>
            </div>
        </div>
    )
}
