import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import { getAnnouncementBySlug } from '@/lib/server/sheets'
import { FaWhatsapp, FaArrowLeft } from 'react-icons/fa'

export const revalidate = 60

type Props = {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const post = await getAnnouncementBySlug(slug)
    if (!post) {
        return { title: 'Not Found' }
    }
    const excerpt = post.body.length > 150 ? post.body.substring(0, 150) + '...' : post.body
    return {
        title: `${post.title} — SKF Karate`,
        description: excerpt,
        openGraph: {
            title: post.title,
            description: excerpt,
            siteName: 'SKF Karate',
            type: 'article',
            publishedTime: post.publishedDate,
            authors: [post.author]
        }
    }
}

export default async function NewsArticlePage({ params }: Props) {
    const { slug } = await params
    const post = await getAnnouncementBySlug(slug)

    if (!post) {
        return notFound()
    }

    const today = new Date()
    const isExpired = new Date(post.expiryDate) < today
    if (isExpired) {
        return notFound()
    }

    const dateFormatted = new Date(post.publishedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    const isAll = post.branch === 'ALL'
    
    // Fallback URL for WhatsApp sharing
    const shareUrl = `https://skfkarate.com/news/${post.slug}`

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        'headline': post.title,
        'datePublished': post.publishedDate,
        'author': { '@type': 'Person', 'name': post.author },
        'publisher': { '@type': 'Organization', 'name': 'SKF Karate' }
    }

    return (
        <div style={{ minHeight: '100vh', padding: '120px 2rem 4rem', background: '#050a15', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                
                <Link href="/news" style={{ 
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem', 
                    color: 'rgba(255,255,255,0.6)', textDecoration: 'none', 
                    marginBottom: '2rem', fontSize: '0.9rem',
                    transition: 'color 0.2s'
                }}>
                    <FaArrowLeft /> Back to News
                </Link>

                <div style={{ 
                    background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid rgba(255,255,255,0.08)', 
                    borderRadius: '24px', 
                    padding: '3rem',
                    position: 'relative'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <span style={{ 
                            background: isAll ? 'rgba(255, 183, 3, 0.15)' : 'rgba(220, 53, 69, 0.15)', 
                            color: isAll ? 'var(--gold, #ffb703)' : 'var(--crimson, #dc3545)',
                            padding: '0.5rem 1rem',
                            borderRadius: '50px',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            {isAll ? 'All Branches' : post.branch}
                        </span>
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', fontWeight: 500 }}>
                            {dateFormatted}
                        </span>
                    </div>

                    <h1 style={{ 
                        fontSize: 'clamp(2rem, 5vw, 3.5rem)', 
                        fontWeight: 800, 
                        margin: '0 0 1rem', 
                        color: 'var(--gold, #ffb703)', 
                        lineHeight: 1.2,
                        letterSpacing: '-0.02em'
                    }}>
                        {post.title}
                    </h1>

                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        By <span style={{ color: '#fff', fontWeight: 600 }}>{post.author}</span>
                    </div>

                    <div style={{ 
                        fontSize: '1.05rem', 
                        lineHeight: 1.8, 
                        color: 'rgba(255,255,255,0.85)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.2rem'
                    }}>
                        {post.body.split('\n').map((paragraph, idx) => (
                            paragraph.trim() ? <p key={idx} style={{ margin: 0 }}>{paragraph}</p> : null
                        ))}
                    </div>

                    <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'center' }}>
                        <a 
                            href={`https://wa.me/?text=${encodeURIComponent(post.title + '\n\n' + shareUrl)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.8rem',
                                background: '#25D366',
                                color: '#fff',
                                textDecoration: 'none',
                                padding: '0.8rem 1.5rem',
                                borderRadius: '50px',
                                fontWeight: 'bold',
                                transition: 'opacity 0.2s'
                            }}
                        >
                            <FaWhatsapp size={20} /> Share on WhatsApp
                        </a>
                    </div>
                </div>

            </div>
        </div>
    )
}
