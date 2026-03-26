'use client'

import { useState } from 'react'
import Image from 'next/image'
import { FaWhatsapp, FaArrowRight, FaArrowLeft, FaExclamationTriangle, FaUserGraduate, FaShieldAlt, FaMapMarkerAlt, FaSpinner, FaStar, FaUserNinja, FaTrophy } from 'react-icons/fa'
import { GiBlackBelt } from 'react-icons/gi'


export const SKF_STUDENTS = {
    'SKF25MP001': { name: 'Neshu Ram', parent: 'Sharathbabu', phone: '9591779191', dob: '2018-11-09' },
    'SKF25MP002': { name: 'Ganvith Ishan', parent: 'Balaji', phone: '8123404357', dob: '2019-03-04' },
    'SKF25MP003': { name: 'Duvan Gowda', parent: 'Darshan B B', phone: '9886633051', dob: '2019-12-06' },
    'SKF25MP004': { name: 'Viharika S Gowda', parent: 'Siddaraju S', phone: '7019063688', dob: '2017-05-26' },
    'SKF25MP005': { name: 'Samisha K Gowda', parent: 'Kiran Kumar J', phone: '9611766327', dob: '2020-05-16' },
    'SKF25MP006': { name: 'Tharush H Gowda', parent: 'Samatha', phone: '7619373844', dob: '2020-10-08' },
    'SKF25MP007': { name: 'Purvank P', parent: 'Keerthana', phone: '8618404399', dob: '2021-03-29' }
};

