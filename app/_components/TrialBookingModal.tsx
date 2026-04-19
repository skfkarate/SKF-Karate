'use client'

import { useState, useEffect, useRef, FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { FaTimes, FaWhatsapp, FaArrowRight } from 'react-icons/fa'
import { useTrialModal } from './TrialModalContext'

/* ── Branch options ── */
const BRANCHES = [
    { value: 'koramangala', label: 'Koramangala HQ — Bangalore', batch: 'Tue/Wed/Fri 5:30–7:00 PM' },
    { value: 'whitefield', label: 'Whitefield — Bangalore', batch: 'Tue/Wed/Fri 4:30–6:00 PM' },
    { value: 'pondicherry', label: 'Pondicherry', batch: 'Tue/Wed/Fri 5:00–6:30 PM' },
    { value: 'tumkur', label: 'Tumkur', batch: 'Tue/Wed/Fri 5:00–6:30 PM' },
    { value: 'udupi', label: 'Udupi', batch: 'Tue/Wed/Fri 5:00–6:30 PM' },
] as const

type SubmitState = 'idle' | 'submitting' | 'success' | 'error'

export default function TrialBookingModal() {
    const { isOpen, closeModal, preselectedBranch } = useTrialModal()
    const [mounted, setMounted] = useState(false)
    const [shouldRender, setShouldRender] = useState(false)
    const [submitState, setSubmitState] = useState<SubmitState>('idle')
    const [errorMsg, setErrorMsg] = useState('')
    const formRef = useRef<HTMLFormElement>(null)

    // Form fields
    const [studentName, setStudentName] = useState('')
    const [parentPhone, setParentPhone] = useState('')
    const [childAge, setChildAge] = useState('')
    const [branch, setBranch] = useState('')
    const [hearAboutUs, setHearAboutUs] = useState('')

    useEffect(() => { setMounted(true) }, [])

    // Set preselected branch when modal opens
    useEffect(() => {
        if (preselectedBranch) {
            setBranch(preselectedBranch)
        }
    }, [preselectedBranch])

    // Handle open/close animation
    useEffect(() => {
        if (isOpen) {
            setShouldRender(true)
            document.body.style.overflow = 'hidden'
        } else {
            const timer = setTimeout(() => setShouldRender(false), 350)
            document.body.style.overflow = ''
            return () => clearTimeout(timer)
        }
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    // Escape key to close
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal() }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [closeModal])

    const resetForm = () => {
        setStudentName('')
        setParentPhone('')
        setChildAge('')
        setBranch('')
        setHearAboutUs('')
        setSubmitState('idle')
        setErrorMsg('')
    }

    const handleClose = () => {
        closeModal()
        // Reset after animation
        setTimeout(resetForm, 400)
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setSubmitState('submitting')
        setErrorMsg('')

        // Basic client validation
        const phone = parentPhone.replace(/\s/g, '')
        if (!/^\+91[0-9]{10}$/.test(phone)) {
            setSubmitState('error')
            setErrorMsg('Please enter a valid phone number with +91 prefix (e.g., +91 9876543210)')
            return
        }

        const age = parseInt(childAge)
        if (isNaN(age) || age < 5 || age > 60) {
            setSubmitState('error')
            setErrorMsg('Please enter a valid age between 5 and 60')
            return
        }

        try {
            const selectedBranch = BRANCHES.find(b => b.value === branch)

            const res = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentName: studentName.trim(),
                    parentPhone: phone,
                    childAge: age,
                    branch: branch,
                    preferredBatch: selectedBranch?.batch || 'Default',
                    hearAboutUs: hearAboutUs,
                }),
            })

            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data.error || 'Something went wrong')
            }

            setSubmitState('success')
        } catch (err: any) {
            setSubmitState('error')
            setErrorMsg(err.message || 'Failed to submit. Please try again or WhatsApp us.')
        }
    }

    if (!mounted || !shouldRender) return null

    const selectedBranch = BRANCHES.find(b => b.value === branch)

    return createPortal(
        <div className={`trial-modal-overlay ${isOpen ? 'trial-modal-overlay--open' : 'trial-modal-overlay--closing'}`} onClick={handleClose}>
            <div className="trial-modal" onClick={(e) => e.stopPropagation()}>
                {/* Top accent bar */}
                <div className="trial-modal__accent" />

                {/* Close button */}
                <button className="trial-modal__close" onClick={handleClose} aria-label="Close">
                    <FaTimes />
                </button>

                {submitState === 'success' ? (
                    /* ── Success state ── */
                    <div className="trial-modal__success">
                        <div className="trial-modal__success-icon">✓</div>
                        <h3 className="trial-modal__success-title">You're In!</h3>
                        <p className="trial-modal__success-text">
                            We'll call you within 24 hours to confirm your free trial class
                            {selectedBranch ? ` at ${selectedBranch.label}` : ''}.
                        </p>
                        <p className="trial-modal__success-note">
                            Can't wait? WhatsApp us for instant confirmation.
                        </p>
                        <div className="trial-modal__success-actions">
                            <a
                                href={`https://wa.me/919019971726?text=Hi! I just booked a free trial for ${studentName}. Please confirm.`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary trial-modal__wa-btn"
                            >
                                <FaWhatsapp /> WhatsApp Us
                            </a>
                            <button className="btn btn-secondary" onClick={handleClose}>Done</button>
                        </div>
                    </div>
                ) : (
                    /* ── Form state ── */
                    <div className="trial-modal__body">
                        <div className="trial-modal__header">
                            <span className="trial-modal__label">Free Trial Class</span>
                            <h3 className="trial-modal__title">Book Your Free Class</h3>
                            <p className="trial-modal__subtitle">No commitment. Just show up and train.</p>
                        </div>

                        <form ref={formRef} onSubmit={handleSubmit} className="trial-modal__form">
                            <div className="trial-modal__field">
                                <label htmlFor="trial-name">Student Name</label>
                                <input
                                    id="trial-name"
                                    type="text"
                                    className="input-field"
                                    placeholder="Enter student's name"
                                    value={studentName}
                                    onChange={(e) => setStudentName(e.target.value)}
                                    required
                                    minLength={2}
                                    maxLength={100}
                                    autoComplete="name"
                                />
                            </div>

                            <div className="trial-modal__row">
                                <div className="trial-modal__field">
                                    <label htmlFor="trial-phone">Parent's Phone</label>
                                    <input
                                        id="trial-phone"
                                        type="tel"
                                        className="input-field"
                                        placeholder="+91 98765 43210"
                                        value={parentPhone}
                                        onChange={(e) => setParentPhone(e.target.value)}
                                        required
                                        autoComplete="tel"
                                    />
                                </div>
                                <div className="trial-modal__field trial-modal__field--small">
                                    <label htmlFor="trial-age">Age</label>
                                    <input
                                        id="trial-age"
                                        type="number"
                                        className="input-field"
                                        placeholder="Age"
                                        min={5}
                                        max={60}
                                        value={childAge}
                                        onChange={(e) => setChildAge(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="trial-modal__field">
                                <label htmlFor="trial-branch">Preferred Branch</label>
                                <select
                                    id="trial-branch"
                                    className="input-field"
                                    value={branch}
                                    onChange={(e) => setBranch(e.target.value)}
                                    required
                                >
                                    <option value="">Select a branch</option>
                                    {BRANCHES.map((b) => (
                                        <option key={b.value} value={b.value}>{b.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Show batch info when branch selected */}
                            {selectedBranch && (
                                <div className="trial-modal__batch-info">
                                    📅 Classes: {selectedBranch.batch}
                                </div>
                            )}

                            <div className="trial-modal__field">
                                <label htmlFor="trial-source">How did you hear about us? <span className="trial-modal__optional">(optional)</span></label>
                                <select
                                    id="trial-source"
                                    className="input-field"
                                    value={hearAboutUs}
                                    onChange={(e) => setHearAboutUs(e.target.value)}
                                >
                                    <option value="">Select</option>
                                    <option value="google">Google Search</option>
                                    <option value="instagram">Instagram</option>
                                    <option value="facebook">Facebook</option>
                                    <option value="friend">Friend / Word of Mouth</option>
                                    <option value="school">School</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            {submitState === 'error' && (
                                <div className="trial-modal__error">
                                    {errorMsg}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn btn-primary trial-modal__submit"
                                disabled={submitState === 'submitting'}
                            >
                                {submitState === 'submitting' ? (
                                    <span className="trial-modal__spinner" />
                                ) : (
                                    <>Book Free Trial <FaArrowRight /></>
                                )}
                            </button>

                            <p className="trial-modal__disclaimer">
                                Or call us: <a href="tel:+919019971726">+91 90199 71726</a>
                            </p>
                        </form>
                    </div>
                )}
            </div>
        </div>,
        document.body
    )
}
