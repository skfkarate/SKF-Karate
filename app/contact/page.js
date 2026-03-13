'use client'

import { useState, useRef } from 'react'
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaPaperPlane, FaCheckCircle, FaSpinner, FaUser, FaClock, FaTag, FaPen, FaArrowRight } from 'react-icons/fa'
import './contact.css'

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        preferredTime: '',
        interest: 'Summer Camp 2026',
        message: '',
    })
    const [status, setStatus] = useState('idle') // idle | loading | success | error
    const [errorMsg, setErrorMsg] = useState('')

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    // Email: auto-suggest gmail.com when user types @
    const emailRef = useRef(null)
    const handleEmailChange = (e) => {
        const val = e.target.value
        const prev = formData.email

        // User just typed '@' (new @ that wasn't there before)
        if (val.endsWith('@') && !prev.includes('@')) {
            const filled = val + 'gmail.com'
            setFormData({ ...formData, email: filled })
            // Place cursor right after @ so user can overwrite the domain
            setTimeout(() => {
                if (emailRef.current) {
                    const pos = val.length // right after @
                    emailRef.current.setSelectionRange(pos, filled.length)
                }
            }, 0)
        } else {
            setFormData({ ...formData, email: val })
        }
    }

    // Phone: strip everything except digits, cap at 10, format with +91
    const handlePhoneChange = (e) => {
        let raw = e.target.value

        // Remove the +91 prefix if user typed it, we manage it ourselves
        raw = raw.replace(/^\+91\s*/, '')

        // Keep only digits
        const digits = raw.replace(/\D/g, '').slice(0, 10)

        // Format: +91 XXXXX XXXXX
        let formatted = ''
        if (digits.length > 0) {
            formatted = '+91 ' + digits.slice(0, 5)
            if (digits.length > 5) {
                formatted += ' ' + digits.slice(5)
            }
        }

        setFormData({ ...formData, phone: formatted })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setStatus('loading')
        setErrorMsg('')

        // Client-side phone validation — must have exactly 10 digits
        const phoneDigits = formData.phone.replace(/\D/g, '')
        // phoneDigits will be like "91XXXXXXXXXX" (12 digits) or "XXXXXXXXXX" (10 digits)
        const digitsOnly = phoneDigits.startsWith('91') ? phoneDigits.slice(2) : phoneDigits
        if (digitsOnly.length !== 10) {
            setStatus('error')
            setErrorMsg('Please enter a valid 10-digit mobile number.')
            return
        }

        const fullPhone = '+91' + digitsOnly

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, phone: fullPhone }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong')
            }

            setStatus('success')
            setFormData({ name: '', email: '', phone: '', preferredTime: '', interest: 'Summer Camp 2026', message: '' })
        } catch (err) {
            setStatus('error')
            setErrorMsg(err.message || 'Network error. Please check your connection and try again.')
        }
    }

    return (
        <div className="contact-page">
            <section className="page-hero contact-hero">
                <div className="page-hero__bg">
                    <div className="glow glow-red page-hero__glow-1"></div>
                    <div className="glow glow-gold page-hero__glow-2"></div>
                </div>
                <div className="container page-hero__content">
                    <span className="section-label"><FaEnvelope /> Get in Touch</span>
                    <h1 className="page-hero__title">Contact <span className="text-gradient">SKF Karate</span></h1>
                    <p className="page-hero__subtitle">Have questions? We're here to help you begin your journey.</p>
                </div>
            </section>

            <section className="section contact-main">
                <div className="container contact-main__grid">
                    <div className="contact-info">
                        <h2 className="section-title">Request a <span className="text-gradient">Callback</span></h2>
                        <p className="section-subtitle">
                            Ready to start your Karate journey? Leave your details with us, and our team will reach out to you personally to answer any questions, discuss schedules, and help you get started.
                        </p>

                        <div className="contact-info__cards">
                            <div className="glass-card contact-info__card">
                                <div className="contact-info__icon"><FaPhoneAlt /></div>
                                <div><h4>Personal Consultation</h4><p>We'll call you directly to understand your goals and recommend the best program.</p></div>
                            </div>
                            <div className="glass-card contact-info__card">
                                <div className="contact-info__icon"><FaPaperPlane /></div>
                                <div><h4>Fast Response</h4><p>Our team is notified instantly, so you won't be kept waiting.</p></div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card contact-form-wrapper">
                        <h3>Schedule Your Call</h3>

                        {status === 'success' ? (
                            <div className="contact-form__success">
                                <FaCheckCircle className="contact-form__success-icon" />
                                <h4>Message Sent!</h4>
                                <p>Thank you for reaching out. Our team will get back to you shortly.</p>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setStatus('idle')}
                                >
                                    Send Another Message
                                </button>
                            </div>
                        ) : (
                            <form className="contact-form" onSubmit={handleSubmit}>                                <div className="form-row">
                                <div className="form-group">
                                    <label>Full Name *</label>
                                    <div className="form-input-wrapper">
                                        <FaUser className="form-icon" />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Your name"
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <div className="form-input-wrapper">
                                        <FaEnvelope className="form-icon" />
                                        <input
                                            type="email"
                                            name="email"
                                            ref={emailRef}
                                            value={formData.email}
                                            onChange={handleEmailChange}
                                            placeholder="your@gmail.com"
                                            className="form-input"
                                        />
                                    </div>
                                </div>
                            </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Phone *</label>
                                        <div className="form-input-wrapper">
                                            <FaPhoneAlt className="form-icon" />
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handlePhoneChange}
                                                placeholder="+91 XXXXX XXXXX"
                                                className="form-input"
                                                required
                                                maxLength={16}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Preferred Time (Optional)</label>
                                        <div className="form-input-wrapper">
                                            <FaClock className="form-icon" />
                                            <input
                                                type="text"
                                                name="preferredTime"
                                                value={formData.preferredTime}
                                                onChange={handleChange}
                                                placeholder="e.g. 5 PM, Any evening"
                                                className="form-input"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Interest</label>
                                    <div className="form-input-wrapper">
                                        <FaTag className="form-icon" />
                                        <select
                                            name="interest"
                                            value={formData.interest}
                                            onChange={handleChange}
                                            className="form-input"
                                        >
                                            <option>Summer Camp 2026</option>
                                            <option>Regular Classes</option>
                                            <option>Private Training</option>
                                            <option>General Inquiry</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Any specific questions? (Optional)</label>
                                    <div className="form-input-wrapper form-input-wrapper--textarea">
                                        <FaPen className="form-icon form-icon--textarea" />
                                        <textarea
                                            name="message"
                                            rows="4"
                                            value={formData.message}
                                            onChange={handleChange}
                                            placeholder="Let us know what you'd like to discuss on the call..."
                                            className="form-input"
                                        ></textarea>
                                    </div>
                                </div>

                                {status === 'error' && (
                                    <p className="contact-form__error">{errorMsg}</p>
                                )}

                                <button
                                    type="submit"
                                    className="btn btn-primary contact-form__submit"
                                    disabled={status === 'loading'}
                                >
                                    {status === 'loading' ? (
                                        <><FaSpinner className="spin" /> Requesting Call...</>
                                    ) : (
                                        <>Request Callback <FaArrowRight className="btn-icon-right" /></>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}
