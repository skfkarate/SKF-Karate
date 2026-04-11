import Image from 'next/image'
import Link from 'next/link'
import { getSponsors, Sponsor } from '@/lib/server/sheets'

type Props = {
    tierFilter?: 'Gold' | 'Silver' | 'Bronze'
    layout?: 'flex' | 'grid'
}

export default async function SponsorGrid({ tierFilter, layout = 'grid' }: Props) {
    let sponsors = await getSponsors()

    if (tierFilter) {
        sponsors = sponsors.filter(s => s.tier === tierFilter)
    }

    if (sponsors.length === 0) {
        if (!tierFilter) {
            return (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '1rem' }}>Interested in sponsoring SKF Karate?</h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem' }}>Reach out to us to become an official partner.</p>
                    <Link href="/contact" className="btn btn-outline-dynamic">
                        Contact Us
                    </Link>
                </div>
            )
        }
        return null // If a specific tier is filtered and empty, return nothing
    }

    return (
        <div style={{ 
            display: layout === 'grid' ? 'grid' : 'flex',
            gridTemplateColumns: layout === 'grid' ? 'repeat(auto-fit, minmax(200px, 1fr))' : 'none',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '2rem',
            alignItems: 'center'
        }}>
            {sponsors.map(sponsor => {
                const isGold = sponsor.tier === 'Gold'
                const isSilver = sponsor.tier === 'Silver'
                const imgWidth = isGold ? 150 : isSilver ? 100 : 80

                // Render structure based on tier size
                return (
                    <a 
                        key={sponsor.name}
                        href={sponsor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            background: isGold ? 'rgba(255, 183, 3, 0.05)' : isSilver ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                            border: isGold ? '1px solid rgba(255, 183, 3, 0.2)' : isSilver ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                            padding: isGold ? '2rem' : isSilver ? '1.5rem' : '0.5rem',
                            borderRadius: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            textDecoration: 'none',
                            transition: 'transform 0.3s',
                        }}
                        className="sponsor-card-hover"
                    >
                        <div style={{ position: 'relative', width: imgWidth, height: imgWidth * 0.6, marginBottom: isGold || isSilver ? '1rem' : '0.5rem' }}>
                            <Image 
                                src={sponsor.logoUrl || '/logo/SKF logo.png'} 
                                alt={`${sponsor.name} Logo`} 
                                fill
                                style={{ objectFit: 'contain' }}
                            />
                        </div>
                        {isGold && (
                            <>
                                <h4 style={{ color: 'var(--gold, #ffb703)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>{sponsor.name}</h4>
                                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                                    {sponsor.description}
                                </p>
                            </>
                        )}
                        {isSilver && (
                            <>
                                <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '0.5rem' }}>{sponsor.name}</h4>
                                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                                    {sponsor.description.length > 50 ? sponsor.description.slice(0, 50) + '...' : sponsor.description}
                                </p>
                            </>
                        )}
                        {!isGold && !isSilver && (
                            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>{sponsor.name}</span>
                        )}
                    </a>
                )
            })}
        </div>
    )
}
