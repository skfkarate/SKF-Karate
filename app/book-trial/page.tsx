'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FaArrowLeft, FaCheckCircle } from 'react-icons/fa'
import { getAllCities } from '@/lib/classesData'
import {
    queueTrialSubmission,
    readTrialQueue,
    sendTrialToAPI,
    persistTrialQueue
} from './trialSubmissionQueue'
import './book-trial.css'

const BRANCHES = getAllCities().flatMap(c =>
    c.branches.map(b => ({ value: b.slug, label: b.name, city: c.name, batch: b.classTime, address: b.address }))
)

// Add "Not Sure" option
const ALL_OPTIONS = [
    ...BRANCHES,
    { value: 'not-sure', label: 'Not Sure / Contact Me', city: 'Any', batch: 'To be discussed', address: '' }
]

type SubmitState = 'idle' | 'submitting' | 'success' | 'error'

export default function BookTrialPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const preselected = searchParams.get('branch') || ''

    const [studentName, setStudentName] = useState('')
    const [parentPhone, setParentPhone] = useState('')
    const [childAge, setChildAge] = useState('')
    const [branch, setBranch] = useState(preselected)
    const [hearAboutUs, setHearAboutUs] = useState('')
    const [submitState, setSubmitState] = useState<SubmitState>('idle')
    const [errorMsg, setErrorMsg] = useState('')

    // Queue flushing logic
    const flushQueue = useCallback(async () => {
        try {
            const queue = readTrialQueue()
            if (!queue.length) return

            const remaining = []
            for (const item of queue) {
                try {
                    const { queuedAt, ...payload } = item
                    await sendTrialToAPI(payload)
                } catch {
                    remaining.push(item)
                }
            }
            persistTrialQueue(remaining)
        } catch { /* silently fail */ }
    }, [])

    useEffect(() => {
        flushQueue()
    }, [flushQueue])

    // Auto-redirect back after success
    useEffect(() => {
        if (submitState === 'success') {
            const timer = setTimeout(() => {
                if (window.history.length > 1) {
                    router.back()
                } else {
                    router.push('/classes')
                }
            }, 1800)
            return () => clearTimeout(timer)
        }
    }, [submitState, router])

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        let raw = val.replace(/^(\+91\s*)/, '')
        const digits = raw.replace(/\D/g, '').slice(0, 10)

        let formatted = ''
        if (digits.length > 0) {
            formatted = '+91 ' + digits.slice(0, 5)
            if (digits.length > 5) {
                formatted += ' ' + digits.slice(5)
            }
        }
        setParentPhone(formatted)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitState('submitting')
        setErrorMsg('')

        const phone = parentPhone.replace(/\s/g, '')
        if (!/^\+91[0-9]{10}$/.test(phone)) {
            setSubmitState('error')
            setErrorMsg('Please enter a valid 10-digit mobile number.')
            return
        }

        const age = parseInt(childAge)
        if (isNaN(age) || age < 4 || age > 60) {
            setSubmitState('error')
            setErrorMsg('Please enter a valid age between 4 and 60.')
            return
        }

        const selectedBranch = ALL_OPTIONS.find(b => b.value === branch)
        const payload = {
            studentName: studentName.trim(),
            parentPhone: phone,
            childAge: age,
            branch,
            preferredBatch: selectedBranch?.batch || 'Default',
            hearAboutUs,
        }

        try {
            await sendTrialToAPI(payload)
            setSubmitState('success')
        } catch (err: any) {
            console.error('Submission error:', err)

            if (err.retryable !== false) {
                queueTrialSubmission(payload)
                setSubmitState('success') // Show success even if queued to maintain "100% success rate" UX
            } else {
                setSubmitState('error')
                setErrorMsg(err.message || 'Something went wrong. Please try again or call us directly.')
            }
        }
    }

    const selectedBranchData = ALL_OPTIONS.find(b => b.value === branch)

    return (
        <div className="bt-page">
            <div className="bt-page__kanji" aria-hidden="true">道</div>
            <div className="bt-page__orb bt-page__orb--1" />
            <div className="bt-page__orb bt-page__orb--2" />

            <div className="container bt-page__container">
                <button onClick={() => router.back()} className="bt-page__back">
                    <FaArrowLeft /> Back
                </button>

                <div className="bt-page__grid">
                    <div className="bt-page__hero">
                        <div className="bt-page__hero-inner">
                            <h1 className="bt-page__title">
                                Book Your<br />
                                <span className="bt-page__title--accent">Free Trial</span>
                            </h1>
                            <p className="bt-page__subtitle">
                                Take the first step in your karate journey. No experience needed — just show up in comfortable clothes and we'll handle the rest.
                            </p>

                            <div className="bt-page__features">
                                <div className="bt-page__feature"><FaCheckCircle className="bt-page__feature-icon" /> <span>SKF-certified instructors</span></div>
                                <div className="bt-page__feature"><FaCheckCircle className="bt-page__feature-icon" /> <span>All ages welcome (3.5+)</span></div>
                                <div className="bt-page__feature"><FaCheckCircle className="bt-page__feature-icon" /> <span>No gear required for trial</span></div>
                                <div className="bt-page__feature"><FaCheckCircle className="bt-page__feature-icon" /> <span>Absolutely zero commitment</span></div>
                            </div>

                            {selectedBranchData && (
                                <div className="bt-page__branch-preview">
                                    <div className="bt-page__branch-label">Selected Dojo</div>
                                    <div className="bt-page__branch-name">{selectedBranchData.label}</div>
                                    <div className="bt-page__branch-detail">{selectedBranchData.city} · {selectedBranchData.batch}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bt-page__form-wrap">
                        {submitState === 'success' ? (
                            <div className="bt-page__success">
                                <div className="bt-page__success-icon"><FaCheckCircle /></div>
                                <h2 className="bt-page__success-title">You're In!</h2>
                                <p className="bt-page__success-text">
                                    We've received your booking request. Our team will contact you soon to confirm your trial class schedule.
                                </p>
                                <p className="bt-page__success-redirect">Redirecting you back...</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="bt-form">
                                <h2 className="bt-form__heading">Enter Your Details</h2>

                                <div className="bt-form__group">
                                    <label className="bt-form__label" htmlFor="studentName">Student Name</label>
                                    <input id="studentName" className="bt-form__input" type="text" placeholder="Full name of the student" value={studentName} onChange={e => setStudentName(e.target.value)} required />
                                </div>

                                <div className="bt-form__group">
                                    <label className="bt-form__label" htmlFor="parentPhone">Parent / Guardian Phone</label>
                                    <input id="parentPhone" className="bt-form__input" type="tel" placeholder="+91 98765 43210" value={parentPhone} onChange={handlePhoneChange} required />
                                </div>

                                <div className="bt-form__row">
                                    <div className="bt-form__group">
                                        <label className="bt-form__label" htmlFor="childAge">Age</label>
                                        <input id="childAge" className="bt-form__input" type="number" min="4" max="60" placeholder="e.g. 8" value={childAge} onChange={e => setChildAge(e.target.value)} required />
                                    </div>

                                    <div className="bt-form__group">
                                        <label className="bt-form__label" htmlFor="branch">Preferred Branch</label>
                                        <select id="branch" className="bt-form__input bt-form__select" value={branch} onChange={e => setBranch(e.target.value)} required>
                                            <option value="">Select a branch</option>
                                            {ALL_OPTIONS.map(b => (
                                                <option key={b.value} value={b.value}>{b.label} — {b.city}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="bt-form__group">
                                    <label className="bt-form__label" htmlFor="hearAboutUs">How did you hear about us?</label>
                                    <select id="hearAboutUs" className="bt-form__input bt-form__select" value={hearAboutUs} onChange={e => setHearAboutUs(e.target.value)}>
                                        <option value="">Select (optional)</option>
                                        <option value="Google Search">Google Search</option>
                                        <option value="Instagram">Instagram</option>
                                        <option value="Facebook">Facebook</option>
                                        <option value="YouTube">YouTube</option>
                                        <option value="Friend / Referral">Friend / Referral</option>
                                        <option value="Walked by the Dojo">Walked by the Dojo</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                {submitState === 'error' && <div className="bt-form__error">{errorMsg}</div>}

                                <button type="submit" className="bt-form__submit" disabled={submitState === 'submitting'}>
                                    {submitState === 'submitting' ? <span className="bt-form__spinner" /> : 'Book My Free Trial'}
                                </button>

                                <p className="bt-form__note">By submitting, you agree to receive a confirmation call from our team.</p>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
