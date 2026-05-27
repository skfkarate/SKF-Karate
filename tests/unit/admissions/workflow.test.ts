import { describe, expect, it } from 'vitest'

import {
  buildAdmissionApplicationInsertPayload,
  buildAdmissionPhotoStoragePath,
  buildAdmissionPhotoStoredMeta,
  buildAdmissionPaymentProofInsertPayload,
  buildAdmissionPaymentProofStoragePath,
  buildAdmissionPaymentProofStoredMeta,
  parsePublicAdmissionFormData,
  type FeeQuote,
} from '@/src/server/services/admission.service'

const applicationId = '22222222-2222-4222-8222-222222222222'
const proofId = '33333333-3333-4333-8333-333333333333'

function validAdmissionFormData() {
  const formData = new FormData()
  formData.set('branchSlug', 'mp-sports-club')
  formData.set('preferredBatch', '5:00 PM - 6:30 PM')
  formData.set('expectedJoinDate', '2026-05-27')
  formData.set('studentName', 'Aarav Kumar')
  formData.set('studentDob', '2014-01-15')
  formData.set('studentGender', 'male')
  formData.set('schoolClass', 'Grade 6')
  formData.set('guardianName', 'Ravi Kumar')
  formData.set('guardianRelationship', 'Father')
  formData.set('guardianPhone', '+91 98765 43210')
  formData.set('guardianWhatsapp', '9876543210')
  formData.set('guardianEmail', 'RAVI@EXAMPLE.COM')
  formData.set('emergencyName', 'Meena Kumar')
  formData.set('emergencyRelationship', 'Mother')
  formData.set('emergencyPhone', '9876543211')
  formData.set('hasMedicalCondition', 'true')
  formData.set('medicalDetails', 'Asthma inhaler before intense activity.')
  formData.set('medications', 'Inhaler')
  formData.set('specialRequirements', 'Keep water nearby.')
  formData.set('hasPreviousTraining', 'true')
  formData.set('martialArtsStyle', 'Karate')
  formData.set('trainingDuration', '1 year')
  formData.set('previousDojo', 'Old Dojo')
  formData.set('currentBelt', 'Yellow')
  formData.set('trainingNotes', 'Returning after break.')
  formData.set('promoCode', 'EARLYBIRDMP')
  formData.set('referralSource', 'Existing Student')
  formData.set('referrerName', 'SKF26MP001')
  formData.set('referrerContact', 'SKF26MP001')
  formData.set('photoConsent', 'true')
  formData.set('dataConsent', 'true')
  formData.set('participationConsent', 'true')
  formData.set('accuracyConsent', 'true')
  return formData
}

const quote: FeeQuote = {
  monthlyFee: 2500,
  admissionFee: 1500,
  dressFee: 0,
  joiningTotal: 1500,
  promoSnapshot: {
    code: 'EARLYBIRDMP',
    original: { admissionFee: 2500, dressFee: 0, monthlyFee: 2500 },
    joiningTotalBeforeDiscount: 2500,
    joiningTotalAfterDiscount: 1500,
  },
  promoCodeId: '44444444-4444-4444-8444-444444444444',
  promoCode: 'EARLYBIRDMP',
}

