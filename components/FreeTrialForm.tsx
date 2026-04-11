'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FaCheckCircle, FaCalendarAlt, FaCircleNotch } from 'react-icons/fa'

const BRANCH_VALUES = ['koramangala', 'whitefield', 'jp-nagar'] as const

export const freeTrialSchema = z.object({
  studentName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  parentPhone: z.string().regex(/^\+91[0-9]{10}$/, 'Must be a valid +91 phone number'),
  childAge: z.coerce.number().min(5, 'Minimum age is 5').max(60, 'Maximum age is 60'),
  branch: z.enum(BRANCH_VALUES),
  preferredBatch: z.string().min(1, 'Please select a preferred batch'),
  hearAboutUs: z.string().optional()
})

type FreeTrialFormInput = z.input<typeof freeTrialSchema>
type FreeTrialFormValues = z.output<typeof freeTrialSchema>

const BRANCH_BATCHES = {
  koramangala: ['Tue/Thu 5pm', 'Tue/Thu 7pm', 'Sat 9am'],
  whitefield:  ['Mon/Wed 6pm', 'Sat 10am'],
  'jp-nagar':  ['Mon/Wed 5:30pm', 'Sat 8am']
}

type Props = {
    branch?: 'koramangala' | 'whitefield' | 'jp-nagar'
}

export default function FreeTrialForm({ branch }: Props) {
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    
    const { register, handleSubmit, watch, formState: { errors } } = useForm<FreeTrialFormInput, unknown, FreeTrialFormValues>({
        resolver: zodResolver(freeTrialSchema),
        defaultValues: {
            branch: branch,
            parentPhone: '+91'
        }
    })

    const selectedBranch = watch('branch')
    const availableBatches = selectedBranch ? BRANCH_BATCHES[selectedBranch] : []

    const onSubmit = async (data: FreeTrialFormValues) => {
        setIsSubmitting(true)
        try {
            const res = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            if (res.ok) {
                setIsSubmitted(true)
            } else {
                alert('Oops! Something went wrong. Please try again.')
            }
        } catch (error) {
            console.error(error)
            alert('Network error. Please try again later.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isSubmitted) {
        const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=SKF+Karate+Free+Trial&details=Your+first+trial+class+at+SKF+Karate+(${selectedBranch})`
        return (
            <div style={{
                background: 'var(--bg-card, rgba(255,255,255,0.03))',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '3rem 2rem',
                textAlign: 'center',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                fontFamily: 'system-ui, sans-serif'
            }}>
                <FaCheckCircle size={60} style={{ color: '#25D366', marginBottom: '1.5rem' }} />
                <h3 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 800 }}>
                    We'll contact you within 24 hours!
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', marginBottom: '2rem' }}>
                    We'll WhatsApp you to confirm your FREE trial class.
                </p>
                <a 
                    href={calUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                    style={{ background: 'var(--gold, #ffb703)', color: '#000', display: 'inline-flex', gap: '0.5rem' }}
                >
                    <FaCalendarAlt /> Add to Calendar
                </a>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} style={{ 
            background: 'var(--bg-card, rgba(255,255,255,0.03))',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.2rem',
            fontFamily: 'system-ui, sans-serif'
        }}>
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>Student Name</label>
                <input 
                    type="text" 
                    {...register('studentName')} 
                    placeholder="E.g., Arjun Sharma"
                    className="input-field" 
                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.8rem', width: '100%', color: '#fff' }}
                />
                {errors.studentName && <span style={{ color: 'var(--crimson, #dc3545)', fontSize: '0.8rem', marginTop: '0.2rem', display: 'block' }}>{errors.studentName.message}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>Phone Number</label>
                    <input 
                        type="tel" 
                        {...register('parentPhone')} 
                        placeholder="+91..."
                        className="input-field" 
                        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.8rem', width: '100%', color: '#fff' }}
                    />
                    {errors.parentPhone && <span style={{ color: 'var(--crimson, #dc3545)', fontSize: '0.8rem', marginTop: '0.2rem', display: 'block' }}>{errors.parentPhone.message}</span>}
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>Age</label>
                    <input 
                        type="number" 
                        {...register('childAge')} 
                        placeholder="Age"
                        className="input-field" 
                        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.8rem', width: '100%', color: '#fff' }}
                    />
                    {errors.childAge && <span style={{ color: 'var(--crimson, #dc3545)', fontSize: '0.8rem', marginTop: '0.2rem', display: 'block' }}>{errors.childAge.message}</span>}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>Branch</label>
                    <select 
                        {...register('branch')} 
                        className="input-field"
                        style={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.8rem', width: '100%', color: '#fff' }}
                    >
                        <option value="">Select Branch</option>
                        <option value="koramangala">Koramangala</option>
                        <option value="whitefield">Whitefield</option>
                        <option value="jp-nagar">JP Nagar</option>
                    </select>
                    {errors.branch && <span style={{ color: 'var(--crimson, #dc3545)', fontSize: '0.8rem', marginTop: '0.2rem', display: 'block' }}>{errors.branch.message}</span>}
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>Preferred Batch</label>
                    <select 
                        {...register('preferredBatch')} 
                        className="input-field"
                        disabled={!selectedBranch}
                        style={{ background: !selectedBranch ? 'rgba(0,0,0,0.5)' : '#0a0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.8rem', width: '100%', color: '#fff' }}
                    >
                        <option value="">Select Batch</option>
                        {availableBatches.map(b => (
                            <option key={b} value={b}>{b}</option>
                        ))}
                    </select>
                    {errors.preferredBatch && <span style={{ color: 'var(--crimson, #dc3545)', fontSize: '0.8rem', marginTop: '0.2rem', display: 'block' }}>{errors.preferredBatch.message}</span>}
                </div>
            </div>

            <button 
                type="submit" 
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{ 
                    marginTop: '1rem',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    opacity: isSubmitting ? 0.7 : 1
                }}
            >
                {isSubmitting ? <FaCircleNotch className="fa-spin" style={{ animation: 'spin 1s linear infinite' }} /> : null}
                {isSubmitting ? 'Submitting...' : 'Book Free Trial Class'}
            </button>
        </form>
    )
}
