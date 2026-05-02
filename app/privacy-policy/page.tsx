import '../legal.css'

export const metadata = {
  title: 'SKF Karate',
  description: 'Privacy Policy for Sports Karate-do Fitness & Self Defence Association®',
}

export default function PrivacyPolicy() {
  return (
    <div className="privacy-page">
      {/* Ambient effects */}
      <div className="privacy-orb privacy-orb--1" />
      <div className="privacy-orb privacy-orb--2" />

      {/* HERO */}
      <section className="privacy-hero">
        <div className="container">
          <span className="section-label">Legal Documentation</span>
          <h1 className="privacy-hero__title">
            Privacy <span className="text-gradient">Policy</span>
          </h1>
        </div>
      </section>

      {/* CONTENT */}
      <div className="privacy-container">
        <div className="privacy-glass-card">
          
          <section className="privacy-section">
            <h2 className="privacy-section__title">1. Information We Collect</h2>
            <p className="privacy-text">
              We collect information provided during student enrollment, portal access, class management, event registration, fee administration, and direct inquiries.
            </p>
            <ul className="privacy-list">
              <li className="privacy-list-item">Student name, SKF ID, date of birth, branch, batch, belt level, and training status</li>
              <li className="privacy-list-item">Parent/guardian name, phone number, email address, and consent records</li>
              <li className="privacy-list-item">Belt progression, grading history, event participation, rankings, certificates, and training video progress</li>
              <li className="privacy-list-item">Fee history, receipts, and payment status. Card details are not stored by SKF Karate.</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2 className="privacy-section__title">2. How We Use Your Information</h2>
            <p className="privacy-text">
              We use student and guardian data only for club operations: managing classes, verifying athlete portal access, tracking training progress, issuing certificates, maintaining fee records, communicating event updates, and supporting safety or administrative follow-up.
            </p>
          </section>

          <section className="privacy-section">
            <h2 className="privacy-section__title">3. Children&apos;s Data and Parent/Guardian Consent</h2>
            <p className="privacy-text">
              Many SKF Karate students are minors. For students under 18, enrollment and portal records must be created with parent or guardian consent. This consent is recorded in the athlete record and can be reviewed by the administrative team.
            </p>
            <p className="privacy-text">
              Parents or guardians may request correction, access, or deletion of a child&apos;s personal data by contacting SKF Karate. Requests may be subject to operational, legal, accounting, or safety retention requirements.
            </p>
          </section>

          <section className="privacy-section">
            <h2 className="privacy-section__title">4. Infrastructure & Partners</h2>
            <p className="privacy-text">
              We utilize enterprise-grade infrastructure to ensure your data remains secure. Your information is processed through the following trusted platforms:
            </p>
            <ul className="privacy-list">
              <li className="privacy-list-item">
                <span className="privacy-strong">Supabase:</span> Manages authenticated access, student records, and encrypted rankings.
              </li>
              <li className="privacy-list-item">
                <span className="privacy-strong">Google Cloud:</span> Used for backend automation and real-time timetable synchronization.
              </li>
              <li className="privacy-list-item">
                <span className="privacy-strong">Razorpay:</span> Handles all financial transactions with end-to-end encryption. We do not store card details.
              </li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2 className="privacy-section__title">5. Data Retention</h2>
            <p className="privacy-text">
              Active student records are retained while the student is enrolled. Historical grading, certificate, ranking, and fee records may be retained after a student leaves where needed for verification, accounting, dispute handling, federation records, or legal compliance.
            </p>
          </section>

          <section className="privacy-section">
            <h2 className="privacy-section__title">6. Data Sovereignty</h2>
            <p className="privacy-text">
              We do not sell, trade, or distribute your personal data to third-party marketing entities. Your data exists solely for the purpose of your association with Sports Karate-do Fitness.
            </p>
          </section>

          <section className="privacy-section">
            <h2 className="privacy-section__title">7. Contact Legal</h2>
            <p className="privacy-text">
              For any clarifications regarding our data practices or to request data deletion, please reach out to our administrative team:
            </p>
            <div className="privacy-text" style={{ marginTop: '1rem', color: '#fff', fontWeight: 600 }}>
              Email: contact@skfkarate.org<br/>
              Phone: +91 90199 71726
            </div>
          </section>

          <div className="privacy-footer">
            <p className="privacy-updated">Document Revision: April 2026</p>
          </div>

        </div>
      </div>
    </div>
  )
}
