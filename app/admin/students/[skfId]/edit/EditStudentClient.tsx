'use client'

import { useState } from 'react'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { editStudentSchema } from '@/lib/validators'
import * as z from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type EditStudentInput = z.input<typeof editStudentSchema>
type FormValues = z.output<typeof editStudentSchema>

export default function EditStudentClient({ student }: { student: any }) {
    const [submitting, setSubmitting] = useState(false)
    const [deactivating, setDeactivating] = useState(false)
    const [apiError, setApiError] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty }
    } = useForm<EditStudentInput, unknown, FormValues>({
        resolver: zodResolver(editStudentSchema),
        defaultValues: {
            name: student.name,
            branch: student.branch,
            batch: student.batch,
            belt: student.belt?.toLowerCase(),
            parentName: student.parentName,
            phone: student.phone,
            monthlyFee: student.monthlyFee,
            photoConsent: student.photoConsent
        }
    })

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        setSubmitting(true)
        setApiError('')
        setSuccessMsg('')
        try {
            const res = await fetch(`/api/admin/students/${student.skfId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            const result = await res.json()
            if (res.ok && result.success) {
                setSuccessMsg('Student updated securely.')
                router.refresh()
            } else {
                setApiError(JSON.stringify(result.error) || 'Failed to update student.')
            }
        } catch (error: any) {
            setApiError(error.message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeactivate = async () => {
        if (!confirm('Are you sure you want to deactivate this student? They will be unable to access the portal.')) return
        
        setDeactivating(true)
        try {
            const res = await fetch(`/api/admin/students/${student.skfId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ confirm: true })
            })
            const result = await res.json()
            if (res.ok && result.success) {
                router.push('/admin/students')
            } else {
                setApiError(result.error || 'Failed to deactivate')
            }
        } catch (e: any) {
            setApiError(e.message)
        } finally {
            setDeactivating(false)
        }
    }

    return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#fff', padding: '3rem 2rem', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                
                <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <Link href="/admin/students" style={{ color: '#666', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block' }}>← Back to Directory</Link>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 400, margin: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            Edit Student
                            {student.status === 'Inactive' && <span style={{ fontSize: '0.8rem', background: 'rgba(214, 40, 40, 0.2)', color: '#ff4444', padding: '0.3rem 0.8rem', borderRadius: '50px', border: '1px solid #ff4444', letterSpacing: '0.05em' }}>INACTIVE</span>}
                        </h1>
                    </div>
                </header>

                <form onSubmit={handleSubmit(onSubmit)} style={{ background: '#111', padding: '2.5rem', borderRadius: '12px', border: '1px solid #222' }}>
                    
                    {apiError && (
                        <div style={{ background: 'rgba(214, 40, 40, 0.1)', color: '#ff6b6b', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid rgba(214, 40, 40, 0.3)' }}>
                            {apiError}
                        </div>
                    )}
                    {successMsg && (
                        <div style={{ background: 'rgba(76, 175, 80, 0.1)', color: '#4caf50', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid rgba(76, 175, 80, 0.3)' }}>
                            {successMsg}
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #333' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>SKF ID (Read-Only)</label>
                            <input type="text" value={student.skfId} disabled style={{ width: '100%', padding: '0.8rem', background: 'transparent', border: 'none', color: 'var(--gold, #ffb703)', fontSize: '1.1rem', fontWeight: 'bold' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Enrolled Date (Read-Only)</label>
                            <input type="text" value={student.enrolledDate} disabled style={{ width: '100%', padding: '0.8rem', background: 'transparent', border: 'none', color: '#888', fontSize: '1rem' }} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Full Name *</label>
                            <input type="text" {...register('name')} style={{ width: '100%', padding: '0.8rem', background: '#000', border: errors.name ? '1px solid #ff4444' : '1px solid #333', color: '#fff', borderRadius: '6px' }} />
                            {errors.name && <span style={{ color: '#ff4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.name.message}</span>}
                        </div>

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

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Batch *</label>
                            <input type="text" {...register('batch')} style={{ width: '100%', padding: '0.8rem', background: '#000', border: errors.batch ? '1px solid #ff4444' : '1px solid #333', color: '#fff', borderRadius: '6px' }} />
                            {errors.batch && <span style={{ color: '#ff4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.batch.message}</span>}
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Belt Level *</label>
                            <select {...register('belt')} style={{ width: '100%', padding: '0.8rem', background: '#000', border: errors.belt ? '1px solid #ff4444' : '1px solid #333', color: '#fff', borderRadius: '6px', textTransform: 'capitalize' }}>
                                {['white', 'yellow', 'orange', 'green', 'blue', 'brown', 'black'].map(b => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                            </select>
                            {errors.belt && <span style={{ color: '#ff4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.belt.message}</span>}
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Monthly Fee (₹) *</label>
                            <input type="number" {...register('monthlyFee')} style={{ width: '100%', padding: '0.8rem', background: '#000', border: errors.monthlyFee ? '1px solid #ff4444' : '1px solid #333', color: '#fff', borderRadius: '6px' }} />
                            {errors.monthlyFee && <span style={{ color: '#ff4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.monthlyFee.message}</span>}
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Parent Name *</label>
                            <input type="text" {...register('parentName')} style={{ width: '100%', padding: '0.8rem', background: '#000', border: errors.parentName ? '1px solid #ff4444' : '1px solid #333', color: '#fff', borderRadius: '6px' }} />
                            {errors.parentName && <span style={{ color: '#ff4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.parentName.message}</span>}
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Phone (+91...) *</label>
                            <input type="text" {...register('phone')} style={{ width: '100%', padding: '0.8rem', background: '#000', border: errors.phone ? '1px solid #ff4444' : '1px solid #333', color: '#fff', borderRadius: '6px' }} />
                            {errors.phone && <span style={{ color: '#ff4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.phone.message}</span>}
                        </div>

                        <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#aaa', fontSize: '0.9rem', cursor: 'pointer' }}>
                                <input type="checkbox" {...register('photoConsent')} style={{ width: '18px', height: '18px', accentColor: 'var(--gold, #ffb703)' }} />
                                Parent grants photo/video consent for social media
                            </label>
                        </div>

                    </div>

                    <div style={{ marginTop: '3rem', borderTop: '1px solid #333', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {student.status !== 'Inactive' ? (
                            <button type="button" onClick={handleDeactivate} disabled={deactivating} style={{ background: 'transparent', color: '#ff4444', border: '1px solid #ff4444', padding: '0.8rem 1.5rem', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.9rem', cursor: deactivating ? 'not-allowed' : 'pointer', opacity: deactivating ? 0.7 : 1 }}>
                                {deactivating ? 'Deactivating...' : 'Deactivate Student'}
                            </button>
                        ) : <div></div> /* spacing spacer */}
                        
                        <button type="submit" disabled={submitting || !isDirty} style={{ background: '#fff', color: '#000', border: 'none', padding: '0.8rem 2.5rem', borderRadius: '4px', fontWeight: 'bold', fontSize: '1rem', cursor: (submitting || !isDirty) ? 'not-allowed' : 'pointer', opacity: (submitting || !isDirty) ? 0.5 : 1 }}>
                            {submitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
