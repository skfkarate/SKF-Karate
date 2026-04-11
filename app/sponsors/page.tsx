import { Metadata } from 'next'
import SponsorGrid from '@/components/SponsorGrid'
import { FaHandshake } from 'react-icons/fa'

export const metadata: Metadata = {
    title: 'Our Sponsors | SKF Karate',
    description: 'A massive thank you to our official partners and sponsors who support the SKF Karate federation.',
}

export const revalidate = 3600

export default function SponsorsPage() {
    return (
        <div style={{ background: 'var(--bg-body, #080b14)', minHeight: '100vh' }}>
            <section className="page-hero" style={{ minHeight: '40vh', paddingBottom: '3rem' }}>
                <div className="page-hero__bg">
                    <div className="glow glow-gold page-hero__glow-1"></div>
                    <div className="glow glow-red page-hero__glow-2"></div>
                </div>
                <div className="container page-hero__content">
                    <span className="section-label">
                        <FaHandshake /> Partners
                    </span>
                    <h1 className="page-hero__title">
                        Our <span className="text-gradient">Sponsors</span>
                    </h1>
                    <p className="page-hero__subtitle" style={{ maxWidth: '600px', margin: '0 auto' }}>
                        We are immensely grateful to the official partners who power our athletes and enable global excellence.
                    </p>
                </div>
            </section>

            <section className="section" style={{ paddingTop: '2rem' }}>
                <div className="container">
                    <div style={{ marginBottom: '5rem' }}>
                        <SponsorGrid />
                    </div>
                </div>
            </section>
        </div>
    )
}
