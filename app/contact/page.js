'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { FaEnvelope } from 'react-icons/fa'
import ContactFormCard from '@/app/_components/contact/ContactFormCard'
import ContactInfoPanel from '@/app/_components/contact/ContactInfoPanel'
import {
  INITIAL_CONTACT_FORM_STATE,
  persistQueue,
  queueSubmission,
  readQueue,
  sendToAPI,
} from '@/app/_components/contact/contactSubmissionQueue'
import './contact.css'

export default function ContactPage() {
    const [formData, setFormData] = useState({ ...INITIAL_CONTACT_FORM_STATE })
    const [status, setStatus] = useState('idle') // idle | loading | success
    const [errorMsg, setErrorMsg] = useState('')

    // On mount: try to flush any queued submissions from localStorage
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

    // Email: auto-suggest gmail.com when user types @
    const emailRef = useRef(null)
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

    // Phone: strip everything except digits, cap at 10, format with +91
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

        // Client-side phone validation — must have exactly 10 digits
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
            // Single API call — server handles all retries internally
            await sendToAPI(payload)
            setStatus('success')
            setFormData({ ...INITIAL_CONTACT_FORM_STATE })
        } catch (err) {
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
            </section>
        </div>
    )
}