const calculateAge = (dobString) => {
    const dob = new Date(dobString);
    const ageDt = new Date(Date.now() - dob.getTime());
    return Math.abs(ageDt.getUTCFullYear() - 1970);
};

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
        _gotcha: '',
    })

    const [status, setStatus] = useState('idle')
    const [errorMsg, setErrorMsg] = useState('')
    const [isTransitioning, setIsTransitioning] = useState(false)

    const effectiveTotalSteps = form.isCurrentStudent === 'yes' ? 4 : 5;

    // ───── HANDLERS ─────
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        const val = type === 'checkbox' ? checked : (name === 'skfId' ? value.toUpperCase() : value)

        setForm(prev => {
            const nextForm = { ...prev, [name]: val }

            // Auto fill logic
            if (name === 'skfId' && nextForm.isCurrentStudent === 'yes') {
                const sku = val.trim()
                if (SKF_STUDENTS[sku]) {
                    nextForm.studentName = SKF_STUDENTS[sku].name;
                    nextForm.parentName = SKF_STUDENTS[sku].parent;
                    nextForm.parentContact = SKF_STUDENTS[sku].phone;
                    nextForm.age = calculateAge(SKF_STUDENTS[sku].dob).toString();
                    nextForm.agreeToKit = true; // Auto agree since it's free for them
                } else {
                    if (prev.skfId && SKF_STUDENTS[prev.skfId]) {
                        nextForm.studentName = '';
                        nextForm.parentName = '';
                        nextForm.parentContact = '';
                        nextForm.age = '';
                    }
                }
            }
            return nextForm;
        })

        // Clear errors when they type
        if (errorMsg) setErrorMsg('')
    }

    // Validation for stepping forward
    const validateStep = () => {
        if (step === 1) {
            if (!form.isCurrentStudent) {
                return "Please tell us if you are a current SKF Karate student."
            }
            if (form.isCurrentStudent === 'yes') {
                if (!form.skfId.trim() || !SKF_STUDENTS[form.skfId.trim()]) {
                    return "Please enter a valid SKF ID to fetch your details and proceed."
                }
            }
            if (form.isCurrentStudent === 'no' && !form.agreeToKit) {
                return "Please check the box below to reserve your child's Achievement Kit and proceed."
            }
        }
        if (step === 2) {
            if (!form.studentName.trim() || !form.age) return "Please enter the student's name and age."
            if (form.age < 3 || form.age > 25) return "Age must be between 3 and 25."
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

                        <div className="wizard-field" style={{ marginBottom: '2rem' }}>
                            <label>Are you currently an enrolled student at SKF Karate?</label>
                            <div className="wizard-radio-group">
                                <label className={`wizard-radio-pill ${form.isCurrentStudent === 'yes' ? 'wizard-radio-pill--active' : ''}`}>
                                    <input type="radio" name="isCurrentStudent" value="yes" checked={form.isCurrentStudent === 'yes'} onChange={(e) => setForm({ ...form, isCurrentStudent: e.target.value })} />
                                    Yes, I am
                                </label>
                                <label className={`wizard-radio-pill ${form.isCurrentStudent === 'no' ? 'wizard-radio-pill--active' : ''}`}>
                                    <input type="radio" name="isCurrentStudent" value="no" checked={form.isCurrentStudent === 'no'} onChange={(e) => setForm({ ...form, isCurrentStudent: e.target.value })} />
                                    No, I am new
                                </label>
                            </div>
                        </div>

                        {form.isCurrentStudent === 'yes' && (
                            <div className="wizard-field" style={{ animation: 'fadeIn 0.4s ease' }}>
                                <label htmlFor="skfId">Enter your SKF ID</label>
                                <input
                                    id="skfId"
                                    name="skfId"
                                    type="text"
                                    className="wizard-input"
                                    placeholder="e.g. SKF25MP001"
                                    value={form.skfId}
                                    onChange={handleChange}
                                    style={{ textTransform: 'uppercase' }}
                                />

                                {form.skfId && SKF_STUDENTS[form.skfId] ? (
                                    <div style={{ marginTop: '1.5rem', background: 'rgba(76, 175, 80, 0.1)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(76, 175, 80, 0.3)', animation: 'fadeIn 0.5s ease' }}>
                                        <p style={{ color: '#4caf50', margin: 0, fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
                                            <FaUserGraduate /> Student Found: {SKF_STUDENTS[form.skfId].name}
                                        </p>
                                        <p style={{ color: 'var(--text-white)', fontSize: '0.95rem', marginTop: '0.75rem', marginBottom: 0, lineHeight: '1.5' }}>
                                            Your profile has been auto-filled! As an active SKF Karate student, your <strong>Summer Camp Training &amp; Achievement Kit</strong> are rewarded <strong style={{ color: '#4caf50' }}>100% FREE</strong> for your dedication! Please proceed to cross-check your details.
                                        </p>
                                    </div>
                                ) : form.skfId.length >= 10 ? (
                                    <p style={{ color: '#f44336', fontSize: '0.9rem', marginTop: '0.75rem' }}>Student not found. Please double-check your SKF ID.</p>
                                ) : null}
                            </div>
                        )}

                        {form.isCurrentStudent === 'no' && (
                            <div style={{ animation: 'fadeIn 0.4s ease' }}>
                                <div className="wizard-field">
                                    <label>Training Fee</label>
                                    <div className="wizard-input" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', color: 'var(--text-white)' }}>
                                        <span style={{ fontWeight: '500' }}>Complete Month-Long Camp Training</span>
                                        <span style={{ fontSize: '1.15rem', color: '#4caf50', fontWeight: 'bold' }}>₹0 (FREE)</span>
                                    </div>
                                </div>

                                <div className="wizard-field">
                                    <label>The Achievement Kit</label>
                                    <div style={{ padding: '0.5rem 0 1rem 0', color: 'var(--text-light)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                        <p style={{ marginBottom: '0.75rem' }}>
                                            We believe every athlete deserves to be celebrated! While the month-long training is entirely free, we secure your child&apos;s spot by reserving an exclusive <strong style={{ color: 'var(--gold)' }}>Achievement Kit</strong> in advance. This kit honors their hard work and includes:
                                        </p>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '0.5rem' }}>
                                                <FaStar className="text-gold" style={{ marginTop: '4px', flexShrink: 0 }} />
                                                <span><strong>Official Completion Certificate</strong> — Professionally designed, signed &amp; stamped to frame their success!</span>
                                            </li>
                                            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                                <FaStar className="text-gold" style={{ marginTop: '4px', flexShrink: 0 }} />
                                                <span><strong>A Special Surprise Gift</strong> — A beautiful physical token they will carry with pride long after the camp ends.</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="wizard-input" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(212,175,55,0.08)', borderColor: 'rgba(212,175,55,0.3)', color: 'var(--text-white)' }}>
                                        <span style={{ fontWeight: '500' }}>Achievement Kit</span>
                                        <span style={{ fontSize: '1.15rem', color: 'var(--gold)', fontWeight: 'bold' }}>₹300</span>
                                    </div>
                                </div>

                                <div className="wizard-field" style={{ marginTop: '2rem' }}>
                                    <label className="wizard-checkbox" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', background: 'rgba(20, 20, 22, 0.5)', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.2)' }}>
                                        <input
                                            type="checkbox"
                                            name="agreeToKit"
                                            checked={form.agreeToKit}
                                            onChange={handleChange}
                                            style={{ width: '22px', height: '22px', marginTop: '2px', accentColor: 'var(--gold)', cursor: 'pointer', flexShrink: 0 }}
                                        />
                                        <span style={{ fontSize: '0.95rem', color: 'var(--text-white)', lineHeight: '1.5' }}>
                                            Yes! I want to reserve the <strong style={{ color: 'var(--gold)' }}>Achievement Kit (₹300)</strong> to celebrate my child&apos;s progress. (I understand the entire month training itself remains completely free).
                                        </span>
                                    </label>
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

            case 3:
                return (
                    <div className="wizard-stage">
                        <h2 className="wizard-stage__title">
                            <FaShieldAlt className="wizard-stage__icon" /> Step 3: Guardian Info
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

            case 4:
                return (
                    <div className="wizard-stage">
                        {form.isCurrentStudent === 'yes' ? (
                            <>
                                <h2 className="wizard-stage__title">
                                    <FaUserGraduate className="wizard-stage__icon" /> Step 4: School Info
                                </h2>

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
                                        autoFocus
                                    />
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
                            </>
                        ) : (
                            <>
                                <h2 className="wizard-stage__title">
                                    <FaMapMarkerAlt className="wizard-stage__icon" /> Step 4: Location
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
