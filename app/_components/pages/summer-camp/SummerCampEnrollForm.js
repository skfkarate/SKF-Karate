'use client'

import { useState } from 'react'
import { FaWhatsapp, FaArrowRight, FaArrowLeft, FaExclamationTriangle, FaUserGraduate, FaShieldAlt, FaMapMarkerAlt } from 'react-icons/fa'
import { GiBlackBelt } from 'react-icons/gi'


export default function SummerCampEnrollForm() {
    // ───── STATE ─────
    const [step, setStep] = useState(1)
    const totalSteps = 4
    
    const [form, setForm] = useState({
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
        _gotcha: '',
    })

    const [status, setStatus] = useState('idle')
    const [errorMsg, setErrorMsg] = useState('')
    const [isTransitioning, setIsTransitioning] = useState(false)

    // ───── HANDLERS ─────
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }))
        // Clear errors when they type
        if (errorMsg) setErrorMsg('')
    }

    // Validation for stepping forward
    const validateStep = () => {
        if (step === 1) {
            if (!form.studentName.trim() || !form.age) return "Please enter the student's name and age."
            if (form.age < 3 || form.age > 25) return "Age must be between 3 and 25."
        }
        if (step === 2) {
            if (!form.parentName.trim()) return "Please enter the parent/guardian's name."
            if (!form.parentContact.match(/^[6-9]\d{9}$/)) return "Please enter a valid 10-digit mobile number."
            if (!form.sameAsEmergency && !form.emergencyContact.match(/^[6-9]\d{9}$/)) return "Please enter a valid emergency contact number."
        }
        if (step === 3) {
            if (!form.area.trim() || !form.school.trim()) return "Please provide your area and school name."
        }
        if (step === 4) {
            if (!form.experience || !form.schoolHasKarate) return "Please answer both questions to complete your profile."
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
        setStep(prev => Math.min(prev + 1, totalSteps))
        setTimeout(() => setIsTransitioning(false), 400)
    }

    const handleBack = () => {
        setErrorMsg('')
        setStep(prev => Math.max(prev - 1, 1))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (step !== totalSteps) {
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
                    <div className="wizard-stage">
                        <h2 className="wizard-stage__title">
                            <FaUserGraduate className="wizard-stage__icon" /> Step 1: The Student
                        </h2>
                        
                        <div className="wizard-field">
                            <label htmlFor="studentName">Student's Full Name</label>
                            <input
                                id="studentName"
                                name="studentName"
                                type="text"
                                className="wizard-input"
                                placeholder="e.g. Rahul Sharma"
                                value={form.studentName}
                                onChange={handleChange}
                                autoFocus
                            />
                        </div>

                        <div className="wizard-field">
                            <label htmlFor="age">Age</label>
                            <input
                                id="age"
                                name="age"
                                type="number"
                                className="wizard-input"
                                min="3"
                                max="25"
                                placeholder="e.g. 8"
                                value={form.age}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                )
            
            case 2:
                return (
                    <div className="wizard-stage">
                        <h2 className="wizard-stage__title">
                            <FaShieldAlt className="wizard-stage__icon" /> Step 2: Guardian Info
                        </h2>

                        <div className="wizard-field">
                            <label htmlFor="parentName">Parent/Guardian Name</label>
                            <input
                                id="parentName"
                                name="parentName"
                                type="text"
                                className="wizard-input"
                                placeholder="Enter parent's name"
                                value={form.parentName}
                                onChange={handleChange}
                                autoFocus
                            />
                        </div>

                        <div className="wizard-field">
                            <label htmlFor="parentContact">Parent Contact Number</label>
                            <input
                                id="parentContact"
                                name="parentContact"
                                type="tel"
                                className="wizard-input"
                                pattern="[6-9][0-9]{9}"
                                maxLength={10}
                                placeholder="10-digit mobile number"
                                value={form.parentContact}
                                onChange={handleChange}
                                autoFocus
                            />
                        </div>

                        <div className="wizard-field">
                            <label>Emergency Contact</label>
                            <div className="wizard-radio-group">
                                <label className={`wizard-radio-pill ${form.sameAsEmergency ? 'wizard-radio-pill--active' : ''}`}>
                                    <input type="radio" name="sameAsEmergency" checked={form.sameAsEmergency} onChange={() => setForm(p => ({ ...p, sameAsEmergency: true }))} />
                                    Same as Parent
                                </label>
                                <label className={`wizard-radio-pill ${!form.sameAsEmergency ? 'wizard-radio-pill--active' : ''}`}>
                                    <input type="radio" name="sameAsEmergency" checked={!form.sameAsEmergency} onChange={() => setForm(p => ({ ...p, sameAsEmergency: false }))} />
                                    Different Number
                                </label>
                            </div>

                            {!form.sameAsEmergency && (
                                <div style={{ marginTop: '1rem' }}>
                                    <input
                                        name="emergencyContact"
                                        type="tel"
                                        className="wizard-input"
                                        pattern="[6-9][0-9]{9}"
                                        maxLength={10}
                                        placeholder="Emergency mobile number"
                                        value={form.emergencyContact}
                                        onChange={handleChange}
                                        autoFocus
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )

            case 3:
                return (
                    <div className="wizard-stage">
                        <h2 className="wizard-stage__title">
                            <FaMapMarkerAlt className="wizard-stage__icon" /> Step 3: Location
                        </h2>

                        <div className="wizard-field">
                            <label htmlFor="area">Area / Locality</label>
                            <input
                                id="area"
                                name="area"
                                type="text"
                                className="wizard-input"
                                placeholder="e.g. Mallathahalli"
                                value={form.area}
                                onChange={handleChange}
                                autoFocus
                            />
                        </div>

                        <div className="wizard-field">
                            <label htmlFor="school">Current School Name</label>
                            <input
                                id="school"
                                name="school"
                                type="text"
                                className="wizard-input"
                                placeholder="Enter school name"
                                value={form.school}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                )

            case 4:
                return (
                    <div className="wizard-stage">
                        <h2 className="wizard-stage__title">
                            <GiBlackBelt className="wizard-stage__icon" /> Step 4: Karate Profile
                        </h2>

                        <div className="wizard-field">
                            <label>Prior Karate Experience?</label>
                            <div className="wizard-radio-group">
                                <label className={`wizard-radio-pill ${form.experience === 'beginner' ? 'wizard-radio-pill--active' : ''}`}>
                                    <input type="radio" name="experience" value="beginner" checked={form.experience === 'beginner'} onChange={handleChange} />
                                    Total Beginner
                                </label>
                                <label className={`wizard-radio-pill ${form.experience === 'experienced' ? 'wizard-radio-pill--active' : ''}`}>
                                    <input type="radio" name="experience" value="experienced" checked={form.experience === 'experienced'} onChange={handleChange} />
                                    Trained Before
                                </label>
                            </div>
                        </div>

                        <div className="wizard-field">
                            <label>Does your school offer Karate classes?</label>
                            <div className="wizard-radio-group" style={{ gap: '0.5rem' }}>
                                <label className={`wizard-radio-pill ${form.schoolHasKarate === 'yes' ? 'wizard-radio-pill--active' : ''}`}>
                                    <input type="radio" name="schoolHasKarate" value="yes" checked={form.schoolHasKarate === 'yes'} onChange={handleChange} />
                                    Yes
                                </label>
                                <label className={`wizard-radio-pill ${form.schoolHasKarate === 'no' ? 'wizard-radio-pill--active' : ''}`}>
                                    <input type="radio" name="schoolHasKarate" value="no" checked={form.schoolHasKarate === 'no'} onChange={handleChange} />
                                    No
                                </label>
                                <label className={`wizard-radio-pill ${form.schoolHasKarate === 'not_sure' ? 'wizard-radio-pill--active' : ''}`}>
                                    <input type="radio" name="schoolHasKarate" value="not_sure" checked={form.schoolHasKarate === 'not_sure'} onChange={handleChange} />
                                    Not Sure
                                </label>
                            </div>
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
            <div className="wizard-card wizard-success">
                <GiBlackBelt className="wizard-success-icon" />
                <h2>Seat Secured.</h2>
                <p>
                    <strong>{form.studentName}</strong> has been granted VIP admission to the Free Karate Summer Camp. We will text you at <strong>{form.parentContact}</strong>.
                </p>

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
    const progressPercent = ((step - 1) / totalSteps) * 100

    return (
        <div className="wizard-card">
            {/* Progress Bar */}
            <div className="wizard-progress">
                <div 
                    className="wizard-progress__fill" 
                    style={{ width: `${progressPercent === 0 ? 5 : progressPercent}%` }}
                ></div>
            </div>
            {step < 4 ? (
                <div className="wizard-progress__text">{25 * (step - 1)}% Completed</div>
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

                    {step < totalSteps ? (
                        <button type="button" onClick={handleNext} className="wizard-btn-next" disabled={isTransitioning}>
                            Continue <FaArrowRight />
                        </button>
                    ) : (
                        <button type="submit" className="wizard-btn-next wizard-btn-next--submit" disabled={status === 'submitting' || isTransitioning}>
                            {status === 'submitting' ? (
                                <span className="wizard-spinner"></span>
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
