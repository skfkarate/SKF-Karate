import { describe, expect, it } from 'vitest'

import {
  admissionApprovalFieldsSchema,
  publicAdmissionSchema,
} from '@/src/server/api/validators/admission.validator'

describe('admission validators', () => {
  const validPublicAdmission = {
    branchSlug: 'mp-sports-club',
    preferredBatch: '5:00 PM - 6:30 PM',
    expectedJoinDate: '2026-05-27',
    studentName: 'Test Student',
    studentDob: '2014-01-15',
    studentGender: 'male',
    schoolClass: 'Grade 6',
    guardianName: 'Test Guardian',
    guardianRelationship: 'Father',
    guardianPhone: '9876543210',
    guardianWhatsapp: '9876543210',
    guardianEmail: 'guardian@example.com',
    secondaryGuardianName: '',
    secondaryGuardianRelationship: '',
    secondaryGuardianPhone: '',
    emergencyName: 'Emergency Contact',
    emergencyRelationship: 'Mother',
    emergencyPhone: '9876543211',
    hasMedicalCondition: false,
    medicalDetails: '',
    medications: '',
    specialRequirements: '',
    hasPreviousTraining: false,
    martialArtsStyle: '',
    trainingDuration: '',
    previousDojo: '',
    currentBelt: '',
    trainingNotes: '',
    promoCode: '',
    referralSource: '',
    referrerName: '',
    referrerContact: '',
    photoConsent: false,
    dataConsent: true,
    participationConsent: true,
    accuracyConsent: true,
  }

  it('treats null optional public form fields as missing', () => {
    const parsed = publicAdmissionSchema.parse({
      ...validPublicAdmission,
      preferredBatch: null,
      expectedJoinDate: null,
      guardianEmail: null,
      secondaryGuardianName: null,
      secondaryGuardianRelationship: null,
      secondaryGuardianPhone: null,
      medicalDetails: null,
      medications: null,
      specialRequirements: null,
      martialArtsStyle: null,
      trainingDuration: null,
      previousDojo: null,
      currentBelt: null,
      trainingNotes: null,
      promoCode: null,
      referralSource: null,
      referrerName: null,
      referrerContact: null,
    })

    expect(parsed.secondaryGuardianName).toBeUndefined()
    expect(parsed.expectedJoinDate).toBeUndefined()
    expect(parsed.guardianEmail).toBeUndefined()
    expect(parsed.promoCode).toBeUndefined()
  })

  it('rejects invalid guardian and emergency phone numbers', () => {
    expect(() =>
      publicAdmissionSchema.parse({
        ...validPublicAdmission,
        guardianPhone: '12345',
        emergencyPhone: 'abc',
      })
    ).toThrow()
  })

  it('requires parent consent before public admission submission', () => {
    expect(() =>
      publicAdmissionSchema.parse({
        ...validPublicAdmission,
        dataConsent: false,
      })
    ).toThrow('Data storage consent is required.')

    expect(() =>
      publicAdmissionSchema.parse({
        ...validPublicAdmission,
        participationConsent: false,
      })
    ).toThrow('Participation consent is required.')

    expect(() =>
      publicAdmissionSchema.parse({
        ...validPublicAdmission,
        accuracyConsent: false,
      })
    ).toThrow('Information accuracy confirmation is required.')
  })

  it('validates optional email only when a value is provided', () => {
    expect(publicAdmissionSchema.parse({
      ...validPublicAdmission,
      guardianEmail: '',
    }).guardianEmail).toBeUndefined()

    expect(() =>
      publicAdmissionSchema.parse({
        ...validPublicAdmission,
        guardianEmail: 'not-an-email',
      })
    ).toThrow()
  })

  it('treats null optional approval fields as missing', () => {
    const parsed = admissionApprovalFieldsSchema.parse({
      applicationId: '11111111-1111-4111-8111-111111111111',
      monthlyFee: '2500',
      admissionFee: '1500',
      dressFee: '0',
      dressCost: '0',
      billingStartDate: '2026-05-27',
      batch: null,
      belt: 'white',
      isPublic: true,
      paymentVerified: true,
      photoAction: 'upload_new',
      reviewNote: null,
    })

    expect(parsed.batch).toBeUndefined()
    expect(parsed.reviewNote).toBeUndefined()
  })

  it('requires staff payment verification before approval', () => {
    expect(() =>
      admissionApprovalFieldsSchema.parse({
        applicationId: '11111111-1111-4111-8111-111111111111',
        monthlyFee: '2500',
        admissionFee: '1500',
        dressFee: '0',
        dressCost: '0',
        billingStartDate: '2026-05-27',
        batch: '5:00 PM - 6:30 PM',
        belt: 'white',
        isPublic: true,
        paymentVerified: false,
        photoAction: 'upload_new',
        reviewNote: '',
      })
    ).toThrow('Payment verification is required before approval.')
  })
})
