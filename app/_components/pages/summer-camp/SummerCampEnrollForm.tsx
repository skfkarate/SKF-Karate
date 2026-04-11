'use client'

import { useState } from 'react'
import Image from 'next/image'
import { FaWhatsapp, FaArrowRight, FaArrowLeft, FaExclamationTriangle, FaUserGraduate, FaShieldAlt, FaMapMarkerAlt, FaSpinner, FaStar, FaUserNinja, FaTrophy } from 'react-icons/fa'
import { GiBlackBelt } from 'react-icons/gi'


 

export default function SummerCampEnrollForm() {
    // ───── STATE ─────
    const [step, setStep] = useState(1)
    const totalSteps = 5

    const [form, setForm] = useState({
        isCurrentStudent: '',
        skfId: '',
        agreeToKit: false,
        studentName: '',
        age: '',
        parentName: '',
        parentContact: '',
        sameAsEmergency: true,
        emergencyContact: '',
        area: '',
        school: '',
        experience: '',
        schoolHasKarate: '',
        agreeToTerms: false,
        _gotcha: '',
    })

    const [status, setStatus] = useState('idle')
    const [errorMsg, setErrorMsg] = useState('')
    const [isTransitioning, setIsTransitioning] = useState(false)

    const effectiveTotalSteps = form.isCurrentStudent === 'yes' ? 4 : 5;

    const [isLookingUp, setIsLookingUp] = useState(false)
    const [lookupSuccess, setLookupSuccess] = useState(false)

    // ───── HANDLERS ─────
    const handleChange = async (e) => {
        const { name, value, type, checked } = e.target
        const val = type === 'checkbox' ? checked : (name === 'skfId' ? value.toUpperCase() : value)

        setForm(prev => ({ ...prev, [name]: val }))

        // Clear errors when they type
        if (errorMsg) setErrorMsg('')

        // Auto fill logic
        if (name === 'skfId' && form.isCurrentStudent === 'yes') {
            const sku = val.trim()
            if (sku.length >= 10) {
                setIsLookingUp(true)
                setLookupSuccess(false)
                try {
                    const res = await fetch(`/api/students/lookup?skfId=${sku}`)
                    const data = await res.json()
                    
                    if (data.success && data.student) {
                        setForm(prev => ({
                            ...prev,
                            studentName: data.student.name || '',
                            parentName: data.student.parent || '',
                            parentContact: data.student.phone || '',
                            agreeToKit: true, // Auto agree since it's free for them
                        }))
                        setLookupSuccess(true)
                    } else {
                        setForm(prev => ({
                            ...prev,
                            studentName: '',
                            parentName: '',
                            parentContact: '',
                        }))
                    }
                } catch (err) {
                    console.error('Lookup failed', err)
                } finally {
                    setIsLookingUp(false)
                }
            } else {
                setLookupSuccess(false)
            }
        }
    }

    // Validation for stepping forward
    const validateStep = () => {
        if (step === 1) {
            if (!form.isCurrentStudent) {
                return "Please tell us if you are a current SKF Karate student."
            }
            if (form.isCurrentStudent === 'yes') {
                if (!form.skfId.trim() || !lookupSuccess) {
                    return "Please enter a valid SKF ID and wait for details to be fetched."
                }
            }
        }
        if (step === 2) {
            if (!form.studentName.trim() || !form.age) return "Please enter the student's name and age."
            const age = Number(form.age)
            if (age < 3 || age > 25) return "Age must be between 3 and 25."
        }
        if (step === 3) {
            if (!form.parentName.trim()) return "Please enter the parent/guardian's name."
            if (!form.parentContact.match(/^[6-9]\d{9}$/)) return "Please enter a valid 10-digit mobile number."
            if (!form.sameAsEmergency && !form.emergencyContact.match(/^[6-9]\d{9}$/)) return "Please enter a valid emergency contact number."
        }
        if (step === 4) {
            if (form.isCurrentStudent === 'yes') {
                if (!form.school.trim() || !form.schoolHasKarate) return "Please provide your school name and indicate if it offers Karate classes."
            } else {
                if (!form.area.trim() || !form.school.trim()) return "Please provide your area and school name."
            }
        }
        if (step === 5) {
            if (!form.experience || !form.schoolHasKarate) return "Please answer both questions to complete your profile."
            if (!form.agreeToTerms) return "Please accept the Privacy Policy and Terms of Service."
        }
        return null // Valid
    }

    const handleNext = () => {
        const err = validateStep()
        if (err) {
            setErrorMsg(err)
            return
        }

        setErrorMsg('')
        setIsTransitioning(true)
        setStep(prev => Math.min(prev + 1, effectiveTotalSteps))
        setTimeout(() => setIsTransitioning(false), 400)
    }

    const handleBack = () => {
        setErrorMsg('')
        setStep(prev => Math.max(prev - 1, 1))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (step !== effectiveTotalSteps) {
            handleNext()
            return
        }

        // Final validation
        const err = validateStep()
        if (err) {
            setErrorMsg(err)
            return
        }

        setStatus('submitting')
        setErrorMsg('')

        try {
            const res = await fetch('/api/summer-camp/enroll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })

            const data = await res.json()

            if (res.ok && data.success) {
                setStatus('success')
            } else {
                setErrorMsg(data.error || 'Registration failed. Please try again.')
                setStatus('error')
            }
        } catch {
            setErrorMsg('Network error. Please check your connection.')
            setStatus('error')
        }
    }

    // ───── RENDER STEPS ─────
    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="wizard-stage" style={{ animation: 'fadeIn 0.4s ease' }}>
                        <h2 className="wizard-stage__title">
                            <FaStar className="wizard-stage__icon" style={{ color: 'var(--gold)' }} /> Step 1: Pre-Registration
                        </h2>

                        <div className="wizard-field" style={{ marginBottom: '2rem' }} role="radiogroup" aria-labelledby="enrolled-label">
                            <span id="enrolled-label" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Are you currently an enrolled student at SKF Karate?</span>
                            <div className="wizard-radio-group">
                                <label htmlFor="field-isCurrentStudent-yes" className={`wizard-radio-pill ${form.isCurrentStudent === 'yes' ? 'wizard-radio-pill--active' : ''}`}>
                                    <input id="field-isCurrentStudent-yes" type="radio" name="isCurrentStudent" value="yes" checked={form.isCurrentStudent === 'yes'} onChange={(e) => setForm({ ...form, isCurrentStudent: e.target.value })} />
                                    Yes, I am
                                </label>
                                <label htmlFor="field-isCurrentStudent-no" className={`wizard-radio-pill ${form.isCurrentStudent === 'no' ? 'wizard-radio-pill--active' : ''}`}>
                                    <input id="field-isCurrentStudent-no" type="radio" name="isCurrentStudent" value="no" checked={form.isCurrentStudent === 'no'} onChange={(e) => setForm({ ...form, isCurrentStudent: e.target.value })} />
                                    No, I am new
                                </label>
                            </div>
                        </div>

                        {form.isCurrentStudent === 'yes' && (
                            <div className="wizard-field" style={{ animation: 'fadeIn 0.4s ease' }}>
                                <label htmlFor="field-skfId">Enter your SKF ID</label>
                                <input
                                    id="field-skfId"
                                    name="skfId"
                                    type="text"
                                    className="input-field"
                                    placeholder="e.g. SKF25MP001"
                                    value={form.skfId}
                                    onChange={handleChange}
                                    style={{ textTransform: 'uppercase' }}
                                />

                                {isLookingUp ? (
                                    <div style={{ marginTop: '1.5rem', color: 'var(--gold)', animation: 'fadeIn 0.5s ease' }}>
                                        <FaSpinner className="spin" /> Searching records...
                                    </div>
                                ) : lookupSuccess ? (
                                    <div style={{ marginTop: '1.5rem', background: 'rgba(76, 175, 80, 0.1)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(76, 175, 80, 0.3)', animation: 'fadeIn 0.5s ease' }}>
                                        <p style={{ color: '#4caf50', margin: 0, fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
                                            <FaUserGraduate /> Student Found: {form.studentName}
                                        </p>
                                        <p style={{ color: 'var(--text-white)', fontSize: '0.95rem', marginTop: '0.75rem', marginBottom: 0, lineHeight: '1.5' }}>
                                            Your profile has been mapped! As an active SKF Karate student, your <strong>Summer Camp Training &amp; Achievement Kit</strong> are rewarded <strong style={{ color: '#4caf50' }}>100% FREE</strong> for your dedication! Please proceed to cross-check your details and enter your age manually.
                                        </p>
                                    </div>
                                ) : form.skfId.length >= 10 ? (
                                    <p style={{ color: '#f44336', fontSize: '0.9rem', marginTop: '0.75rem' }}>Student not found. Please double-check your SKF ID.</p>
                                ) : null}
                            </div>
                        )}

                        {form.isCurrentStudent === 'no' && (
                            <div style={{ animation: 'fadeIn 0.4s ease' }}>
                                <div className="wizard-field" style={{ marginBottom: '1.5rem' }}>
                                    <label>Training Fee</label>
                                    <div className="input-field" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', color: 'var(--text-white)', gap: '12px', flexWrap: 'wrap' }}>
                                        <span style={{ fontWeight: '500', flex: '1 1 auto' }}>1-Month Camp Training</span>
                                        <span style={{ fontSize: '1.15rem', color: '#4caf50', fontWeight: 'bold', whiteSpace: 'nowrap' }}>₹0 (100% FREE)</span>
                                    </div>
                                    <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', marginTop: '0.75rem', lineHeight: '1.5' }}>
                                        Your child&apos;s entire month of training is absolutely free! Let&apos;s gather a few details to quickly confirm their spot.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )

            case 2:
                return (
                    <div className="wizard-stage">
                        <h2 className="wizard-stage__title">
                            <FaUserGraduate className="wizard-stage__icon" /> Step 2: The Student
                        </h2>

                        <div className="wizard-field">
                            <label htmlFor="field-studentName">Student's Full Name</label>
                            <input
                                id="field-studentName"
                                name="studentName"
                                type="text"
                                className="input-field"
                                placeholder="e.g. Rahul Sharma"
                                value={form.studentName}
                                onChange={handleChange}
                                autoFocus
                            />
                        </div>

                        <div className="wizard-field">
                            <label htmlFor="field-age">Age</label>
                            <input
                                id="field-age"
                                name="age"
                                type="number"
                                className="input-field"
                                min="3"
                                max="25"
                                placeholder="e.g. 8"
                                value={form.age}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                )

            case 3:
                return (
                    <div className="wizard-stage">
                        <h2 className="wizard-stage__title">
                            <FaShieldAlt className="wizard-stage__icon" /> Step 3: Guardian Info
                        </h2>

                        <div className="wizard-field">
                            <label htmlFor="field-parentName">Parent/Guardian Name</label>
                            <input
                                id="field-parentName"
                                name="parentName"
                                type="text"
                                className="input-field"
                                placeholder="Enter parent's name"
                                value={form.parentName}
                                onChange={handleChange}
                                autoFocus
                            />
                        </div>

                        <div className="wizard-field">
                            <label htmlFor="field-parentContact">Parent Contact Number</label>
                            <input
                                id="field-parentContact"
                                name="parentContact"
                                type="tel"
                                className="input-field"
                                pattern="[6-9][0-9]{9}"
                                maxLength={10}
                                placeholder="10-digit mobile number"
                                value={form.parentContact}
                                onChange={handleChange}
                                autoFocus
                            />
                        </div>

                        <div className="wizard-field" role="radiogroup" aria-labelledby="emergency-label">
                            <span id="emergency-label" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Emergency Contact</span>
                            <div className="wizard-radio-group">
                                <label htmlFor="field-sameAsEmergency-true" className={`wizard-radio-pill ${form.sameAsEmergency ? 'wizard-radio-pill--active' : ''}`}>
                                    <input id="field-sameAsEmergency-true" type="radio" name="sameAsEmergency" checked={form.sameAsEmergency} onChange={() => setForm(p => ({ ...p, sameAsEmergency: true }))} />
                                    Same as Parent
                                </label>
                                <label htmlFor="field-sameAsEmergency-false" className={`wizard-radio-pill ${!form.sameAsEmergency ? 'wizard-radio-pill--active' : ''}`}>
                                    <input id="field-sameAsEmergency-false" type="radio" name="sameAsEmergency" checked={!form.sameAsEmergency} onChange={() => setForm(p => ({ ...p, sameAsEmergency: false }))} />
                                    Different Number
                                </label>
                            </div>

                            {!form.sameAsEmergency && (
                                <div style={{ marginTop: '1rem' }}>
                                    <input
                                        id="field-emergencyContact"
                                        name="emergencyContact"
                                        type="tel"
                                        className="input-field"
                                        pattern="[6-9][0-9]{9}"
                                        maxLength={10}
                                        placeholder="Emergency mobile number"
                                        value={form.emergencyContact}
                                        onChange={handleChange}
                                        autoFocus
                                        aria-label="Emergency Contact Number"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )

            case 4:
                return (
                    <div className="wizard-stage">
                        {form.isCurrentStudent === 'yes' ? (
                            <>
                                <h2 className="wizard-stage__title">
                                    <FaUserGraduate className="wizard-stage__icon" /> Step 4: School Info
                                </h2>

                                <div className="wizard-field">
                                    <label htmlFor="field-school-current">Current School Name</label>
                                    <input
                                        id="field-school-current"
                                        name="school"
                                        type="text"
                                        className="input-field"
                                        placeholder="Enter school name"
                                        value={form.school}
                                        onChange={handleChange}
                                        autoFocus
                                    />
                                </div>

                                <div className="wizard-field" role="radiogroup" aria-labelledby="school-karate-label">
                                    <span id="school-karate-label" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Does your school offer Karate classes?</span>
                                    <div className="wizard-radio-group" style={{ gap: '0.5rem' }}>
                                        <label htmlFor="field-schoolHasKarate-yes" className={`wizard-radio-pill ${form.schoolHasKarate === 'yes' ? 'wizard-radio-pill--active' : ''}`}>
                                            <input id="field-schoolHasKarate-yes" type="radio" name="schoolHasKarate" value="yes" checked={form.schoolHasKarate === 'yes'} onChange={handleChange} />
                                            Yes
                                        </label>
                                        <label htmlFor="field-schoolHasKarate-no" className={`wizard-radio-pill ${form.schoolHasKarate === 'no' ? 'wizard-radio-pill--active' : ''}`}>
                                            <input id="field-schoolHasKarate-no" type="radio" name="schoolHasKarate" value="no" checked={form.schoolHasKarate === 'no'} onChange={handleChange} />
                                            No
                                        </label>
                                        <label htmlFor="field-schoolHasKarate-ns" className={`wizard-radio-pill ${form.schoolHasKarate === 'not_sure' ? 'wizard-radio-pill--active' : ''}`}>
                                            <input id="field-schoolHasKarate-ns" type="radio" name="schoolHasKarate" value="not_sure" checked={form.schoolHasKarate === 'not_sure'} onChange={handleChange} />
                                            Not Sure
                                        </label>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 className="wizard-stage__title">
                                    <FaMapMarkerAlt className="wizard-stage__icon" /> Step 4: Location
                                </h2>

                                <div className="wizard-field">
                                    <label htmlFor="field-area">Area / Locality</label>
                                    <input
                                        id="field-area"
                                        name="area"
                                        type="text"
                                        className="input-field"
                                        placeholder="e.g. Mallathahalli"
                                        value={form.area}
                                        onChange={handleChange}
                                        autoFocus
                                    />
                                </div>

                                <div className="wizard-field">
                                    <label htmlFor="field-school">Current School Name</label>
                                    <input
                                        id="field-school"
                                        name="school"
                                        type="text"
                                        className="input-field"
                                        placeholder="Enter school name"
                                        value={form.school}
                                        onChange={handleChange}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                )

            case 5:
                return (
                    <div className="wizard-stage">
                        <h2 className="wizard-stage__title">
                            <GiBlackBelt className="wizard-stage__icon" /> Step 5: Karate Profile
                        </h2>

                        <div className="wizard-field" role="radiogroup" aria-labelledby="exp-label">
                            <span id="exp-label" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Prior Karate Experience?</span>
                            <div className="wizard-radio-group">
                                <label htmlFor="field-experience-beg" className={`wizard-radio-pill ${form.experience === 'beginner' ? 'wizard-radio-pill--active' : ''}`}>
                                    <input id="field-experience-beg" type="radio" name="experience" value="beginner" checked={form.experience === 'beginner'} onChange={handleChange} />
                                    Total Beginner
                                </label>
                                <label htmlFor="field-experience-exp" className={`wizard-radio-pill ${form.experience === 'experienced' ? 'wizard-radio-pill--active' : ''}`}>
                                    <input id="field-experience-exp" type="radio" name="experience" value="experienced" checked={form.experience === 'experienced'} onChange={handleChange} />
                                    Trained Before
                                </label>
                            </div>
                        </div>

                        <div className="wizard-field" role="radiogroup" aria-labelledby="school-karate2-label">
                            <span id="school-karate2-label" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Does your school offer Karate classes?</span>
                            <div className="wizard-radio-group" style={{ gap: '0.5rem' }}>
                                <label htmlFor="field-schoolHasKarate2-yes" className={`wizard-radio-pill ${form.schoolHasKarate === 'yes' ? 'wizard-radio-pill--active' : ''}`}>
                                    <input id="field-schoolHasKarate2-yes" type="radio" name="schoolHasKarate" value="yes" checked={form.schoolHasKarate === 'yes'} onChange={handleChange} />
                                    Yes
                                </label>
                                <label htmlFor="field-schoolHasKarate2-no" className={`wizard-radio-pill ${form.schoolHasKarate === 'no' ? 'wizard-radio-pill--active' : ''}`}>
                                    <input id="field-schoolHasKarate2-no" type="radio" name="schoolHasKarate" value="no" checked={form.schoolHasKarate === 'no'} onChange={handleChange} />
                                    No
                                </label>
                                <label htmlFor="field-schoolHasKarate2-ns" className={`wizard-radio-pill ${form.schoolHasKarate === 'not_sure' ? 'wizard-radio-pill--active' : ''}`}>
                                    <input id="field-schoolHasKarate2-ns" type="radio" name="schoolHasKarate" value="not_sure" checked={form.schoolHasKarate === 'not_sure'} onChange={handleChange} />
                                    Not Sure
                                </label>
                            </div>
                        </div>

                        <div className="wizard-field" style={{ marginTop: '2.5rem' }}>
                            <span style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Optional: The Achievement Kit</span>
                            <div style={{ padding: '0.5rem 0 1rem 0', color: 'var(--text-light)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                <p style={{ marginBottom: '0.75rem' }}>
                                    The month-long training is entirely free! However, if you'd like an official certification of completion to celebrate their camp journey, you can optionally reserve an <strong style={{ color: 'var(--gold)' }}>Achievement Kit</strong> now.
                                </p>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '0.5rem' }}>
                                        <FaStar className="text-gold" style={{ marginTop: '4px', flexShrink: 0 }} />
                                        <span><strong>Official Completion Certificate</strong> — Professionally designed, signed &amp; stamped to frame their success!</span>
                                    </li>
                                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                        <FaStar className="text-gold" style={{ marginTop: '4px', flexShrink: 0 }} />
                                        <span><strong>A Special Surprise Gift</strong> — A beautiful physical token they will carry with pride.</span>
                                    </li>
                                </ul>
                            </div>
                            
                            <label htmlFor="field-agreeToKit" className="wizard-checkbox" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', background: 'rgba(212, 175, 55, 0.08)', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.3)' }}>
                                <input
                                    id="field-agreeToKit"
                                    type="checkbox"
                                    name="agreeToKit"
                                    checked={form.agreeToKit}
                                    onChange={handleChange}
                                    style={{ width: '22px', height: '22px', marginTop: '2px', accentColor: 'var(--gold)', cursor: 'pointer', flexShrink: 0 }}
                                />
                                <span style={{ fontSize: '0.95rem', color: 'var(--text-white)', lineHeight: '1.5' }}>
                                    Yes, I would like to optionally reserve the <strong style={{ color: 'var(--gold)' }}>Achievement Kit (₹300)</strong>.
                                </span>
                            </label>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.75rem', textAlign: 'center' }}>
                                Note: Payment will be collected in-person or via a separate link later. No payment is required right now.
                            </p>
                        </div>
                        
                        <div className="wizard-field" style={{ marginTop: '2.5rem' }}>
                            <label htmlFor="field-agreeToTerms" className="wizard-checkbox" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <input
                                    id="field-agreeToTerms"
                                    type="checkbox"
                                    name="agreeToTerms"
                                    checked={form.agreeToTerms}
                                    onChange={handleChange}
                                    style={{ width: '22px', height: '22px', marginTop: '2px', accentColor: 'var(--accent-crimson)', cursor: 'pointer', flexShrink: 0 }}
                                />
                                <span style={{ fontSize: '0.95rem', color: 'var(--text-white)', lineHeight: '1.5' }}>
                                    I accept the <a href="/privacy-policy" target="_blank" className="text-gold" style={{textDecoration: 'underline'}}>Privacy Policy</a> and <a href="/terms-of-service" target="_blank" className="text-gold" style={{textDecoration: 'underline'}}>Terms of Service</a> (required to submit).
                                </span>
                            </label>
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    // ───── SUCCESS SCREEN ─────
    if (status === 'success') {
        return (
            <div className="wizard-card wizard-success" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Image src="/logo/SKF logo.png" alt="SKF Logo" width={80} height={80} style={{ marginBottom: '1.5rem', objectFit: 'contain' }} />

                {form.isCurrentStudent === 'yes' ? (
                    <>
                        <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            Welcome Back, Champion! 🥋
                        </h2>
                        <p style={{ fontSize: '1.05rem', lineHeight: '1.6', color: 'var(--text-light)', maxWidth: '400px', marginBottom: '1rem' }}>
                            We’re excited to have <strong>{form.studentName}</strong> back with SKF. Your child’s complimentary VIP access to the Summer Camp is confirmed, and their exclusive Achievement Kit is reserved.
                        </p>
                        <p style={{ fontSize: '1.05rem', color: '#4caf50', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                            Thank you for your continued trust in SKF Karate. ❤️
                        </p>
                        <p style={{ fontSize: '1.15rem', color: 'var(--gold)', fontWeight: 'bold', marginTop: '1rem' }}>
                            Let’s goooo. 💪
                        </p>
                    </>
                ) : (
                    <>
                        <h2>Welcome to the SKF family!</h2>
                        <p>
                            <strong>{form.studentName}</strong> has been granted VIP admission to the Free Karate Summer Camp. We will text you at <strong>{form.parentContact}</strong>.
                        </p>
                    </>
                )}

                <a
                    href="https://chat.whatsapp.com/KauZyp4wrgeK3ygse44mJj?mode=gi_t"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="wizard-wa-btn"
                >
                    <FaWhatsapp style={{ fontSize: '1.2rem' }} /> Enter WhatsApp Group
                </a>
            </div>
        )
    }

    // ───── MAIN WIZARD RENDER ─────
    const progressPercent = ((step - 1) / effectiveTotalSteps) * 100

    return (
        <div className="wizard-card">
            {/* Progress Bar */}
            <div className="wizard-progress">
                <div
                    className="wizard-progress__fill"
                    style={{ width: `${progressPercent === 0 ? 5 : progressPercent}%` }}
                ></div>
            </div>
            {step < effectiveTotalSteps ? (
                <div className="wizard-progress__text">{Math.round((step - 1) / effectiveTotalSteps * 100)}% Completed</div>
            ) : (
                <div className="wizard-progress__text" style={{ color: '#4caf50' }}>Final Step</div>
            )}

            <form onSubmit={handleSubmit} autoComplete="off" style={{ marginTop: '2rem' }}>
                {/* Honeypot */}
                <input
                    type="text"
                    name="_gotcha"
                    value={form._gotcha}
                    onChange={handleChange}
                    style={{ display: 'none' }}
                    tabIndex={-1}
                    autoComplete="off"
                />

                {/* Dynamic Content */}
                {renderStepContent()}

                {/* Error */}
                {errorMsg && (
                    <div className="wizard-error">
                        <FaExclamationTriangle /> {errorMsg}
                    </div>
                )}

                {/* Controls */}
                <div className="wizard-controls">
                    {step > 1 ? (
                        <button type="button" onClick={handleBack} className="wizard-btn-back" disabled={status === 'submitting' || isTransitioning}>
                            <FaArrowLeft /> Back
                        </button>
                    ) : (
                        <div></div> // Empty spacer so Next stays right-aligned
                    )}

                    {step < effectiveTotalSteps ? (
                        <button type="button" onClick={handleNext} className="wizard-btn-next" disabled={isTransitioning}>
                            Continue <FaArrowRight />
                        </button>
                    ) : (
                        <button type="submit" className="wizard-btn-next wizard-btn-next--submit" disabled={status === 'submitting' || isTransitioning}>
                            {status === 'submitting' ? (
                                <><FaSpinner className="spin" style={{ marginRight: '8px' }} /> Submitting...</>
                            ) : (
                                <>Submit Application <FaArrowRight /></>
                            )}
                        </button>
                    )}
                </div>
            </form>
        </div>
    )
}
