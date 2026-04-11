import { getAnnouncements } from '@/lib/server/sheets'
import Link from 'next/link'
import { Metadata } from 'next'
import NewsListingClient from './NewsListingClient'

export const metadata: Metadata = {
    title: 'News & Updates',
    description: 'Latest tournament results, events, and announcements from SKF Karate Bangalore'
}

export const revalidate = 60

export default async function NewsPage() {
    // Drop the branch to fetch all globally active announcements
    const announcements = await getAnnouncements()

    return (
        <div style={{ minHeight: '100vh', padding: '120px 2rem 4rem', background: '#050a15', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: 0, color: '#fff' }}>SKF News <span style={{ color: 'var(--gold, #ffb703)' }}>&</span> Announcements</h1>
                    <p style={{ color: '#aaa', marginTop: '1rem', fontSize: '1.1rem' }}>
                        Stay updated with our latest events, tournament results, and branch circulars.
                    </p>
                </div>

                <NewsListingClient initialAnnouncements={announcements} />
            </div>
        </div>
    )
}
