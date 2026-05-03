import { FaPhoneAlt, FaPaperPlane, FaWhatsapp } from 'react-icons/fa'

import { CONTACT } from '@/data/constants/contact'

export default function ContactInfoPanel() {
  return (
    <div className="contact-info-list">
      <a href={`tel:${CONTACT.PHONE_RAW}`} className="contact-glass-pane" style={{ textDecoration: 'none' }}>
        <div className="contact-info-icon contact-info-icon--call">
          <FaPhoneAlt />
        </div>
        <div className="contact-info-content">
          <div className="contact-info-label">Direct Line</div>
          <h4 className="contact-info-value">{CONTACT.PHONE}</h4>
          <p className="contact-info-text">
            Tap to call our Sensei immediately.
          </p>
        </div>
      </a>

      <a href={`https://wa.me/${CONTACT.PHONE_RAW}`} target="_blank" rel="noopener noreferrer" className="contact-glass-pane" style={{ textDecoration: 'none' }}>
        <div className="contact-info-icon contact-info-icon--whatsapp">
          <FaWhatsapp />
        </div>
        <div className="contact-info-content">
          <div className="contact-info-label">WhatsApp</div>
          <h4 className="contact-info-value">{CONTACT.PHONE}</h4>
          <p className="contact-info-text">
            Message us for a quick consultation.
          </p>
        </div>
      </a>

      <div className="contact-glass-pane">
        <div className="contact-info-icon">
          <FaPaperPlane />
        </div>
        <div className="contact-info-content">
          <div className="contact-info-label">Response Time</div>
          <h4 className="contact-info-value">Fast Response</h4>
          <p className="contact-info-text">
            Our team is notified instantly upon submission.
          </p>
        </div>
      </div>
    </div>
  )
}
