export const metadata = {
  title: 'Privacy Policy | SKF Karate',
  description: 'Privacy Policy for Sports Karate-do Fitness & Self Defence Association®',
}

export default function PrivacyPolicy() {
  return (
    <div className="page-wrapper">
      <div className="page-hero" style={{ minHeight: '40vh' }}>
        <div className="page-hero__bg">
          <div className="glow glow-red page-hero__glow-1"></div>
          <div className="glow glow-blue page-hero__glow-2"></div>
        </div>
        <div className="page-hero__content container">
          <span className="section-label">Legal</span>
          <h1 className="page-hero__title">Privacy <span className="text-gradient">Policy</span></h1>
        </div>
      </div>

      <section className="section" style={{ paddingTop: '4rem', paddingBottom: '7rem' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', color: 'var(--text-light)', lineHeight: '1.8' }}>
          
          <h2 style={{ color: 'white', marginTop: '2rem', marginBottom: '1rem' }}>1. Information We Collect</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            We collect information you provide directly to us when you fill out forms, register for classes, or contact us. This includes your name, email address, phone number, and any other details you choose to provide.
          </p>

          <h2 style={{ color: 'white', marginTop: '2rem', marginBottom: '1rem' }}>2. How We Use Your Information</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            We use the information we collect to communicate with you, process registrations for classes or camps, respond to your inquiries, and improve our services.
          </p>

          <h2 style={{ color: 'white', marginTop: '2rem', marginBottom: '1rem' }}>3. Information Sharing & Third-Party Processors</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            We do not sell, trade, or otherwise transfer your personally identifiable information to outside marketing parties. However, your data is securely processed by trusted industry-standard infrastructure providers to deliver our services. This includes:<br/><br/>
            • <b>Supabase:</b> Securely stores student credentials, belt progression records, event enrollments, and encrypted rankings.<br/>
            • <b>Google Sheets:</b> Used transparently by our administrative backend to sync legacy timetable updates and manual registrations.<br/>
            • <b>Razorpay:</b> Securely handles all payment gateway activities. We do not store or process your credit card mappings.
          </p>

          <h2 style={{ color: 'white', marginTop: '2rem', marginBottom: '1rem' }}>4. Data Security</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            We implement reasonable security measures to maintain the safety of your personal information when you enter, submit, or access your personal information.
          </p>

          <h2 style={{ color: 'white', marginTop: '2rem', marginBottom: '1rem' }}>5. Contact Us</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            If there are any questions regarding this privacy policy, you may contact us at contact@skfkarate.org or +91 90199 71726.
          </p>

          <p style={{ marginTop: '3rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Last updated: March 2026
          </p>
        </div>
      </section>
    </div>
  )
}
