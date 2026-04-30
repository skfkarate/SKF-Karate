import { FaQuoteLeft } from 'react-icons/fa'
import TestimonialCarousel from '@/components/TestimonialCarousel'
import ScrollReveal from '@/app/_components/ScrollReveal'

export default function HomeTestimonials() {
    return (
        <section className="home-testimonials section section--tint-dark">
            <div className="container">
                <ScrollReveal>
                    <div className="home-testimonials__header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <span className="section-label"><FaQuoteLeft /> Word of Mouth</span>
                        <h2 className="section-title">
                            What <span className="text-gradient">Parents Say</span>
                        </h2>
                        <p className="section-subtitle" style={{ margin: '0 auto' }}>
                            Hear from the families who trust SKF Karate with their children&apos;s development.
                        </p>
                    </div>
                </ScrollReveal>

                <ScrollReveal delay={0.2}>
                    <TestimonialCarousel />
                </ScrollReveal>
            </div>
        </section>
    )
}
