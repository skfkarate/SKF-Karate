'use client'

import { useState } from 'react'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createStudentSchema } from '@/lib/validators'
import * as z from 'zod'
import Link from 'next/link'
import { FaCopy, FaCheck } from 'react-icons/fa'

type CreateStudentInput = z.input<typeof createStudentSchema>
type FormValues = z.output<typeof createStudentSchema>

export default function NewStudentPage() {
    const [submitting, setSubmitting] = useState(false)
    const [createdSkfId, setCreatedSkfId] = useState<string | null>(null)
    const [copySuccess, setCopySuccess] = useState(false)
    const [apiError, setApiError] = useState('')

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<CreateStudentInput, unknown, FormValues>({
        resolver: zodResolver(createStudentSchema),
        defaultValues: {
            photoConsent: false,
            enrolledDate: new Date().toISOString().split('T')[0],
            branch: 'koramangala',
            belt: 'white'
        }
    })

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        setSubmitting(true)
        setApiError('')
        try {
            const res = await fetch('/api/admin/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            const result = await res.json()
            if (res.ok && result.success) {
                setCreatedSkfId(result.skfId)
            } else {
                setApiError(JSON.stringify(result.error) || 'Failed to create student.')
            }
        } catch (error: any) {
            setApiError(error.message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleCopy = () => {
        const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://skfkarate.org'}/portal`
        const msg = `Welcome to SKF Karate! Your child's SKF ID is ${createdSkfId}.\nTo access the student portal, visit ${portalUrl}\nand set up your PIN using this ID.`
        navigator.clipboard.writeText(msg)
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 3000)
    }

    return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#fff', padding: '3rem 2rem', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                
                <header style={{ marginBottom: '2rem' }}>
                    <Link href="/admin/students" style={{ color: '#666', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block' }}>← Back to Directory</Link>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 400, margin: 0 }}>Register Student</h1>
                </header>

                {createdSkfId ? (
                    <div style={{ background: '#111', padding: '3rem', borderRadius: '12px', border: '1px solid #333', textAlign: 'center' }}>
                        <h2 style={{ color: '#4caf50', marginBottom: '1rem' }}>Success!</h2>
                        <p style={{ color: '#ccc', marginBottom: '2rem' }}>Student created. SKF ID auto-generated:</p>
                        
                        <div style={{ background: '#222', padding: '1rem', borderRadius: '8px', display: 'inline-block', fontSize: '2rem', fontWeight: 'bold', letterSpacing: '0.1em', marginBottom: '3rem', color: 'var(--gold, #ffb703)' }}>
                            {createdSkfId}
                        </div>

                        <div style={{ background: '#0a0a0a', border: '1px solid #333', padding: '1.5rem', borderRadius: '8px', textAlign: 'left', marginBottom: '2rem' }}>
                            <p style={{ margin: 0, color: '#aaa', fontSize: '0.9rem', marginBottom: '0.5rem' }}>WhatsApp Template:</p>
                            <p style={{ color: '#fff', lineHeight: 1.5, margin: 0 }}>
                                Welcome to SKF Karate! Your child's SKF ID is <strong>{createdSkfId}</strong>.<br/>
                                To access the student portal, visit {process.env.NEXT_PUBLIC_APP_URL || 'https://skfkarate.org'}/portal<br/>
                                and set up your PIN using this ID.
                            </p>
                        </div>

                        <button onClick={handleCopy} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#333', color: '#fff', border: 'none', padding: '0.8rem 2rem', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' }}>
                            {copySuccess ? <><FaCheck style={{ color: '#4caf50' }} /> Copied to Clipboard</> : <><FaCopy /> Copy Message</>}
                        </button>
                        
                        <div style={{ marginTop: '2rem' }}>
                            <button onClick={() => { setCreatedSkfId(null); window.location.reload() }} style={{ background: 'transparent', color: '#666', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>Register Another</button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} style={{ background: '#111', padding: '2.5rem', borderRadius: '12px', border: '1px solid #222' }}>
                        
                        {apiError && (
                            <div style={{ background: 'rgba(214, 40, 40, 0.1)', color: '#ff6b6b', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid rgba(214, 40, 40, 0.3)' }}>
                                {apiError}
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            
                            {/* Full Name */}
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Full Name *</label>
                                <input type="text" {...register('name')} placeholder="e.g. Rahul Sharma" style={{ width: '100%', padding: '0.8rem', background: '#000', border: errors.name ? '1px solid #ff4444' : '1px solid #333', color: '#fff', borderRadius: '6px' }} />
                                {errors.name && <span style={{ color: '#ff4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.name.message}</span>}
                            </div>

                            {/* DOB */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Date of Birth *</label>
                                <input type="date" {...register('dob')} style={{ width: '100%', padding: '0.8rem', background: '#000', border: errors.dob ? '1px solid #ff4444' : '1px solid #333', color: '#fff', borderRadius: '6px' }} />
                                {errors.dob && <span style={{ color: '#ff4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.dob.message}</span>}
                            </div>

                            {/* Enrolled Date */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Enrolled Date *</label>
                                <input type="date" {...register('enrolledDate')} style={{ width: '100%', padding: '0.8rem', background: '#000', border: errors.enrolledDate ? '1px solid #ff4444' : '1px solid #333', color: '#fff', borderRadius: '6px' }} />
                                {errors.enrolledDate && <span style={{ color: '#ff4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.enrolledDate.message}</span>}
                            </div>

                            {/* Branch */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Branch *</label>
                                <select {...register('branch')} style={{ width: '100%', padding: '0.8rem', background: '#000', border: errors.branch ? '1px solid #ff4444' : '1px solid #333', color: '#fff', borderRadius: '6px' }}>
                                    <option value="mp-sports-club">M P Sports Club</option>
                                    <option value="herohalli">Herohalli</option>
                                    <option value="kunigal-main">Kunigal</option>
                                    <option value="tumkur-main">Tumkur</option>
                                    <option value="udupi-main">Udupi</option>
                                </select>
                                {errors.branch && <span style={{ color: '#ff4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.branch.message}</span>}
                            </div>

                            {/* Batch */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Batch *</label>
                                <input type="text" {...register('batch')} placeholder="e.g. MWF 5PM" style={{ width: '100%', padding: '0.8rem', background: '#000', border: errors.batch ? '1px solid #ff4444' : '1px solid #333', color: '#fff', borderRadius: '6px' }} />
                                {errors.batch && <span style={{ color: '#ff4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.batch.message}</span>}
                            </div>

                            {/* Belt Level */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Belt Level *</label>
                                <select {...register('belt')} style={{ width: '100%', padding: '0.8rem', background: '#000', border: errors.belt ? '1px solid #ff4444' : '1px solid #333', color: '#fff', borderRadius: '6px', textTransform: 'capitalize' }}>
                                    {['white', 'yellow', 'orange', 'green', 'blue', 'brown', 'black'].map(b => (
                                        <option key={b} value={b}>{b}</option>
                                    ))}
                                </select>
                                {errors.belt && <span style={{ color: '#ff4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.belt.message}</span>}
                            </div>

                            {/* Monthly Fee */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Monthly Fee (₹) *</label>
                                <input type="number" {...register('monthlyFee')} placeholder="1500" style={{ width: '100%', padding: '0.8rem', background: '#000', border: errors.monthlyFee ? '1px solid #ff4444' : '1px solid #333', color: '#fff', borderRadius: '6px' }} />
                                {errors.monthlyFee && <span style={{ color: '#ff4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.monthlyFee.message}</span>}
                            </div>

                            {/* Parent Name */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Parent Name *</label>
                                <input type="text" {...register('parentName')} placeholder="e.g. Ramesh Sharma" style={{ width: '100%', padding: '0.8rem', background: '#000', border: errors.parentName ? '1px solid #ff4444' : '1px solid #333', color: '#fff', borderRadius: '6px' }} />
                                {errors.parentName && <span style={{ color: '#ff4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.parentName.message}</span>}
                            </div>

                            {/* Phone */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Phone (+91...) *</label>
                                <input type="text" {...register('phone')} placeholder="+919876543210" style={{ width: '100%', padding: '0.8rem', background: '#000', border: errors.phone ? '1px solid #ff4444' : '1px solid #333', color: '#fff', borderRadius: '6px' }} />
                                {errors.phone && <span style={{ color: '#ff4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.phone.message}</span>}
                            </div>

                            {/* Photo Consent */}
                            <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#aaa', fontSize: '0.9rem', cursor: 'pointer' }}>
                                    <input type="checkbox" {...register('photoConsent')} style={{ width: '18px', height: '18px', accentColor: 'var(--gold, #ffb703)' }} />
                                    Parent grants photo/video consent for social media
                                </label>
                            </div>

                        </div>

                        <div style={{ marginTop: '3rem', borderTop: '1px solid #333', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="submit" disabled={submitting} style={{ background: '#fff', color: '#000', border: 'none', padding: '0.8rem 2.5rem', borderRadius: '4px', fontWeight: 'bold', fontSize: '1rem', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
                                {submitting ? 'Creating...' : 'Register Student'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
