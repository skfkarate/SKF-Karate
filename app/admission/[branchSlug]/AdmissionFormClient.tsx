'use client'

import React, { useMemo, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check, UploadCloud, Clock, Download, Copy, AtSign, Phone, Tag, User, Loader2 } from 'lucide-react'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button type="button" onClick={handleCopy} className="adm-btn-copy" title="Copy to clipboard">
      {copied ? <Check size={16} color="#22c55e" /> : <Copy size={16} />}
    </button>
  )
}

type AdmissionConfig = {
  branch: { slug: string; name: string; cityName: string; classTime: string; address: string; photos: string[] }
  settings: { branchSlug: string; branchName: string; defaultMonthlyFee: number; defaultAdmissionFee: number; defaultDressFee: number; batchOptions: string[]; notes?: string }
}
type SubmitState = 'idle' | 'submitting' | 'success' | 'error'
type AdmissionResult = { applicationId: string; branchName: string; quotedMonthlyFee: number; quotedAdmissionFee: number; quotedDressFee: number; quotedJoiningTotal: number }
type FeeQuotePreview = {
  quotedMonthlyFee: number
  quotedAdmissionFee: number
  quotedDressFee: number
  quotedJoiningTotal: number
  promoCode: string
  promoSnapshot: Record<string, unknown>
  notes: string
}

