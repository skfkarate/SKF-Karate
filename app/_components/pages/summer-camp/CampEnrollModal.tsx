'use client'

import { useState } from 'react'
import { FaTimes, FaSpinner, FaWhatsapp, FaArrowRight, FaShieldAlt } from 'react-icons/fa'

export default function CampEnrollModal({ isOpen, onClose, branch, tier, price }: { isOpen: boolean, onClose: () => void, branch: string, tier: string, price: number }) {
    const [form, setForm] = useState({
        skfId: '',
        studentName: '',
        parentName: '',
        phone: '',
        batch: '',
        medicalNotes: '',
        consent: false
    })

    const [status, setStatus] = useState('idle')
    const [isLookingUp, setIsLookingUp] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    if (!isOpen) return null

    const handleLookup = async (skfId: string) => {
        if (!skfId || skfId.length < 10) return
        setIsLookingUp(true)
        try {
            const res = await fetch(`/api/students/lookup?skfId=${skfId}`)
            const data = await res.json()
            if (data.success && data.student) {
                setForm(p => ({
                    ...p,
                    studentName: data.student.name || '',
                    parentName: data.student.parent || '',
                    phone: data.student.phone || ''
                }))
            }
        } catch (e) {
            console.error('Lookup failed', e)
        } finally {
            setIsLookingUp(false)
        }
    }

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target
        const val = type === 'checkbox' ? checked : value
        setForm(p => ({ ...p, [name]: val }))
        setErrorMsg('')
        
        if (name === 'skfId' && value.length >= 10) {
            handleLookup(value)
        }
    }

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script')
            script.src = 'https://checkout.razorpay.com/v1/checkout.js'
            script.onload = () => resolve(true)
            script.onerror = () => resolve(false)
            document.body.appendChild(script)
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!form.studentName || !form.parentName || !form.phone || !form.batch) {
            setErrorMsg('All fields marked with * are required.')
            return
        }
        if (!form.consent) {
            setErrorMsg('You must agree to the Privacy Policy to proceed.')
            return
        }

        setStatus('submitting')
        setErrorMsg('')

        try {
            const resEnrol = await fetch('/api/portal/camp/enrol', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ branch, tier })
            })
            const enrolData = await resEnrol.json()

            if (!resEnrol.ok || enrolData.error) {
                throw new Error(enrolData.error || 'Failed to initialize payment')
            }

            if (enrolData.amount === 0) {
                // Free transaction
                await proceedVerification(enrolData.orderId, 'FREE_PAYMENT', 'FREE_SIGNATURE')
                return
            }

            const rzpLoaded = await loadRazorpay()
            if (!rzpLoaded) throw new Error('Failed to load Razorpay SDK popup.')

            const options = {
                key: enrolData.key,
                amount: enrolData.amount * 100,
                currency: 'INR',
                name: 'SKF Karate',
                description: `Summer Camp 2026 - ${tier} (${branch})`,
                order_id: enrolData.orderId,
                handler: async function (response: any) {
                    await proceedVerification(
                        response.razorpay_order_id,
                        response.razorpay_payment_id,
                        response.razorpay_signature
                    )
                },
                prefill: {
                    name: form.parentName,
                    contact: form.phone
                },
                theme: { color: '#d62828' },
                modal: {
                    ondismiss: function () {
                        setStatus('idle')
                        setErrorMsg('Payment popup closed.')
                    }
                }
            }

            const rzp = new (window as any).Razorpay(options)
            rzp.on('payment.failed', function (resp: any) {
                setStatus('idle')
                setErrorMsg('Payment failed: ' + resp.error.description)
            })
            rzp.open()

        } catch (err: any) {
            setStatus('idle')
            setErrorMsg(err.message || 'An error occurred.')
        }
    }

    const proceedVerification = async (rzp_order_id: string, rzp_payment_id: string, rzp_signature: string) => {
        setStatus('verifying')
        try {
            const verifyRes = await fetch('/api/portal/camp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    razorpay_order_id: rzp_order_id,
                    razorpay_payment_id: rzp_payment_id,
                    razorpay_signature: rzp_signature,
                    studentName: form.studentName,
                    skfId: form.skfId,
                    branch,
                    tier,
                    amount: price
                })
            })
            const verifyData = await verifyRes.json()

            if (verifyRes.ok && verifyData.success) {
                setStatus('success')
            } else {
                throw new Error(verifyData.error || 'Payment verification failed.')
            }
        } catch (err: any) {
            setStatus('idle')
            setErrorMsg(err.message || 'Could not verify payment securely.')
        }
    }

    return (
        <div className="contact-popup-overlay open">
            <div className="contact-popup open" style={{ maxWidth: '600px', width: '95%' }}>
                <div className="contact-popup__accent"></div>
                
                {status !== 'success' && (
                    <button className="contact-popup__close" onClick={onClose} aria-label="Close" disabled={status !== 'idle'}>
                        <FaTimes />
                    </button>
                )}

                <div className="contact-popup__body">
                    {status === 'success' ? (
                        <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                            <div style={{ background: 'rgba(76, 175, 80, 0.1)', color: '#4caf50', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2.5rem' }}>
                                <FaShieldAlt />
                            </div>
                            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#fff' }}>You're Enrolled!</h2>
                            <p style={{ color: 'var(--text-light)', marginBottom: '2rem', fontSize: '1.05rem', lineHeight: '1.6' }}>
                                <strong>{form.studentName}</strong>'s spot at {branch} for {tier} is secured. A confirmation email and receipt has been sent to you.
                            </p>
                            
                            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1rem', marginBottom: '2rem' }}>
                                <p style={{ margin: 0, color: 'var(--gold)', fontWeight: 'bold' }}>Payment ID: {form.studentName.substring(0,3).toUpperCase()}{Date.now().toString().slice(-6)}</p>
                            </div>

                            <a href="https://wa.me/?text=I%20just%20enrolled%20for%20the%20SKF%20Karate%20Summer%20Camp!%20Join%20me%3A%20https%3A%2F%2Fskfkarate.org%2Fsummer-camp" 
                               target="_blank" rel="noopener noreferrer" 
                               className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', background: '#25D366' }}>
                                <FaWhatsapp style={{ fontSize: '1.2rem' }} /> Share on WhatsApp
                            </a>
                            <button onClick={onClose} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
                                Close
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="contact-popup__header">
                                <span className="contact-popup__label" style={{ color: 'var(--gold)', background: 'rgba(255,183,3,0.1)' }}>Secure Checkout</span>
                                <h3 className="contact-popup__title" style={{ fontSize: '1.8rem' }}>{tier} Enrollment</h3>
                                <p style={{ color: 'var(--text-light)', marginTop: '0.5rem' }}>{branch} • Total: <strong style={{ color: '#fff' }}>₹{price}</strong></p>
                            </div>

                            <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                                    
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>SKF ID (Optional for auto-fill)</label>
                                        <div style={{ position: 'relative' }}>
                                            <input 
                                                name="skfId" 
                                                value={form.skfId} 
                                                onChange={handleChange} 
                                                type="text" 
                                                className="input-field" 
                                                placeholder="e.g. SKF25MP001" 
                                                style={{ textTransform: 'uppercase' }}
                                                disabled={status !== 'idle'} 
                                            />
                                            {isLookingUp && <FaSpinner className="spin" style={{ position: 'absolute', right: '15px', top: '15px', color: 'var(--gold)' }} />}
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Student Name *</label>
                                        <input name="studentName" value={form.studentName} onChange={handleChange} type="text" className="input-field" required disabled={status !== 'idle'} />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Parent/Guardian Name *</label>
                                        <input name="parentName" value={form.parentName} onChange={handleChange} type="text" className="input-field" required disabled={status !== 'idle'} />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Phone Number *</label>
                                            <input name="phone" value={form.phone} onChange={handleChange} type="tel" className="input-field" required disabled={status !== 'idle'} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Batch Preference *</label>
                                            <select name="batch" value={form.batch} onChange={handleChange} className="input-field" required disabled={status !== 'idle'} style={{ appearance: 'none', backgroundColor: '#0e1524' }}>
                                                <option value="">Select Batch</option>
                                                <option value="Morning (7 AM - 9 AM)">Morning (7 AM - 9 AM)</option>
                                                <option value="Evening (5 PM - 7 PM)">Evening (5 PM - 7 PM)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Medical Notes / Allergies</label>
                                        <input name="medicalNotes" value={form.medicalNotes} onChange={handleChange} type="text" className="input-field" disabled={status !== 'idle'} placeholder="None" />
                                    </div>

                                </div>

                                <label style={{ display: 'flex', gap: '10px', marginTop: '1.5rem', alignItems: 'flex-start', cursor: 'pointer' }}>
                                    <input type="checkbox" name="consent" checked={form.consent} onChange={handleChange} style={{ marginTop: '4px', width: '18px', height: '18px', accentColor: 'var(--crimson)' }} disabled={status !== 'idle'} />
                                    <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.5' }}>
                                        I consent to the terms outlined in the <a href="/privacy-policy" target="_blank" style={{ color: 'var(--gold)', textDecoration: 'underline' }}>Privacy Policy</a> and acknowledge camp rules.
                                    </span>
                                </label>

                                {errorMsg && (
                                    <div style={{ background: 'rgba(214, 40, 40, 0.1)', border: '1px solid rgba(214, 40, 40, 0.3)', color: '#ff6b6b', padding: '1rem', borderRadius: '8px', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                                        {errorMsg}
                                    </div>
                                )}

                                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '2rem' }} disabled={status !== 'idle'}>
                                    {status === 'submitting' ? <><FaSpinner className="spin" /> Processing...</> : 
                                     status === 'verifying' ? <><FaSpinner className="spin" /> Verifying Payment...</> : 
                                     <>Pay ₹{price} & Enrol <FaArrowRight /></>}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
