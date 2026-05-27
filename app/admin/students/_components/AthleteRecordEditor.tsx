'use client'

import { useMemo, useRef, useState, useEffect, type CSSProperties, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { getApiErrorMessage } from '@/app/admin/_utils/apiErrors'
import { flattenClassBranches } from '@/lib/classes/catalog'
import type { City } from '@/lib/classesData'
import { createStudentSchema } from '@/lib/validators'

type FormValues = z.output<typeof createStudentSchema>
type FormInput = z.input<typeof createStudentSchema>

export type AutomationSummary = {
  competitionResults: number
  beltEntries: number
  specialEvents: number
  lifetimePoints: number
  achievementCount: number
  lastActivityDate: string | null
}

type CreateResult = {
  skfId: string | null
  dob?: string
}

export type AthleteEditorValues = Omit<FormInput, 'belt' | 'gender' | 'status'> & {
  belt: string
  gender: string
  status: string
  skfId?: string | null
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section
      style={{
        border: '1px solid #171717',
        background: 'linear-gradient(180deg, #0b0b0b 0%, #070707 100%)',
        borderRadius: '20px',
        padding: '1.5rem',
      }}
    >
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>{title}</h2>
        {description ? (
          <p style={{ margin: '0.4rem 0 0', fontSize: '0.9rem', color: '#7d7d7d', lineHeight: 1.5 }}>
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

function FieldShell({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <div>
      <label
        style={{
          display: 'block',
          marginBottom: '0.45rem',
          color: '#9b9b9b',
          fontSize: '0.78rem',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {label}
      </label>
      {children}
      {error ? (
        <span style={{ display: 'block', marginTop: '0.45rem', color: '#ff6b6b', fontSize: '0.78rem' }}>
          {error}
        </span>
      ) : null}
    </div>
  )
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '0.9rem 1rem',
  background: '#030303',
  border: '1px solid #252525',
  color: '#fff',
  borderRadius: '12px',
  fontSize: '0.95rem',
  outline: 'none',
}

function formatDate(value?: string | null) {
  if (!value) return 'No activity yet'
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatDobForPortal(value?: string | null) {
  if (!value) return ''
  const parts = value.split('-')
  if (parts.length !== 3) return value
  const [year, month, day] = parts
  return `${day}-${month}-${year}`
}

function maskDobYear(value?: string | null) {
  if (!value) return 'Not recorded'
  const year = value.split('-')[0]
  return year && year.length === 4 ? `Born in ${year}` : 'Year not available'
}

function buildPortalWelcomeMessage(skfId: string, dob?: string | null) {
  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://skfkarate.org'}/portal`
  const dobLine = dob ? `\nDate of birth: ${formatDobForPortal(dob)}` : ''
  return `Welcome to SKF Karate. Use these details to log in to the athlete portal:\nSKF ID: ${skfId}${dobLine}\nPortal: ${portalUrl}`
}

export default function AthleteRecordEditor({
  mode,
  initialValues,
  initialCities,
  automationSummary,
  publicProfileHref,
}: {
  mode: 'create' | 'edit'
  initialValues: AthleteEditorValues
  initialCities: City[]
  automationSummary?: AutomationSummary
  publicProfileHref?: string | null
}) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)
  const [createResult, setCreateResult] = useState<CreateResult | null>(null)
  const copyTimerRef = useRef<number | null>(null)

  const branchOptions = flattenClassBranches(initialCities)
  const currentBranchValue = String(initialValues.branch || '').trim()
  const branchSelectOptions =
    currentBranchValue &&
    !branchOptions.some(
      (branch) => branch.slug === currentBranchValue || branch.name === currentBranchValue
    )
      ? [
          {
            citySlug: 'legacy',
            slug: currentBranchValue,
            name: currentBranchValue,
            cityName: 'Existing',
            state: '',
            venue: currentBranchValue,
            city: '',
            address: '',
            phone: '',
            whatsapp: '',
            sensei: '',
            senseiDan: '',
            classDays: [],
            classTime: '',
            photos: [],
            description: '',
          },
          ...branchOptions,
        ]
      : branchOptions

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: initialValues as FormInput,
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedBranchValue = watch('branch')
  const currentPublicValue = watch('isPublic')
  const selectedBranch =
    branchSelectOptions.find(
      (branch) => branch.slug === selectedBranchValue || branch.name === selectedBranchValue
    ) || null

  const currentFee = watch('monthlyFee')

  useEffect(() => {
    if (mode === 'create' && selectedBranchValue === 'herohalli' && (currentFee === 0 || currentFee === undefined)) {
      setValue('monthlyFee', 500, { shouldDirty: true })
    }
  }, [selectedBranchValue, mode, currentFee, setValue])

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current)
    }
  }, [])

  const currentPublicProfileHref = useMemo(() => {
    if (createResult?.skfId) {
      return `/athlete/${createResult.skfId}`
    }
    return publicProfileHref || null
  }, [createResult, publicProfileHref])

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setSubmitting(true)
    setApiError('')
    setSuccessMsg('')

    try {
      const endpoint =
        mode === 'create'
          ? '/api/admin/students'
          : `/api/admin/students/${encodeURIComponent(initialValues.skfId || '')}`
      const method = mode === 'create' ? 'POST' : 'PUT'
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(
            payload,
            `Unable to ${mode === 'create' ? 'create' : 'update'} the athlete profile.`
          )
        )
      }

      if (mode === 'create') {
        setCreateResult({
          skfId: payload.skfId || null,
          dob: data.dob,
        })
      } else {
        setSuccessMsg('Athlete profile updated. Public profile and portal identity are now in sync.')
        router.refresh()
      }
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Something went wrong while saving the athlete profile.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopy = async () => {
    const skfId = createResult?.skfId || initialValues.skfId || ''
    if (!skfId) return
    await navigator.clipboard.writeText(
      buildPortalWelcomeMessage(skfId, createResult?.dob || initialValues.dob)
    )
    setCopySuccess(true)
    if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current)
    copyTimerRef.current = window.setTimeout(() => setCopySuccess(false), 2500)
  }

  if (mode === 'create' && createResult) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          background: '#020202',
          color: '#fff',
          padding: '3rem 1.5rem 4rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <SectionCard
            title="Athlete Profile Created"
            description="The live athlete record is ready for admin editing, portal access, and public profile visibility."
          >
            <div
              style={{
                display: 'grid',
                gap: '1rem',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ padding: '1rem', border: '1px solid #1f1f1f', borderRadius: '16px', background: '#050505' }}>
                <div style={{ color: '#7d7d7d', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Athlete ID
                </div>
                <div style={{ marginTop: '0.4rem', fontSize: '1.25rem', fontWeight: 700, color: '#ffb703' }}>
                  {createResult.skfId}
                </div>
              </div>
              <div style={{ padding: '1rem', border: '1px solid #1f1f1f', borderRadius: '16px', background: '#050505' }}>
                <div style={{ color: '#7d7d7d', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Public Profile ID
                </div>
                <div style={{ marginTop: '0.4rem', fontSize: '1.25rem', fontWeight: 700 }}>
                  {createResult.skfId || 'Will sync on first athlete save'}
                </div>
              </div>
            </div>

            <div
              style={{
                border: '1px solid #1f1f1f',
                background: '#050505',
                borderRadius: '16px',
                padding: '1rem',
                marginBottom: '1.5rem',
                lineHeight: 1.7,
                color: '#d2d2d2',
                whiteSpace: 'pre-line',
              }}
            >
              {buildPortalWelcomeMessage(createResult.skfId, createResult.dob)}
            </div>

            <div
              style={{
                border: '1px solid rgba(255, 183, 3, 0.25)',
                background: 'rgba(255, 183, 3, 0.06)',
                borderRadius: '16px',
                padding: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              <h3 style={{ margin: '0 0 0.75rem', color: '#ffb703', fontSize: '1rem' }}>
                Student Onboarding Checklist
              </h3>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#dedede', lineHeight: 1.8 }}>
                <li>Student record created</li>
                <li>SKF ID assigned: {createResult.skfId}</li>
                <li>Portal login ready for DOB + SKF ID test</li>
                <li>Share login information with the parent/guardian</li>
              </ul>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  background: copySuccess ? '#194d33' : '#fff',
                  color: copySuccess ? '#baf7cf' : '#000',
                  border: 'none',
                  padding: '0.85rem 1.2rem',
                  borderRadius: '999px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {copySuccess ? 'Copied' : 'Copy Athlete Portal Message'}
              </button>
              <Link
                href={`/admin/students/${createResult.skfId}/edit`}
                style={{
                  background: '#111',
                  color: '#fff',
                  border: '1px solid #2b2b2b',
                  padding: '0.85rem 1.2rem',
                  borderRadius: '999px',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                Continue Setup
              </Link>
              {createResult.skfId ? (
                <Link
                  href={`/athlete/${createResult.skfId}`}
                  target="_blank"
                  style={{
                    background: 'transparent',
                    color: '#ffb703',
                    border: '1px solid rgba(255, 183, 3, 0.35)',
                    padding: '0.85rem 1.2rem',
                    borderRadius: '999px',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  Open Public Profile
                </Link>
              ) : null}
            </div>
          </SectionCard>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#020202',
        color: '#fff',
        padding: '3rem 1.5rem 4rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '1rem',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            marginBottom: '2rem',
          }}
        >
          <div>
            <Link
              href="/admin/students"
              style={{ color: '#7d7d7d', textDecoration: 'none', display: 'inline-block', marginBottom: '0.9rem' }}
            >
              ← Back to Athletes
            </Link>
            <h1 style={{ margin: 0, fontSize: '2.6rem', fontWeight: 500, letterSpacing: '-0.04em' }}>
              {mode === 'create' ? 'Create Athlete Profile' : 'Edit Athlete Profile'}
            </h1>
            <p style={{ margin: '0.7rem 0 0', color: '#8a8a8a', maxWidth: '720px', lineHeight: 1.6 }}>
              This form controls the live athlete record used by admin operations, portal login, public profile visibility,
              and event-driven achievements. Tournament results, belt exams, and special-event participation stay automated below.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {mode === 'edit' && currentPublicValue && currentPublicProfileHref ? (
              <Link
                href={currentPublicProfileHref}
                target="_blank"
                style={{
                  padding: '0.85rem 1.2rem',
                  borderRadius: '999px',
                  textDecoration: 'none',
                  border: '1px solid rgba(255, 183, 3, 0.35)',
                  color: '#ffb703',
                  fontWeight: 600,
                }}
              >
                Open Public Profile
              </Link>
            ) : null}
          </div>
        </header>

        {apiError ? (
          <div
            style={{
              background: 'rgba(214, 40, 40, 0.12)',
              border: '1px solid rgba(214, 40, 40, 0.35)',
              color: '#ff8d8d',
              padding: '1rem 1.1rem',
              borderRadius: '16px',
              marginBottom: '1.25rem',
            }}
          >
            {apiError}
          </div>
        ) : null}

        {successMsg ? (
          <div
            style={{
              background: 'rgba(76, 175, 80, 0.12)',
              border: '1px solid rgba(76, 175, 80, 0.35)',
              color: '#bdf7c6',
              padding: '1rem 1.1rem',
              borderRadius: '16px',
              marginBottom: '1.25rem',
            }}
          >
            {successMsg}
          </div>
        ) : null}

        {mode === 'edit' ? (
          <div style={{ marginBottom: '1.25rem' }}>
            <SectionCard
              title="Student Portal Access"
              description="Use this when a parent loses the SKF ID or needs the portal login details resent."
            >
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <div style={{ padding: '1rem', border: '1px solid #1f1f1f', borderRadius: '16px', background: '#050505' }}>
                  <div style={{ color: '#7d7d7d', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Current SKF ID
                  </div>
                  <div style={{ marginTop: '0.4rem', color: '#ffb703', fontSize: '1.15rem', fontWeight: 700 }}>
                    {initialValues.skfId || 'Not assigned'}
                  </div>
                </div>
                <div style={{ padding: '1rem', border: '1px solid #1f1f1f', borderRadius: '16px', background: '#050505' }}>
                  <div style={{ color: '#7d7d7d', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Date of Birth
                  </div>
                  <div style={{ marginTop: '0.4rem', color: '#d8d8d8', fontSize: '1.15rem', fontWeight: 700 }}>
                    {maskDobYear(initialValues.dob)}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  marginTop: '1rem',
                  background: copySuccess ? '#194d33' : '#fff',
                  color: copySuccess ? '#baf7cf' : '#000',
                  border: 'none',
                  padding: '0.85rem 1.2rem',
                  borderRadius: '999px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {copySuccess ? 'Copied' : 'Copy Login Credentials'}
              </button>
            </SectionCard>
          </div>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: 'grid', gap: '1.25rem', gridTemplateColumns: 'minmax(0, 1fr)' }}>
            <SectionCard title="Identity & Access" description="Core athlete identity used across admin, portal login, search, and the public profile.">
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <FieldShell label="Athlete Name" error={errors.name?.message}>
                    <input {...register('name')} style={inputStyle} placeholder="Full athlete name" />
                  </FieldShell>
                </div>
                <FieldShell label="Athlete ID">
                  <input
                    value={String(initialValues.skfId || 'Auto-generated on save')}
                    disabled
                    style={{ ...inputStyle, color: '#ffb703', background: '#050505' }}
                  />
                </FieldShell>
                <FieldShell label="Public URL ID">
                  <input
                    value={String(initialValues.skfId || 'Auto-generated after sync')}
                    disabled
                    style={{ ...inputStyle, color: '#cfcfcf', background: '#050505' }}
                  />
                </FieldShell>
                <FieldShell label="Date of Birth" error={errors.dob?.message}>
                  <input type="date" {...register('dob')} style={inputStyle} />
                </FieldShell>
                <FieldShell label="Joined on" error={errors.enrolledDate?.message}>
                  <input type="date" {...register('enrolledDate')} style={inputStyle} />
                </FieldShell>
                <FieldShell label="Gender" error={errors.gender?.message}>
                  <select {...register('gender')} style={inputStyle}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </FieldShell>
                <FieldShell label="Photo URL" error={errors.photoUrl?.message}>
                  <input {...register('photoUrl')} style={inputStyle} placeholder="https://..." />
                </FieldShell>
              </div>
            </SectionCard>

            <SectionCard title="Training Assignment" description="Branch, batch, belt, and status drive event assignment, ranking context, and portal access.">
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <FieldShell label="Branch / Training Centre" error={errors.branch?.message}>
                    <select {...register('branch')} style={inputStyle}>
                      <option value="">Select a branch</option>
                      {branchSelectOptions.map((branch) => (
                        <option key={`${branch.citySlug}-${branch.slug}`} value={branch.slug}>
                          {branch.name} — {branch.cityName}
                        </option>
                      ))}
                    </select>
                  </FieldShell>
                  {selectedBranch ? (
                    <div
                      style={{
                        marginTop: '0.7rem',
                        border: '1px solid #1b1b1b',
                        background: '#050505',
                        borderRadius: '14px',
                        padding: '0.85rem 1rem',
                        color: '#b7b7b7',
                        lineHeight: 1.6,
                        fontSize: '0.88rem',
                      }}
                    >
                      {selectedBranch.cityName}
                      {selectedBranch.state ? `, ${selectedBranch.state}` : ''} · {selectedBranch.venue || selectedBranch.address || 'Venue pending'}
                      {selectedBranch.classTime ? ` · ${selectedBranch.classTime}` : ''}
                      {selectedBranch.sensei ? ` · ${selectedBranch.sensei}` : ''}
                    </div>
                  ) : null}
                </div>
                <FieldShell label="Batch" error={errors.batch?.message}>
                  <input {...register('batch')} style={inputStyle} placeholder="Weekday / evening / school batch" />
                </FieldShell>
                <FieldShell label="Current Belt" error={errors.belt?.message}>
                  <select {...register('belt')} style={inputStyle}>
                    {['white', 'yellow', 'orange', 'green', 'blue', 'brown', 'black'].map((belt) => (
                      <option key={belt} value={belt}>
                        {belt.charAt(0).toUpperCase() + belt.slice(1)}
                      </option>
                    ))}
                  </select>
                </FieldShell>
                <FieldShell label="Athlete Status" error={errors.status?.message}>
                  <select {...register('status')} style={inputStyle}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </FieldShell>
                <FieldShell label="Monthly Fee" error={errors.monthlyFee?.message}>
                  <input type="number" min="0" {...register('monthlyFee')} style={inputStyle} placeholder="0" />
                </FieldShell>
              </div>
            </SectionCard>

            <SectionCard title="Contact & Visibility" description="Guardian contact, consent, and public-surface controls used by the athlete profile and homepage selections.">
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <FieldShell label="Parent / Guardian">
                  <input {...register('parentName')} style={inputStyle} placeholder="Optional" />
                </FieldShell>
                <FieldShell label="Phone" error={errors.phone?.message}>
                  <input {...register('phone')} style={inputStyle} placeholder="+91XXXXXXXXXX" />
                </FieldShell>
                <FieldShell label="Email" error={errors.email?.message}>
                  <input type="email" {...register('email')} style={inputStyle} placeholder="Optional" />
                </FieldShell>
                <div
                  style={{
                    display: 'grid',
                    gap: '0.85rem',
                    border: '1px solid #1b1b1b',
                    background: '#050505',
                    borderRadius: '16px',
                    padding: '1rem',
                    alignContent: 'start',
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
                    <input type="checkbox" {...register('photoConsent')} style={{ width: '18px', height: '18px' }} />
                    <span style={{ color: '#f2f2f2' }}>Photo / video consent available</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', cursor: 'pointer' }}>
                    <input type="checkbox" {...register('dataConsent')} style={{ width: '18px', height: '18px', marginTop: '0.2rem' }} />
                    <span style={{ color: '#f2f2f2', lineHeight: 1.5 }}>
                      Parent/guardian consents to this student&apos;s data being stored and used for club management purposes.
                    </span>
                  </label>
                  {errors.dataConsent?.message ? (
                    <span style={{ color: '#ff6b6b', fontSize: '0.78rem' }}>
                      {errors.dataConsent.message}
                    </span>
                  ) : null}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
                    <input type="checkbox" {...register('isPublic')} style={{ width: '18px', height: '18px' }} />
                    <span style={{ color: '#f2f2f2' }}>Public athlete profile visible</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
                    <input type="checkbox" {...register('isFeatured')} style={{ width: '18px', height: '18px' }} />
                    <span style={{ color: '#f2f2f2' }}>Feature this athlete on highlighted surfaces</span>
                  </label>
                  <p style={{ margin: 0, color: '#777', fontSize: '0.82rem', lineHeight: 1.6 }}>
                    Publishing tournament results, belt exams, and special-event participation updates this athlete profile automatically.
                  </p>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Automated Profile Feed"
              description="These totals are calculated from published events, tournaments, and grading updates. Edit the source event, not these totals."
            >
              <div style={{ display: 'grid', gap: '0.9rem', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                {[
                  ['Competition results', automationSummary?.competitionResults ?? 0],
                  ['Belt exams', automationSummary?.beltEntries ?? 0],
                  ['Special events', automationSummary?.specialEvents ?? 0],
                  ['Lifetime points', automationSummary?.lifetimePoints ?? 0],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      border: '1px solid #1b1b1b',
                      background: '#050505',
                      borderRadius: '16px',
                      padding: '1rem',
                    }}
                  >
                    <div style={{ color: '#777', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {label}
                    </div>
                    <div style={{ marginTop: '0.45rem', fontSize: '1.5rem', fontWeight: 700 }}>{value}</div>
                  </div>
                ))}
              </div>
              <div
                style={{
                  marginTop: '1rem',
                  border: '1px solid #1b1b1b',
                  background: '#050505',
                  borderRadius: '16px',
                  padding: '1rem',
                  color: '#bdbdbd',
                  lineHeight: 1.6,
                }}
              >
                Total profile entries: <strong>{automationSummary?.achievementCount ?? 0}</strong>
                <br />
                Latest synced activity: <strong>{formatDate(automationSummary?.lastActivityDate)}</strong>
                <br />
                {mode === 'edit' && currentPublicValue && currentPublicProfileHref ? (
                  <>
                    Public athlete page: <Link href={currentPublicProfileHref} target="_blank" style={{ color: '#ffb703' }}>open live view</Link>
                  </>
                ) : (
                  <>Public athlete page: hidden until public profile visibility is enabled.</>
                )}
              </div>
            </SectionCard>
          </div>

          <div
            style={{
              marginTop: '1.5rem',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              flexWrap: 'wrap',
            }}
          >
            <Link
              href="/admin/students"
              style={{
                padding: '0.9rem 1.25rem',
                borderRadius: '999px',
                textDecoration: 'none',
                border: '1px solid #2a2a2a',
                color: '#cfcfcf',
              }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || (mode === 'edit' && !isDirty)}
              style={{
                padding: '0.9rem 1.35rem',
                borderRadius: '999px',
                border: 'none',
                background: '#fff',
                color: '#000',
                fontWeight: 700,
                cursor: submitting || (mode === 'edit' && !isDirty) ? 'not-allowed' : 'pointer',
                opacity: submitting || (mode === 'edit' && !isDirty) ? 0.55 : 1,
              }}
            >
              {submitting
                ? mode === 'create'
                  ? 'Creating...'
                  : 'Saving...'
                : mode === 'create'
                  ? 'Create Athlete Profile'
                  : 'Save Athlete Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
