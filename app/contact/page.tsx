'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { FaEnvelope, FaChevronDown, FaMapMarkerAlt } from 'react-icons/fa'
import ContactFormCard from '@/app/_components/contact/ContactFormCard'
import ContactInfoPanel from '@/app/_components/contact/ContactInfoPanel'
import PrefetchLink from '@/components/navigation/PrefetchLink'
import {
  INITIAL_CONTACT_FORM_STATE,
  persistQueue,
  queueSubmission,
  readQueue,
  sendToAPI,
} from '@/app/_components/contact/contactSubmissionQueue'
import './contact.css'

const FAQS = [
    { q: "What age can my child start training?", a: "We accept students starting from age 5. Early training builds foundational motor skills, focus, and discipline." },
    { q: "Do I need any prior martial arts experience?", a: "Not at all. Our beginner batches are designed specifically for zero-experience individuals of all ages." },
    { q: "What are the training fees?", a: "Fees vary slightly by branch and program (group vs personal training). Please book a free trial and our Sensei will discuss the structure during your visit." },
    { q: "What gear do I need for the first class?", a: "Just comfortable athletic wear (track pants and a t-shirt). Once enrolled, you will need to purchase the official SKF Karate Gi." },
    { q: "Are the certificates valid globally?", a: "Yes. As a World Karate Federation (WKF) affiliated academy, our black belt grading and tournament certificates carry immense global recognition." },
]

type ContactStatus = 'idle' | 'loading' | 'success' | 'error'
type RetryableContactError = Error & {
    retryable?: boolean
}

export default function ContactPage() {
    const [formData, setFormData] = useState({ ...INITIAL_CONTACT_FORM_STATE })
    const [status, setStatus] = useState<ContactStatus>('idle')
    const [errorMsg, setErrorMsg] = useState('')
    const [openFaq, setOpenFaq] = useState<number | null>(null)
    const formCardRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (status === 'success' && formCardRef.current) {
            formCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
    }, [status])

    const flushQueue = useCallback(async () => {
        try {
            const queue = readQueue()
            if (!queue.length) return

            const remaining = []
            for (const item of queue) {
                try {
                    await sendToAPI({
                        name: item.name,
                        email: item.email,
                        phone: item.phone,
                        preferredTime: item.preferredTime,
                        interest: item.interest,
                        message: item.message,
                        website: item.website,
                    })
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const emailRef = useRef<HTMLInputElement>(null)
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const handleSubmit = async (e: React.FormEvent) => {
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
        } catch (err) {
            const error = err as RetryableContactError
            if (error.retryable !== false) {
                queueSubmission(payload)
            }
            
            setStatus('error')
            setErrorMsg(error.message || 'Something went wrong. If the issue continues, please call us directly.')
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
                <h1 className="contact-hero__title">Contact <span className="contact-hero__accent">Us</span></h1>
                <p className="contact-hero__sub">
                    Have questions? We&apos;re here to help you begin your journey. Request a callback or visit one of our branches.
                </p>
            </section>

            {/* MAIN CONTENT */}
            <div className="contact-grid">
                <div ref={formCardRef}>
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
                <ContactInfoPanel />
            </div>

            {/* EXTRA SECTION: LOCATIONS & FAQS */}
            <div className="contact-extra">
                {/* BRANCH DIRECTORY */}
                <div>
                    <h2 className="contact-extra-title">Find a Dojo</h2>
                    <div className="contact-location-card" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
                            <FaMapMarkerAlt className="contact-location-icon" style={{ fontSize: '1.5rem', marginTop: '0' }} />
                            <div>
                                <h4 className="contact-location-name" style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Multiple Branches Across Karnataka</h4>
                                <p className="contact-location-address" style={{ fontSize: '1rem' }}>
                                    View all our official training locations, timetables, and specific dojo details on our dedicated Classes page.
                                </p>
                            </div>
                        </div>
                        <PrefetchLink href="/classes" className="contact-cta-btn" style={{ width: '100%', justifyContent: 'center' }}>
                            <span>View All Branches</span>
                            <span className="contact-cta-btn-icon">→</span>
                        </PrefetchLink>
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
        </div>
    )
}
