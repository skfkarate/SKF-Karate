import { FaPhoneAlt, FaPaperPlane } from 'react-icons/fa'

export default function ContactInfoPanel() {
  return (
    <div className="contact-info-list">
      <div className="contact-glass-pane">
        <div className="contact-info-icon contact-info-icon--call">
          <FaPhoneAlt />
        </div>
        <div className="contact-info-content">
          <div className="contact-info-label">Direct Line</div>
          <h4 className="contact-info-value">Quick Call</h4>
          <p className="contact-info-text">
            Skip the form. Call <a href="tel:+919019971726" className="contact-info-link">+91 90199 71726</a> directly to speak with our sensei.
          </p>
        </div>
      </div>

      <div className="contact-glass-pane">
        <div className="contact-info-icon">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
        </div>
        <div className="contact-info-content">
          <div className="contact-info-label">Follow Us</div>
          <h4 className="contact-info-value">Consultation</h4>
          <p className="contact-info-text">
            We'll call you directly to understand your goals and recommend the best program.
          </p>
        </div>
      </div>

      <div className="contact-glass-pane">
        <div className="contact-info-icon">
          <FaPaperPlane />
        </div>
        <div className="contact-info-content">
          <div className="contact-info-label">Response Time</div>
          <h4 className="contact-info-value">Fast Response</h4>
          <p className="contact-info-text">
            Our team is notified instantly, so you won't be kept waiting.
          </p>
        </div>
      </div>
    </div>
  )
}