describe('admission workflow helpers', () => {
  it('parses multipart public admission data without leaking missing optional fields as null', () => {
    const formData = validAdmissionFormData()
    formData.delete('preferredBatch')
    formData.delete('expectedJoinDate')
    formData.delete('guardianEmail')
    formData.delete('secondaryGuardianName')
    formData.delete('secondaryGuardianRelationship')
    formData.delete('secondaryGuardianPhone')

    const parsed = parsePublicAdmissionFormData(formData)

    expect(parsed.branchSlug).toBe('mp-sports-club')
    expect(parsed.preferredBatch).toBeUndefined()
    expect(parsed.expectedJoinDate).toBeUndefined()
    expect(parsed.guardianEmail).toBeUndefined()
    expect(parsed.secondaryGuardianPhone).toBeUndefined()
    expect(parsed.hasMedicalCondition).toBe(true)
    expect(parsed.hasPreviousTraining).toBe(true)
  })

  it('builds fee-payment-proof storage paths with image extensions', () => {
    expect(buildAdmissionPaymentProofStoragePath(applicationId, proofId, 'image/png'))
      .toBe(`admissions/${applicationId}/${proofId}.png`)
    expect(buildAdmissionPaymentProofStoragePath(applicationId, proofId, 'image/webp'))
      .toBe(`admissions/${applicationId}/${proofId}.webp`)
    expect(buildAdmissionPaymentProofStoragePath(applicationId, proofId, 'image/jpeg'))
      .toBe(`admissions/${applicationId}/${proofId}.jpg`)
  })

  it('builds temporary admission photo storage paths with image extensions', () => {
    expect(buildAdmissionPhotoStoragePath(applicationId, proofId, 'image/png'))
      .toBe(`admissions/${applicationId}/parent-photo-${proofId}.png`)
    expect(buildAdmissionPhotoStoragePath(applicationId, proofId, 'image/webp'))
      .toBe(`admissions/${applicationId}/parent-photo-${proofId}.webp`)
    expect(buildAdmissionPhotoStoragePath(applicationId, proofId, 'image/jpeg'))
      .toBe(`admissions/${applicationId}/parent-photo-${proofId}.jpg`)
  })

  it('builds the fee_payment_proofs row for an admission payment screenshot', () => {
    const proofPath = buildAdmissionPaymentProofStoragePath(applicationId, proofId, 'image/png')
    const payload = buildAdmissionPaymentProofInsertPayload({
      proofId,
      applicationId,
      branchSlug: 'mp-sports-club',
      branchName: 'MP Sports Club',
      studentName: 'Aarav Kumar',
      guardianPhone: '9876543210',
      amount: quote.joiningTotal,
      proof: { filename: 'payment.png', mimeType: 'image/png', size: 1024 },
      quote,
      path: proofPath,
    })

    expect(payload).toMatchObject({
      id: proofId,
      fee_record_id: null,
      payment_intent_id: null,
      skf_id: 'ADMISSION-22222222',
      amount: 1500,
      payment_reference: 'Admission 22222222',
      proof_path: proofPath,
      proof_filename: 'payment.png',
      metadata: {
        sourceType: 'admission_application',
        applicationId,
        branchSlug: 'mp-sports-club',
        branchName: 'MP Sports Club',
        studentName: 'Aarav Kumar',
        guardianPhone: '9876543210',
        feeType: 'admission',
        quotedAdmissionFee: 1500,
        quotedDressFee: 0,
        quotedJoiningTotal: 1500,
        promoCode: 'EARLYBIRDMP',
      },
    })
  })

  it('stores admission payment proof metadata inside admission_applications.fee_setup', () => {
    const meta = buildAdmissionPaymentProofStoredMeta({
      proofId,
      path: `admissions/${applicationId}/${proofId}.jpg`,
      amount: 1500,
      paymentReference: 'Admission 22222222',
      proof: { filename: 'proof.jpg', mimeType: 'image/jpeg', size: 2048 },
      uploadedAt: '2026-05-27T10:00:00.000Z',
    })

    expect(meta).toEqual({
      proofId,
      bucket: 'fee-payment-proofs',
      path: `admissions/${applicationId}/${proofId}.jpg`,
      amount: 1500,
      paymentReference: 'Admission 22222222',
      filename: 'proof.jpg',
      mimeType: 'image/jpeg',
      size: 2048,
      status: 'submitted',
      uploadedAt: '2026-05-27T10:00:00.000Z',
    })
  })

  it('stores parent admission photo metadata as temporary private storage', () => {
    const meta = buildAdmissionPhotoStoredMeta({
      path: `admissions/${applicationId}/parent-photo-${proofId}.jpg`,
      proof: { filename: 'parent-upload.jpg', mimeType: 'image/jpeg', size: 4096 },
      uploadedAt: '2026-05-27T10:00:00.000Z',
    })

    expect(meta).toEqual({
      bucket: 'admission-photos',
      path: `admissions/${applicationId}/parent-photo-${proofId}.jpg`,
      filename: 'parent-upload.jpg',
      mimeType: 'image/jpeg',
      size: 4096,
      status: 'submitted',
      uploadedAt: '2026-05-27T10:00:00.000Z',
    })
  })

  it('builds the admission_applications row with normalized database columns', () => {
    const parsed = parsePublicAdmissionFormData(validAdmissionFormData())
    const admissionPhotoMeta = buildAdmissionPhotoStoredMeta({
      path: `admissions/${applicationId}/parent-photo-${proofId}.jpg`,
      proof: { filename: 'parent-upload.jpg', mimeType: 'image/jpeg', size: 4096 },
      uploadedAt: '2026-05-27T10:00:00.000Z',
    })
    const paymentProofMeta = buildAdmissionPaymentProofStoredMeta({
      proofId,
      path: `admissions/${applicationId}/${proofId}.png`,
      amount: 1500,
      paymentReference: 'Admission 22222222',
      proof: { filename: 'payment.png', mimeType: 'image/png', size: 1024 },
      uploadedAt: '2026-05-27T10:00:00.000Z',
    })

    const payload = buildAdmissionApplicationInsertPayload({
      applicationId,
      branch: { slug: 'mp-sports-club', name: 'MP Sports Club' },
      form: parsed,
      quote,
      admissionPhotoMeta,
      photo: { filename: 'parent-upload.jpg', mimeType: 'image/jpeg', size: 4096 },
      duplicateWarnings: [{ type: 'same_guardian_phone', count: 1 }],
      paymentProofMeta,
    })

    expect(payload).toMatchObject({
      id: applicationId,
      branch_slug: 'mp-sports-club',
      branch_name: 'MP Sports Club',
      preferred_batch: '5:00 PM - 6:30 PM',
      expected_join_date: '2026-05-27',
      student_name: 'Aarav Kumar',
      student_name_key: 'aarav kumar',
      student_dob: '2014-01-15',
      student_gender: 'male',
      school_class: 'Grade 6',
      guardian_name: 'Ravi Kumar',
      guardian_relationship: 'Father',
      guardian_phone: '9876543210',
      guardian_whatsapp: '9876543210',
      guardian_email: 'ravi@example.com',
      emergency_name: 'Meena Kumar',
      emergency_relationship: 'Mother',
      emergency_phone: '9876543211',
      has_medical_condition: true,
      medical_details: 'Asthma inhaler before intense activity.',
      medications: 'Inhaler',
      special_requirements: 'Keep water nearby.',
      has_previous_training: true,
      martial_arts_style: 'Karate',
      training_duration: '1 year',
      previous_dojo: 'Old Dojo',
      current_belt: 'Yellow',
      training_notes: 'Returning after break.',
      referral_source: 'Existing Student',
      referrer_name: 'SKF26MP001',
      referrer_contact: 'SKF26MP001',
      photo_consent: true,
      data_consent: true,
      participation_consent: true,
      accuracy_consent: true,
      promo_code_id: '44444444-4444-4444-8444-444444444444',
      promo_code: 'EARLYBIRDMP',
      quoted_monthly_fee: 2500,
      quoted_admission_fee: 1500,
      quoted_dress_fee: 0,
      quoted_joining_total: 1500,
      parent_photo_drive_file_id: null,
      parent_photo_drive_url: null,
      parent_photo_filename: 'parent-upload.jpg',
      parent_photo_mime_type: 'image/jpeg',
      parent_photo_size: 4096,
      duplicate_warnings: [{ type: 'same_guardian_phone', count: 1 }],
      fee_setup: { paymentProof: paymentProofMeta, admissionPhoto: admissionPhotoMeta },
    })
    expect(payload.consent_given_at).toEqual(expect.any(String))
  })
})
