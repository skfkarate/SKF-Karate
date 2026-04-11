export const metadata = {
  title: 'Terms of Service | SKF Karate',
  description: 'Terms of Service and conditions for SKF Karate.',
}

export default function TermsConditions() {
  return (
    <div className="page-wrapper">
      <div className="page-hero" style={{ minHeight: '40vh' }}>
        <div className="page-hero__bg">
          <div className="glow glow-red page-hero__glow-1"></div>
          <div className="glow glow-gold page-hero__glow-2"></div>
        </div>
        <div className="page-hero__content container">
          <h1 className="page-hero__title">Terms of <span className="text-gradient">Service</span></h1>
        </div>
      </div>

      <section className="section" style={{ paddingTop: '4rem', paddingBottom: '7rem' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', color: 'var(--text-light)', lineHeight: '1.8' }}>
          
          <h2 style={{ color: 'white', marginTop: '2rem', marginBottom: '1rem' }}>1. Acceptance of Terms</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.
          </p>

          <h2 style={{ color: 'white', marginTop: '2rem', marginBottom: '1rem' }}>2. Training & Liability</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            Martial arts training involves physical contact and inherent risks. Athletes and parents/guardians acknowledge these risks. The SKF Karate organization and its instructors are not liable for injuries sustained during training, grading, or tournaments.
          </p>

          <h2 style={{ color: 'white', marginTop: '2rem', marginBottom: '1rem' }}>3. Fee Policies & Refunds</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            All tuition fees, belt examination fees, and summer camp enrollments must be paid strictly through authorized payment gateways. Tournament fees are non-refundable unless the event is canceled by SKF.
          </p>

          <h2 style={{ color: 'white', marginTop: '2rem', marginBottom: '1rem' }}>4. Code of Conduct</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            Athletes are expected to adhere to the traditional respect and discipline required in the DoJo. Instructors reserve the right to dismiss any athlete whose behavior is disruptive or unsafe.
          </p>

          <p style={{ marginTop: '3rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Last updated: March 2026
          </p>
        </div>
      </section>
    </div>
  )
}
