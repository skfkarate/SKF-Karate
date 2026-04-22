'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { FaEnvelope, FaArrowRight, FaChevronDown, FaMapMarkerAlt } from 'react-icons/fa'
import ContactFormCard from '@/app/_components/contact/ContactFormCard'
import ContactInfoPanel from '@/app/_components/contact/ContactInfoPanel'
import Link from 'next/link'
import {
  INITIAL_CONTACT_FORM_STATE,
  persistQueue,
  queueSubmission,
  readQueue,
  sendToAPI,
} from '@/app/_components/contact/contactSubmissionQueue'
import { getAllCities } from '@/lib/classesData'
import './contact.css'

const FAQS = [
    { q: "What age can my child start training?", a: "We accept students starting from age 5. Early training builds foundational motor skills, focus, and discipline." },
    { q: "Do I need any prior martial arts experience?", a: "Not at all. Our beginner batches are designed specifically for zero-experience individuals of all ages." },
    { q: "What are the training fees?", a: "Fees vary slightly by branch and program (group vs personal training). Please book a free trial and our Sensei will discuss the structure during your visit." },
    { q: "What gear do I need for the first class?", a: "Just comfortable athletic wear (track pants and a t-shirt). Once enrolled, you will need to purchase the official SKF Karate Gi." },
    { q: "Are the certificates valid globally?", a: "Yes. As a World Karate Federation (WKF) affiliated academy, our black belt grading and tournament certificates carry immense global recognition." },
]

export default function ContactPage() {
    const [formData, setFormData] = useState({ ...INITIAL_CONTACT_FORM_STATE })
    const [status, setStatus] = useState('idle')
    const [errorMsg, setErrorMsg] = useState('')
    const [openFaq, setOpenFaq] = useState<number | null>(null)
    const cities = getAllCities()

    const flushQueue = useCallback(async () => {
        try {
            const queue = readQueue()
            if (!queue.length) return

            const remaining = []
            for (const item of queue) {
                try {
                    const { queuedAt, ...payload } = item
                    await sendToAPI(payload)
                } catch {
                    remaining.push(item)
                }
            }
            persistQueue(remaining)
        } catch { /* silently fail */ }
    }, [])

    useEffect(() => {
        flushQueue()
    }, [flushQueue])

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const emailRef = useRef<HTMLInputElement>(null)
    const handleEmailChange = (e) => {
        const val = e.target.value
        const prev = formData.email

        if (val.endsWith('@') && !prev.includes('@')) {
            const filled = val + 'gmail.com'
            setFormData({ ...formData, email: filled })
            setTimeout(() => {
                if (emailRef.current) {
                    const pos = val.length
                    emailRef.current.setSelectionRange(pos, filled.length)
                }
            }, 0)
        } else {
            setFormData({ ...formData, email: val })
        }
    }

    const handlePhoneChange = (e) => {
        let raw = e.target.value
        raw = raw.replace(/^\+91\s*/, '')
        const digits = raw.replace(/\D/g, '').slice(0, 10)
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

        const phoneDigits = formData.phone.replace(/\D/g, '')
        const digitsOnly = phoneDigits.startsWith('91') ? phoneDigits.slice(2) : phoneDigits
        if (digitsOnly.length !== 10) {
            setStatus('error')
            setErrorMsg('Please enter a valid 10-digit mobile number.')
            return
        }

        const fullPhone = '+91' + digitsOnly
        const payload = { ...formData, phone: fullPhone }

        try {
            await sendToAPI(payload)
            setStatus('success')
            setFormData({ ...INITIAL_CONTACT_FORM_STATE })
        } catch (err: any) {
            console.error('Submission error:', err)
            
            if (err.retryable !== false) {
                queueSubmission(payload)
            }
            
            setStatus('error')
            setErrorMsg(err.message || 'Something went wrong. If the issue continues, please call us directly.')
        }
    }

    return (
        <div className="contact-page">
            {/* Ambient Background */}
            <div className="contact-orb contact-orb--1" />
            <div className="contact-orb contact-orb--2" />
            <div className="contact-watermark">連絡</div>

            {/* HERO */}
            <section className="contact-hero">
                <div className="contact-hero__badge">
                    <FaEnvelope /> Get in Touch
                </div>
                <h1 className="contact-hero__title">Contact Us</h1>
                <p className="contact-hero__sub">
                    Have questions? We're here to help you begin your journey. Request a callback or visit one of our branches.
                </p>
            </section>

            {/* MAIN CONTENT */}
            <div className="contact-grid">
                <ContactInfoPanel />
                <ContactFormCard
                    emailRef={emailRef}
                    errorMsg={errorMsg}
                    formData={formData}
                    onEmailChange={handleEmailChange}
                    onFieldChange={handleChange}
                    onPhoneChange={handlePhoneChange}
                    onReset={() => setStatus('idle')}
                    onSubmit={handleSubmit}
                    status={status}
                />
            </div>

            {/* EXTRA SECTION: LOCATIONS & FAQS */}
            <div className="contact-extra">
                {/* BRANCH DIRECTORY */}
                <div>
                    <h2 className="contact-extra-title">Our Branches</h2>
                    <div className="contact-location-list">
                        {cities.flatMap(c => c.branches).map((branch) => (
                            <div key={branch.slug} className="contact-location-card">
                                <FaMapMarkerAlt className="contact-location-icon" />
                                <div className="contact-location-content">
                                    <h4 className="contact-location-name">{branch.name}</h4>
                                    <p className="contact-location-address">{branch.address}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FAQ ACCORDION */}
                <div>
                    <h2 className="contact-extra-title">Common Questions</h2>
                    <div className="contact-faq-list">
                        {FAQS.map((faq, i) => (
                            <div key={i} className={`contact-faq-item ${openFaq === i ? 'contact-faq-item--open' : ''}`}>
                                <button 
                                    className="contact-faq-trigger"
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                >
                                    <span>{faq.q}</span>
                                    <FaChevronDown className="contact-faq-chevron" />
                                </button>
                                <div className="contact-faq-collapse" style={{ maxHeight: openFaq === i ? '500px' : '0' }}>
                                    <div className="contact-faq-answer">
                                        {faq.a}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <section className="contact-footer">
                <div className="contact-glass-pane contact-cta-box">
                    <h2 className="contact-cta-title">
                        Ready to <span className="contact-cta-accent">train?</span>
                    </h2>
                    <p className="contact-cta-text">
                        Don't wait for a callback. Book your free introductory class instantly.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                        <Link href="/book-trial" className="btn btn-primary">
                            Book Free Trial <FaArrowRight />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