function todayStr() { 
  const d = new Date(); 
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}` 
}
function formatPhone(val: string) { let v = val.replace(/\D/g, ''); if (v.length > 10) v = v.substring(0, 10); return v }

export default function AdmissionFormClient({ config }: { config: AdmissionConfig }) {
  const [step, setStep] = useState(0)
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [result, setResult] = useState<AdmissionResult | null>(null)

  useEffect(() => {
    // Removed auto transition based on user feedback. User must click "Begin Admission" or "ENTER".
  }, [])

  const batchOptions = useMemo(() => {
    const opts = config.settings.batchOptions?.length ? config.settings.batchOptions : [config.branch.classTime].filter(Boolean)
    return Array.from(new Set(opts))
  }, [config.branch.classTime, config.settings.batchOptions])
  const baseFeeQuote = useMemo<FeeQuotePreview>(() => ({
    quotedMonthlyFee: config.settings.defaultMonthlyFee,
    quotedAdmissionFee: config.settings.defaultAdmissionFee,
    quotedDressFee: config.settings.defaultDressFee,
    quotedJoiningTotal: config.settings.defaultAdmissionFee + config.settings.defaultDressFee,
    promoCode: '',
    promoSnapshot: {},
    notes: config.settings.notes || '',
  }), [config.settings.defaultAdmissionFee, config.settings.defaultDressFee, config.settings.defaultMonthlyFee, config.settings.notes])

  const [syncWhatsapp, setSyncWhatsapp] = useState(true)
  const [syncEmergency, setSyncEmergency] = useState(false)
  const [feeQuote, setFeeQuote] = useState<FeeQuotePreview>(baseFeeQuote)
  const [quoteState, setQuoteState] = useState<'idle' | 'loading' | 'error'>('idle')
  const [quoteError, setQuoteError] = useState('')

  const [fd, setFd] = useState({
    studentName: '', studentDob: '', studentGender: 'male', schoolClass: '', expectedJoinDate: todayStr(), preferredBatch: batchOptions[0] || '',
    guardianName: '', guardianRelationship: '', guardianPhone: '', guardianWhatsapp: '', guardianEmail: '',
    emergencyName: '', emergencyRelationship: '', emergencyPhone: '',
    hasMedicalCondition: false, medicalDetails: '', medications: '', specialRequirements: '',
    hasPreviousTraining: false, martialArtsStyle: '', trainingDuration: '', currentBelt: '', previousDojo: '', trainingNotes: '',
    promoCode: '',
    studentPhotoBase64: '', studentPhotoName: '', studentPhotoFile: null as File | null,
    paymentProofBase64: '', paymentProofName: '', paymentProofFile: null as File | null,
    hasReferral: false, referralSource: '', referrerName: '', referrerContact: '',
    accuracyConsent: false, participationConsent: false, dataConsent: false, photoConsent: false,
  })
  const isHerohalli = config.branch.slug === 'herohalli'
  const baseAdmissionFee = baseFeeQuote.quotedAdmissionFee
  const baseDressFee = baseFeeQuote.quotedDressFee
  const basePayNowTotal = baseFeeQuote.quotedJoiningTotal
  const payNowTotal = feeQuote.quotedJoiningTotal
  const promoDiscount = feeQuote.promoCode ? Math.max(0, basePayNowTotal - payNowTotal) : 0
  const showPaymentQr = payNowTotal <= 2000
  const feeNote = isHerohalli
    ? 'Herohalli admission payment includes dress.'
    : 'Admission payment covers admission only. Dress is ordered separately through Shop.'

  useEffect(() => {
    const code = fd.promoCode.trim()
    if (!code) {
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setQuoteState('loading')
      setQuoteError('')
      const params = new URLSearchParams({
        branchSlug: config.branch.slug,
        promoCode: code,
        guardianPhone: fd.guardianPhone,
      })

      try {
        const response = await fetch(`/api/admissions/quote?${params.toString()}`, {
          signal: controller.signal,
          cache: 'no-store',
        })
        const data = await response.json().catch(() => null)
        if (!response.ok || !data?.success) {
          const details = data?.error?.details
          const firstDetail = details && typeof details === 'object'
            ? Object.values(details).flat().filter(Boolean)[0]
            : ''
          throw new Error(String(firstDetail || data?.error?.message || 'Promo code could not be applied.'))
        }

        setFeeQuote({
          quotedMonthlyFee: Number(data.data.quotedMonthlyFee || 0),
          quotedAdmissionFee: Number(data.data.quotedAdmissionFee || 0),
          quotedDressFee: Number(data.data.quotedDressFee || 0),
          quotedJoiningTotal: Number(data.data.quotedJoiningTotal || 0),
          promoCode: String(data.data.promoCode || ''),
          promoSnapshot: data.data.promoSnapshot || {},
          notes: String(data.data.notes || ''),
        })
        setQuoteState('idle')
      } catch (error) {
        if (controller.signal.aborted) return
        setFeeQuote(baseFeeQuote)
        setQuoteState('error')
        setQuoteError(error instanceof Error ? error.message : 'Promo code could not be applied.')
      }
    }, 120)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [baseFeeQuote, config.branch.slug, fd.guardianPhone, fd.promoCode])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') { setFd(p => ({ ...p, [name]: (e.target as HTMLInputElement).checked })) }
    else if (name === 'guardianPhone') { const v = formatPhone(value); setFd(p => { const n = { ...p, guardianPhone: v }; if (syncWhatsapp) n.guardianWhatsapp = v; if (syncEmergency) n.emergencyPhone = v; return n }) }
    else if (name === 'guardianWhatsapp') { setFd(p => ({ ...p, guardianWhatsapp: formatPhone(value) })) }
    else if (name === 'emergencyPhone') { setFd(p => ({ ...p, emergencyPhone: formatPhone(value) })) }
    else if (name === 'promoCode') {
      setQuoteState(value.trim() ? 'loading' : 'idle')
      setQuoteError('')
      setFeeQuote(baseFeeQuote)
      setFd(p => ({ ...p, promoCode: value }))
    }
    else if (name === 'studentDob' || name === 'expectedJoinDate') {
      let v = value.replace(/\D/g, '')
      if (v.length > 8) v = v.substring(0, 8)
      let out = ''
      if (v.length > 0) out += v.substring(0, 2)
      if (v.length > 2) out += '/' + v.substring(2, 4)
      if (v.length > 4) out += '/' + v.substring(4, 8)
      setFd(p => ({ ...p, [name]: out }))
    }
    else { 
      setFd(p => {
        const n = { ...p, [name]: value }
        if (syncEmergency) {
          if (name === 'guardianName') n.emergencyName = value as string
          if (name === 'guardianRelationship') n.emergencyRelationship = value as string
        }
        return n
      }) 
    }
  }

  const handleSyncWa = (e: React.ChangeEvent<HTMLInputElement>) => { setSyncWhatsapp(e.target.checked); if (e.target.checked) setFd(p => ({ ...p, guardianWhatsapp: p.guardianPhone })) }
  const handleSyncEm = (e: React.ChangeEvent<HTMLInputElement>) => { 
    const checked = e.target.checked;
    setSyncEmergency(checked); 
    if (checked) {
      setFd(p => ({ 
        ...p, 
        emergencyPhone: p.guardianPhone,
        emergencyName: p.guardianName,
        emergencyRelationship: p.guardianRelationship 
      })) 
    } else {
      setFd(p => ({
        ...p,
        emergencyPhone: '',
        emergencyName: '',
        emergencyRelationship: ''
      }))
    }
  }

  const handleStudentPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { setErrorMsg('Photo size must be less than 5MB'); return }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setErrorMsg('Photo must be a JPG, PNG, or WebP image.'); return }
      const reader = new FileReader()
      reader.onloadend = () => { setFd(p => ({ ...p, studentPhotoBase64: reader.result as string, studentPhotoName: file.name, studentPhotoFile: file })) }
      reader.readAsDataURL(file)
    }
  }

  const handlePaymentProof = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { setErrorMsg('Payment screenshot must be less than 5MB.'); return }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setErrorMsg('Payment screenshot must be a JPG, PNG, or WebP image.'); return }
      const reader = new FileReader()
      reader.onloadend = () => {
        setFd(p => ({
          ...p,
          paymentProofBase64: reader.result as string,
          paymentProofName: file.name,
          paymentProofFile: file,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const validate = (s: number) => {
    setErrorMsg('')
    if (s === 1 && (!fd.studentName || !fd.studentDob || !fd.studentGender || !fd.schoolClass)) { setErrorMsg('Please fill Name, DOB, Gender and School.'); return false }
    if (s === 1 && !fd.studentPhotoFile) { setErrorMsg('Upload a clear student profile photo.'); return false }
    if (s === 2) {
      if (!fd.guardianName || !fd.guardianRelationship || !fd.guardianPhone) { setErrorMsg('Guardian details are required.'); return false }
      if (fd.guardianPhone.length !== 10) { setErrorMsg('Phone must be 10 digits.'); return false }
      if (!fd.emergencyName || !fd.emergencyRelationship || !fd.emergencyPhone) { setErrorMsg('Emergency contact is required.'); return false }
      if (fd.emergencyPhone.length !== 10) { setErrorMsg('Emergency phone must be 10 digits.'); return false }
    }
    if (s === 3 && fd.hasMedicalCondition && !fd.medicalDetails) { setErrorMsg('Medical details required.'); return false }
    if (s === 4 && quoteState === 'loading') { setErrorMsg('Please wait while the promo code is checked.'); return false }
    if (s === 4 && quoteError) { setErrorMsg(quoteError); return false }
    if (s === 4 && !fd.paymentProofFile) { setErrorMsg('Upload the payment screenshot before continuing.'); return false }
    return true
  }

  const next = () => { if (validate(step)) { setStep(s => s + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) } }
  const prev = () => { setErrorMsg(''); setStep(s => s - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErrorMsg('')
    if (!fd.accuracyConsent || !fd.participationConsent || !fd.dataConsent) { setErrorMsg('Mandatory consents required.'); return }
    
    // Validate DD/MM/YYYY dates
    const dobRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dobRegex.test(fd.studentDob)) { setErrorMsg('Date of Birth must be in DD/MM/YYYY format.'); return }
    if (fd.expectedJoinDate && !dobRegex.test(fd.expectedJoinDate)) { setErrorMsg('Expected Join Date must be in DD/MM/YYYY format.'); return }

    setSubmitState('submitting')
    try {
      const convertDate = (d: string) => {
        const [day, month, year] = d.split('/')
        return year && month && day ? `${year}-${month}-${day}` : ''
      }

      const pl = new FormData()
      pl.set('branchSlug', config.branch.slug); pl.set('preferredBatch', fd.preferredBatch); pl.set('expectedJoinDate', convertDate(fd.expectedJoinDate))
      pl.set('studentName', fd.studentName); pl.set('studentDob', convertDate(fd.studentDob)); pl.set('studentGender', fd.studentGender); pl.set('schoolClass', fd.schoolClass)
      pl.set('guardianName', fd.guardianName); pl.set('guardianRelationship', fd.guardianRelationship); pl.set('guardianPhone', fd.guardianPhone)
      pl.set('guardianWhatsapp', fd.guardianWhatsapp); pl.set('guardianEmail', fd.guardianEmail)
      pl.set('emergencyName', fd.emergencyName); pl.set('emergencyRelationship', fd.emergencyRelationship); pl.set('emergencyPhone', fd.emergencyPhone)
      pl.set('hasMedicalCondition', String(fd.hasMedicalCondition)); pl.set('medicalDetails', fd.medicalDetails); pl.set('medications', fd.medications); pl.set('specialRequirements', fd.specialRequirements)
      pl.set('hasPreviousTraining', String(fd.hasPreviousTraining)); pl.set('martialArtsStyle', fd.martialArtsStyle); pl.set('trainingDuration', fd.trainingDuration)
      pl.set('trainingDuration', fd.trainingDuration); pl.set('currentBelt', fd.currentBelt); pl.set('previousDojo', fd.previousDojo); pl.set('trainingNotes', fd.trainingNotes)
      if (fd.hasReferral) { pl.set('referralSource', fd.referralSource); pl.set('referrerName', fd.referrerName); pl.set('referrerContact', fd.referrerContact) }
      pl.set('promoCode', fd.promoCode); pl.set('accuracyConsent', String(fd.accuracyConsent)); pl.set('participationConsent', String(fd.participationConsent))
      pl.set('dataConsent', String(fd.dataConsent)); pl.set('photoConsent', String(fd.photoConsent))
      if (fd.studentPhotoFile) pl.set('studentPhoto', fd.studentPhotoFile)
      if (fd.paymentProofFile) pl.set('paymentProof', fd.paymentProofFile)
      const res = await fetch('/api/admissions', { method: 'POST', body: pl })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.success) {
        const d = data?.error?.details; const first = d && typeof d === 'object' ? Object.values(d).flat().filter(Boolean)[0] : ''
        throw new Error(String(first || data?.error?.message || 'Failed.'))
      }
      setResult(data.data); setSubmitState('success'); window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: unknown) { setSubmitState('error'); setErrorMsg(err instanceof Error ? err.message : 'Submission failed.') }
  }

  const totalSteps = 5
  const stepLabels = ['Student', 'Guardian', 'Health', 'Payment', 'Review']

  // ── SUCCESS ──
  if (submitState === 'success' && result) {
    return (
      <div className="adm">
        <div className="adm__orb adm__orb--red" /><div className="adm__orb adm__orb--gold" />
        <div className="adm-success">
          <div className="adm-success__icon"><Check size={40} strokeWidth={2} /></div>
          <h1>Admission Submitted</h1>
          <p>Thank you for choosing SKF Karate! Your admission form for <strong>{result.branchName}</strong> has been successfully submitted and is currently under review by our team. We will contact you after verification.</p>
          <div className="adm-success__summary">
            <div><span>Reference</span><strong>{result.applicationId.slice(0, 8).toUpperCase()}</strong></div>
            <div><span>Pay Now</span><strong>₹{result.quotedJoiningTotal.toLocaleString('en-IN')}</strong></div>
          </div>
          <Link href="/" className="btn btn-secondary">Return Home</Link>
        </div>
      </div>
    )
  }

  // ── INTRO ──
  if (step === 0) {
    return (
      <div className="adm">
        <div className="adm-intro">
          <div className="adm-intro__glow" />
          <div className="adm-intro__logo-wrap">
            <Image src="/logo/SKF logo.png" alt="SKF Karate" width={120} height={120} className="adm-intro__logo-img" priority />
            <div className="adm-brand adm-brand--intro">
              <span className="adm-brand__skf">SKF</span>
              <span className="adm-brand__karate">KARATE</span>
            </div>
            <div className="adm-intro__branch">{config.branch.name}</div>
          </div>
          <div className="adm-intro__cta">
            <button className="adm-intro__btn" onClick={() => setStep(1)}>
              Begin Admission <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── FORM ──
  return (
    <div className="adm">
      <div className="adm__orb adm__orb--red" /><div className="adm__orb adm__orb--gold" />
      <div className="adm-main">

        <div className="adm-header">
          <button type="button" className="adm-header__back" onClick={() => step === 1 ? setStep(0) : prev()}>
            <ArrowLeft size={16} /> <span>{step === 1 ? 'Back' : 'Previous'}</span>
          </button>
          
          <div className="adm-brand adm-brand--header">
            <span className="adm-brand__skf">SKF</span>
            <span className="adm-brand__karate">KARATE</span>
          </div>

          <div className="adm-progress">
            <div className="adm-progress__dots">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div key={i} className={`adm-progress__dot ${i + 1 === step ? 'adm-progress__dot--active' : ''} ${i + 1 < step ? 'adm-progress__dot--done' : ''}`} />
              ))}
            </div>
            <span className="adm-progress__text">{stepLabels[step - 1]}</span>
          </div>
        </div>

        <form onSubmit={step === 5 ? handleSubmit : (e) => { e.preventDefault(); next() }}>

          {/* STEP 1 — Student */}
          {step === 1 && (
            <div className="adm-step">
              <div className="adm-step__label">Step 01</div>
              <h2 className="adm-step__title">Student Details</h2>
              <p className="adm-step__desc">Primary information about the student applying for admission.</p>

              <div className="adm-photo-upload-wrap">
                <div className="adm-photo-scanner">
                  {fd.studentPhotoBase64 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={fd.studentPhotoBase64} alt="Student" className="adm-photo-scanner__img" />
                  ) : (
                    <>
                      <User size={54} className="adm-photo-scanner__placeholder" strokeWidth={1} />
                      <div className="adm-photo-scanner__laser"></div>
                    </>
                  )}
                  <div className="adm-qr-scanner__corner adm-qr-scanner__corner--tl" style={{borderColor: 'var(--gold)'}}></div>
                  <div className="adm-qr-scanner__corner adm-qr-scanner__corner--tr" style={{borderColor: 'var(--gold)'}}></div>
                  <div className="adm-qr-scanner__corner adm-qr-scanner__corner--bl" style={{borderColor: 'var(--gold)'}}></div>
                  <div className="adm-qr-scanner__corner adm-qr-scanner__corner--br" style={{borderColor: 'var(--gold)'}}></div>
                </div>
                <div className="adm-photo-upload-info">
                  <h3>Student Profile Photo</h3>
                  <p>Upload a clear passport-style photo. Staff will review it before it becomes the portal profile picture.</p>
                  <label className="adm-photo-btn">
                    <UploadCloud size={16} /> {fd.studentPhotoName ? 'Change Photo' : 'Select Photo'}
                    <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleStudentPhoto} />
                  </label>
                </div>
              </div>

              <div className="adm-field">
                <label className="adm-field__label" htmlFor="studentName">Full Name *</label>
                <input id="studentName" name="studentName" className="adm-field__input" type="text" required autoComplete="name" value={fd.studentName} onChange={handleChange} placeholder="Enter full name" />
              </div>
              <div className="adm-grid">
                <div className="adm-field">
                  <label className="adm-field__label" htmlFor="studentDob">Date of Birth (DD/MM/YYYY) *</label>
                  <input id="studentDob" name="studentDob" className="adm-field__input" type="text" inputMode="numeric" placeholder="DD/MM/YYYY" required autoComplete="bday" value={fd.studentDob} onChange={handleChange} />
                </div>
                <div className="adm-field">
                  <label className="adm-field__label" htmlFor="studentGender">Gender *</label>
                  <select id="studentGender" name="studentGender" className="adm-field__input" required value={fd.studentGender} onChange={handleChange}>
                    <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="adm-grid">
                <div className="adm-field">
                  <label className="adm-field__label" htmlFor="schoolClass">School *</label>
                  <input id="schoolClass" name="schoolClass" className="adm-field__input" type="text" required value={fd.schoolClass} onChange={handleChange} placeholder="Enter school name" />
                </div>
                <div className="adm-field">
                  <label className="adm-field__label" htmlFor="expectedJoinDate">Expected Join Date (DD/MM/YYYY)</label>
                  <input id="expectedJoinDate" name="expectedJoinDate" className="adm-field__input" type="text" inputMode="numeric" placeholder="DD/MM/YYYY" value={fd.expectedJoinDate} onChange={handleChange} />
                </div>
              </div>
              <div className="adm-field">
                <label className="adm-field__label" htmlFor="preferredBatch">Preferred Batch Timing</label>
                {batchOptions.length <= 1 ? (
                  <>
                    <div className="adm-batch-single"><Clock size={16} /> {batchOptions[0] || config.branch.classTime || 'To be decided'}</div>
                    <input type="hidden" name="preferredBatch" value={fd.preferredBatch} />
                  </>
                ) : (
                  <select id="preferredBatch" name="preferredBatch" className="adm-field__input" value={fd.preferredBatch} onChange={handleChange}>
                    <option value="">Decide during approval</option>
                    {batchOptions.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                )}
              </div>

              <div className="adm-divider" style={{ margin: '2rem 0 1.5rem' }} />
              <div className={`adm-toggle-group ${fd.hasReferral ? 'adm-toggle-group--expanded' : ''}`}>
                <label className="adm-toggle-header">
                  <input type="checkbox" name="hasReferral" checked={fd.hasReferral} onChange={handleChange} />
                  <div className="adm-toggle-header__body">
                    <span className="adm-toggle-header__title">Were you referred by someone?</span>
                    <span className="adm-toggle-header__desc">Let us know if an existing student or friend referred you.</span>
                  </div>
                </label>
                {fd.hasReferral && (
                  <div className="adm-toggle-content">
                    <div className="adm-field" style={{ marginBottom: '1rem' }}>
                      <label className="adm-field__label" htmlFor="referralSource">Referral Source</label>
                      <select id="referralSource" name="referralSource" className="adm-field__input" value={fd.referralSource} onChange={handleChange}>
                        <option value="">Select source...</option>
                        <option value="Existing Student">Existing Student</option>
                        <option value="Friend or Family">Friend or Family</option>
                        <option value="Social Media">Social Media</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="adm-grid">
                      <div className="adm-field">
                        <label className="adm-field__label" htmlFor="referrerName">Referrer Name</label>
                        <input id="referrerName" name="referrerName" className="adm-field__input" type="text" value={fd.referrerName} onChange={handleChange} placeholder="Name of person" />
                      </div>
                      <div className="adm-field">
                        <label className="adm-field__label" htmlFor="referrerContact">Referrer Contact</label>
                        <input id="referrerContact" name="referrerContact" className="adm-field__input" type="text" value={fd.referrerContact} onChange={handleChange} placeholder="Phone or SKF ID" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2 — Guardian */}
          {step === 2 && (
            <div className="adm-step">
              <div className="adm-step__label">Step 02</div>
              <h2 className="adm-step__title">Guardian & Emergency</h2>
              <p className="adm-step__desc">Primary guardian and emergency contact information.</p>

              <div className="adm-grid">
                <div className="adm-field">
                  <label className="adm-field__label" htmlFor="guardianName">Guardian Name *</label>
                  <input id="guardianName" name="guardianName" className="adm-field__input" type="text" required autoComplete="name" value={fd.guardianName} onChange={handleChange} />
                </div>
                <div className="adm-field">
                  <label className="adm-field__label" htmlFor="guardianRelationship">Relationship *</label>
                  <select id="guardianRelationship" name="guardianRelationship" className="adm-field__input" required value={fd.guardianRelationship} onChange={handleChange}>
                    <option value="" disabled>Select</option>
                    <option value="Father">Father</option><option value="Mother">Mother</option><option value="Guardian">Guardian</option><option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="adm-grid">
                <div className="adm-field">
                  <label className="adm-field__label" htmlFor="guardianPhone">Mobile Number *</label>
                  <input id="guardianPhone" name="guardianPhone" className="adm-field__input" type="tel" required autoComplete="tel" value={fd.guardianPhone} onChange={handleChange} placeholder="10 digits" />
                </div>
                <div className="adm-field">
                  <label className="adm-field__label" htmlFor="guardianWhatsapp">WhatsApp Number *</label>
                  <input id="guardianWhatsapp" name="guardianWhatsapp" className="adm-field__input" type="tel" required autoComplete="tel" value={fd.guardianWhatsapp} onChange={handleChange} disabled={syncWhatsapp} />
                  <label className="adm-check"><input type="checkbox" checked={syncWhatsapp} onChange={handleSyncWa} /><span>Same as mobile</span></label>
                </div>
              </div>
              <div className="adm-field">
                <label className="adm-field__label" htmlFor="guardianEmail">Email (Optional)</label>
                <input id="guardianEmail" name="guardianEmail" className="adm-field__input" type="email" autoComplete="email" value={fd.guardianEmail} onChange={handleChange} />
              </div>

              <div className="adm-divider" />
              <div className="adm-subhead">Emergency Contact</div>

              <div className="adm-field">
                <label className="adm-check"><input type="checkbox" checked={syncEmergency} onChange={handleSyncEm} /><span>Same as Guardian</span></label>
              </div>
              <div className="adm-grid">
                <div className="adm-field">
                  <label className="adm-field__label" htmlFor="emergencyName">Name *</label>
                  <input id="emergencyName" name="emergencyName" className="adm-field__input" type="text" required autoComplete="name" value={fd.emergencyName} onChange={handleChange} readOnly={syncEmergency} />
                </div>
                <div className="adm-field">
                  <label className="adm-field__label" htmlFor="emergencyRelationship">Relationship *</label>
                  <input id="emergencyRelationship" name="emergencyRelationship" className="adm-field__input" type="text" required value={fd.emergencyRelationship} onChange={handleChange} readOnly={syncEmergency} />
                </div>
              </div>
              <div className="adm-field">
                <label className="adm-field__label" htmlFor="emergencyPhone">Phone *</label>
                <input id="emergencyPhone" name="emergencyPhone" className="adm-field__input" type="tel" required autoComplete="tel" value={fd.emergencyPhone} onChange={handleChange} readOnly={syncEmergency} />
              </div>
            </div>
          )}

          {/* STEP 3 — Health */}
          {step === 3 && (
            <div className="adm-step">
              <div className="adm-step__label">Step 03</div>
              <h2 className="adm-step__title">Health & Training</h2>
              <p className="adm-step__desc">Important details for the instructor to ensure student safety.</p>

              <div className={`adm-toggle-group ${fd.hasMedicalCondition ? 'adm-toggle-group--expanded' : ''}`}>
                <label className="adm-toggle-header">
                  <input type="checkbox" name="hasMedicalCondition" checked={fd.hasMedicalCondition} onChange={handleChange} />
                  <div className="adm-toggle-header__body">
                    <span className="adm-toggle-header__title">Medical Conditions or Injuries</span>
                    <span className="adm-toggle-header__desc">Does the student have any allergies, past injuries, or ongoing conditions?</span>
                  </div>
                </label>
                {fd.hasMedicalCondition && (
                  <div className="adm-toggle-content">
                    <div className="adm-grid">
                      <div className="adm-field">
                        <label className="adm-field__label" htmlFor="medicalDetails">Details *</label>
                        <textarea id="medicalDetails" name="medicalDetails" className="adm-field__input" required value={fd.medicalDetails} onChange={handleChange} />
                      </div>
                      <div className="adm-field">
                        <label className="adm-field__label" htmlFor="medications">Medications</label>
                        <textarea id="medications" name="medications" className="adm-field__input" value={fd.medications} onChange={handleChange} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className={`adm-toggle-group ${fd.hasPreviousTraining ? 'adm-toggle-group--expanded' : ''}`}>
                <label className="adm-toggle-header">
                  <input type="checkbox" name="hasPreviousTraining" checked={fd.hasPreviousTraining} onChange={handleChange} />
                  <div className="adm-toggle-header__body">
                    <span className="adm-toggle-header__title">Previous Martial Arts Training</span>
                    <span className="adm-toggle-header__desc">Has the student trained in Karate or any martial art before?</span>
                  </div>
                </label>
                {fd.hasPreviousTraining && (
                  <div className="adm-toggle-content">
                    <div className="adm-grid">
                      <div className="adm-field">
                        <label className="adm-field__label" htmlFor="martialArtsStyle">Style</label>
                        <input id="martialArtsStyle" name="martialArtsStyle" className="adm-field__input" type="text" value={fd.martialArtsStyle} onChange={handleChange} placeholder="e.g. Karate, Judo" />
                      </div>
                      <div className="adm-field">
                        <label className="adm-field__label" htmlFor="currentBelt">Belt / Rank</label>
                        <input id="currentBelt" name="currentBelt" className="adm-field__input" type="text" value={fd.currentBelt} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="adm-field">
                      <label className="adm-field__label" htmlFor="previousDojo">Previous Dojo</label>
                      <input id="previousDojo" name="previousDojo" className="adm-field__input" type="text" value={fd.previousDojo} onChange={handleChange} />
                    </div>
                    <div className="adm-field">
                      <label className="adm-field__label" htmlFor="trainingDuration">Training Duration</label>
                      <input id="trainingDuration" name="trainingDuration" className="adm-field__input" type="text" value={fd.trainingDuration} onChange={handleChange} placeholder="e.g. 1 year" />
                    </div>
                  </div>
                )}
              </div>
              <div className="adm-field" style={{ marginTop: '1.5rem' }}>
                <label className="adm-field__label" htmlFor="specialRequirements">Special Notes (Optional)</label>
                <textarea id="specialRequirements" name="specialRequirements" className="adm-field__input" value={fd.specialRequirements} onChange={handleChange} placeholder="Any notes for staff..." />
              </div>
            </div>
          )}

          {/* STEP 4 — Payment */}
          {step === 4 && (
            <div className="adm-step">
              <div className="adm-step__label">Step 04</div>
              <h2 className="adm-step__title">Joining Fee</h2>
              <p className="adm-step__desc">Secure your admission by paying the initial joining fee.</p>

              <div className="adm-pay">
                <div className="adm-pay__row"><span>Admission Fee</span><span>₹{baseAdmissionFee.toLocaleString('en-IN')}</span></div>
                {baseDressFee > 0 && (
                  <div className="adm-pay__row"><span>Dress Fee</span><span>₹{baseDressFee.toLocaleString('en-IN')}</span></div>
                )}
                {promoDiscount > 0 && (
                  <div className="adm-pay__row adm-pay__row--discount"><span>{feeQuote.promoCode} Promo</span><span>-₹{promoDiscount.toLocaleString('en-IN')}</span></div>
                )}
                <div className="adm-pay__total">
                  <span>Pay Now</span>
                  <span className="adm-pay__total-amount">
                    {promoDiscount > 0 && <span className="adm-pay__was">₹{basePayNowTotal.toLocaleString('en-IN')}</span>}
                    <span>₹{payNowTotal.toLocaleString('en-IN')}</span>
                  </span>
                </div>
                <p className="adm-pay__note">{feeNote}</p>
              </div>

              <div className="adm-promo">
                <div className="adm-promo__icon"><Tag size={20} /></div>
                <div className="adm-promo__content">
                  <label htmlFor="promoCode">Have a Promo Code? (Optional)</label>
                  <input id="promoCode" name="promoCode" type="text" value={fd.promoCode} onChange={handleChange} placeholder="Enter code here" />
                  {quoteState === 'loading' && <p className="adm-promo__hint" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Loader2 size={14} className="adm-spinner" /> Checking promo code...</p>}
                  {quoteError && <p className="adm-promo__error">{quoteError}</p>}
                </div>
              </div>

              <div className="adm-qr-card">
                {showPaymentQr && (
                  <div className="adm-qr-card__left">
                    <div className="adm-qr-scanner">
                      <Image src="/scanner-to-pay.jpeg" alt="UPI QR" width={220} height={220} className="adm-qr-scanner__img" />
                      <div className="adm-qr-scanner__laser"></div>
                      <div className="adm-qr-scanner__corner adm-qr-scanner__corner--tl"></div>
                      <div className="adm-qr-scanner__corner adm-qr-scanner__corner--tr"></div>
                      <div className="adm-qr-scanner__corner adm-qr-scanner__corner--bl"></div>
                      <div className="adm-qr-scanner__corner adm-qr-scanner__corner--br"></div>
                    </div>
                    <a href="/scanner-to-pay.jpeg" download="SKF_Karate_QR.jpeg" className="adm-btn-download">
                      <Download size={14} /> Download QR
                    </a>
                  </div>
                )}
                
                <div className="adm-qr-card__right">
                  <h3 className="adm-qr-card__title">Payment Options</h3>
                  {!showPaymentQr && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', marginTop: '-1rem', lineHeight: '1.6' }}>
                      Please complete your payment using any UPI app (GPay, PhonePe, Paytm, etc.) by entering our official UPI ID or Phone Number below.
                    </p>
                  )}
                  
                  <div className="adm-qr-options">
                    
                    {showPaymentQr && (
                      <div className="adm-qr-option" style={{ marginBottom: '0.5rem' }}>
                        <span className="adm-qr-option__type">Alternative Methods</span>
                      </div>
                    )}

                    <div className="adm-qr-pay-method">
                      <div className="adm-qr-pay-method__icon"><AtSign size={18} /></div>
                      <div className="adm-qr-pay-method__info">
                        <span className="adm-qr-pay-method__label">UPI ID</span>
                        <span className="adm-qr-pay-method__value">skfkarate@axl</span>
                      </div>
                      <CopyButton text="skfkarate@axl" />
                    </div>

                    <div className="adm-qr-pay-method">
                      <div className="adm-qr-pay-method__icon"><Phone size={18} /></div>
                      <div className="adm-qr-pay-method__info">
                        <span className="adm-qr-pay-method__label">Phone Number</span>
                        <span className="adm-qr-pay-method__value">9611990869</span>
                      </div>
                      <CopyButton text="9611990869" />
                    </div>

                    <div className="adm-qr-verified">
                      <Check size={16} />
                      <span>Verified Name: <strong>Krishna C</strong></span>
                    </div>

                  </div>
                </div>
              </div>

              <p className="adm-step__desc" style={{ marginTop: '1.5rem' }}>
                Payment will be verified manually by SKF staff before approval.
              </p>

              <label className={`adm-upload ${fd.paymentProofFile ? 'adm-upload--done' : ''}`}>
                <UploadCloud size={28} />
                <span className="adm-upload__text">
                  {fd.paymentProofName ? fd.paymentProofName : 'Upload Payment Screenshot'}
                </span>
                <span className="adm-upload__hint">Required after payment. JPG, PNG, or WebP up to 5MB.</span>
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handlePaymentProof} />
              </label>
            </div>
          )}

          {/* STEP 5 — Consent */}
          {step === 5 && (
            <div className="adm-step">
              <div className="adm-step__label">Step 05</div>
              <h2 className="adm-step__title">Review & Consent</h2>
              <p className="adm-step__desc">Please review the terms and provide your consent to complete the application.</p>

              <div className="adm-consent">
                <label className="adm-consent__item"><input type="checkbox" name="accuracyConsent" checked={fd.accuracyConsent} onChange={handleChange} /><p>I confirm that all information provided is accurate and truthful.</p></label>
                <label className="adm-consent__item"><input type="checkbox" name="participationConsent" checked={fd.participationConsent} onChange={handleChange} /><p>I consent to the student participating in SKF Karate classes and agree to abide by Dojo rules.</p></label>
                <label className="adm-consent__item"><input type="checkbox" name="dataConsent" checked={fd.dataConsent} onChange={handleChange} /><p>I consent to SKF securely storing this information for administration purposes.</p></label>
                <label className="adm-consent__item"><input type="checkbox" name="photoConsent" checked={fd.photoConsent} onChange={handleChange} /><p>I grant permission for student photos/videos during training for promotional use (Optional).</p></label>
              </div>
            </div>
          )}

          {errorMsg && <div className="adm-error">{errorMsg}</div>}

          <div className="adm-controls">
            <button type="button" className="adm-btn-back" onClick={prev} disabled={submitState === 'submitting'}>
              <ArrowLeft size={16} /> Back
            </button>
            {step < 5 ? (
              <button type="submit" className="adm-btn-next">Continue <ArrowRight size={16} /></button>
            ) : (
              <button type="submit" className="adm-btn-next" disabled={submitState === 'submitting'}>
                {submitState === 'submitting' ? 'Submitting...' : 'Submit Application'} 
                {submitState === 'submitting' ? <Loader2 size={16} className="adm-spinner" /> : <ArrowRight size={16} />}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
