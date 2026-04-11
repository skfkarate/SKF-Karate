import { getTechniqueVideos } from '@/lib/server/sheets'
import Image from 'next/image'
import { Metadata } from 'next'
import TechniquesClient from './TechniquesClient'
import { FaStar } from 'react-icons/fa'

export const revalidate = 3600

export const metadata: Metadata = {
    title: 'Technique Library — SKF Karate',
    description: 'Kata, kumite, and kihon technique videos for all belt levels'
}

export default async function TechniqueLibraryPage() {
    const videos = await getTechniqueVideos()
    
    // Sort so featured videos can be shown at the top if needed, 
    // although the requirements said "Featured videos section at top: show Techniques where Featured = YES"
    const featuredVideos = videos.filter(v => v.featured)

    function extractVideoId(url: string) {
        if (!url) return null;
        let match = url.match(/embed\/([^?]+)/);
        return match ? match[1] : null;
    }

    return (
        <div style={{ minHeight: '100vh', padding: '120px 2rem 4rem', background: '#050a15', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900, margin: 0, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
                        Technique <span style={{ color: 'var(--gold, #ffb703)' }}>Library</span>
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '1.5rem', fontSize: '1.1rem', maxWidth: '600px', margin: '1.5rem auto 0' }}>
                        Access our curated collection of Kata, Kumite, and Kihon technique reference videos to support your training journey.
                    </p>
                </div>

                {featuredVideos.length > 0 && (
                    <div style={{ marginBottom: '5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gold, #ffb703)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase' }}>
                            <FaStar /> Featured Techniques
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                            {featuredVideos.slice(0, 3).map(video => {
                                const vId = extractVideoId(video.youtubeUrl)
                                const thumbnailUrl = vId ? `https://img.youtube.com/vi/${vId}/maxresdefault.jpg` : ''
                                return (
                                    <div key={`feat-${video.videoId}`} style={{
                                        position: 'relative',
                                        borderRadius: '24px',
                                        overflow: 'hidden',
                                        border: '1px solid rgba(255, 183, 3, 0.3)',
                                        boxShadow: '0 20px 50px rgba(255, 183, 3, 0.1)',
                                        background: '#000'
                                    }}>
                                        <div style={{ width: '100%', paddingTop: '56.25%', position: 'relative' }}>
                                            {thumbnailUrl && (
                                                // We just display it like a card here; the click interaction 
                                                // could open modal, but standard link or duplicate TechniquesClient might be cleaner.
                                                // For a featured section, maybe passing them to TechniquesClient is easier,
                                                // but since we want it distinct, let's just make it a nice static visually pleasing block
                                                // Or we can just import a simpler client component, but let's just use standard img.
                                                <Image 
                                                    src={thumbnailUrl} 
                                                    alt={video.title} 
                                                    fill
                                                    style={{ objectFit: 'cover', opacity: 0.7 }}
                                                />
                                            )}
                                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}></div>
                                            <div style={{ position: 'absolute', bottom: 0, left: 0, padding: '1.5rem', width: '100%' }}>
                                                <span style={{ 
                                                    background: 'var(--gold, #ffb703)', color: '#000', 
                                                    padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 'bold',
                                                    textTransform: 'uppercase', marginBottom: '0.8rem', display: 'inline-block'
                                                }}>
                                                    Featured
                                                </span>
                                                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                                                    {video.title}
                                                </h3>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                <div style={{ paddingBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '2rem', textTransform: 'uppercase' }}>
                        Browse All Videos
                    </h2>
                    <TechniquesClient videos={videos} />
                </div>
            </div>
        </div>
    )
}
