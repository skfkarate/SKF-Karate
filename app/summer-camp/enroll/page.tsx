'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import './summer-camp.css';

type ExistingStudentRecord = {
  name: string;
  dob: string;
  parentName: string;
  contactNumber: string;
  whatsappNumber: string;
  schoolName: string;
  area: string;
  schoolKarate: string;
};

type RegistrationFormData = {
  registrationType: string;
  skfId: string;
  verificationData: string;
  studentName: string;
  dob: string;
  age: string;
  gender: string;
  parentName: string;
  contactNumber: string;
  whatsappNumber: string;
  area: string;
  schoolName: string;
  schoolKarate: string;
  karateExperience: string;
  previouslyTrained: string;
  emergencyContact: string;
  medicalConditions: string;
  paymentProofBase64: string;
  paymentProofName: string;
  parentConsent: boolean;
  campRules: boolean;
  photoPermission: boolean;
};

type BooleanFieldName = 'parentConsent' | 'campRules' | 'photoPermission';

const BOOLEAN_FIELD_NAMES: ReadonlySet<keyof RegistrationFormData> = new Set([
  'parentConsent',
  'campRules',
  'photoPermission',
]);

function isBooleanField(name: keyof RegistrationFormData): name is BooleanFieldName {
  return BOOLEAN_FIELD_NAMES.has(name);
}

function calculateCampAge(dob: string) {
  if (!dob) return '';

  const parts = dob.split('/'); // User types DD/MM/YYYY
  if (parts.length !== 3 || parts[2].length !== 4) return '';

  const birthDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
  const today = new Date('2026-05-01'); // Fixed date for camp context
  if (Number.isNaN(birthDate.getTime())) return '';

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age.toString();
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return typeof error === 'string' ? error : 'An error occurred during submission. Please try again.';
}

// 1) In-code static data for existing SKF students
const EXISTING_STUDENTS: Record<string, ExistingStudentRecord> = {
  'SKF25MP001': {
    name: 'Neshu Ram',
    dob: '2018-11-09',
    parentName: 'Sharathbabu',
    contactNumber: '9591779191',
    whatsappNumber: '9591779191',
    schoolName: '',
    area: '',
    schoolKarate: 'No'
  },
  'SKF25MP002': {
    name: 'Ganvith Ishan',
    dob: '2019-03-04',
    parentName: 'Balaji',
    contactNumber: '8123404357',
    whatsappNumber: '8123404357',
    schoolName: '',
    area: '',
    schoolKarate: 'No'
  },
  'SKF25MP003': {
    name: 'Duvan Gowda',
    dob: '2019-12-06',
    parentName: 'Darshan B B',
    contactNumber: '9886633051',
    whatsappNumber: '9886633051',
    schoolName: '',
    area: '',
    schoolKarate: 'No'
  },
  'SKF25MP004': {
    name: 'Viharika S Gowda',
    dob: '2017-05-26',
    parentName: 'Siddaraju S',
    contactNumber: '7019063688',
    whatsappNumber: '9590444842',
    schoolName: '',
    area: '',
    schoolKarate: 'No'
  },
  'SKF25MP005': {
    name: 'Samisha K Gowda',
    dob: '2020-05-16',
    parentName: 'Kiran Kumar J',
    contactNumber: '9611766327',
    whatsappNumber: '9611766327',
    schoolName: '',
    area: '',
    schoolKarate: 'No'
  },
  'SKF25MP006': {
    name: 'Tharush H Gowda',
    dob: '2020-10-08',
    parentName: 'Samatha',
    contactNumber: '7619373844',
    whatsappNumber: '7619373844',
    schoolName: '',
    area: '',
    schoolKarate: 'No'
  },
  'SKF25MP007': {
    name: 'Purvank P',
    dob: '2021-03-29',
    parentName: 'Keerthana',
    contactNumber: '8618404399',
    whatsappNumber: '8618404399',
    schoolName: '',
    area: '',
    schoolKarate: 'No'
  }
};

export default function SummerCampRegistration() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [syncWhatsapp, setSyncWhatsapp] = useState(false);
  const [syncEmergency, setSyncEmergency] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    registrationType: 'new', // 'existing' or 'new'
    skfId: '',
    verificationData: '', // DOB or Mobile

    // Step 2 & 3: Student & School Details
    studentName: '',
    dob: '',
    age: '',
    gender: 'Male',
    parentName: '',
    contactNumber: '',
    whatsappNumber: '',
    area: '',
    schoolName: '',
    schoolKarate: '',
    karateExperience: 'Beginner',
    previouslyTrained: 'No',

    // Step 4: Emergency & Medical
    emergencyContact: '',
    medicalConditions: '',

    // Step 5: Deposit
    paymentProofBase64: '',
    paymentProofName: '',

    // Step 6: Consent
    parentConsent: false,
    campRules: false,
    photoPermission: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const fieldName = name as keyof RegistrationFormData;

    // Reset data when switching streams
    if (fieldName === 'registrationType') {
      setFormData(prev => ({
        ...prev,
        registrationType: value,
        skfId: '',
        verificationData: '',
        studentName: '',
        dob: '',
        age: '',
        gender: 'Male',
        parentName: '',
        contactNumber: '',
        whatsappNumber: '',
        area: '',
        schoolName: '',
        schoolKarate: '',
        karateExperience: 'Beginner',
        previouslyTrained: 'No',
        emergencyContact: '',
        medicalConditions: '',
      }));
      setErrorMsg('');
      setSyncWhatsapp(false);
      setSyncEmergency(false);
      return;
    }

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      if (isBooleanField(fieldName)) {
        setFormData(prev => ({ ...prev, [fieldName]: checked }));
      }
    } else if (name === 'verificationData' || name === 'dob') {
      let v = value.replace(/\D/g, '');
      if (v.length > 8) v = v.substring(0, 8);
      let formatted = v;
      if (v.length > 4) {
        formatted = `${v.substring(0, 2)}/${v.substring(2, 4)}/${v.substring(4)}`;
      } else if (v.length > 2) {
        formatted = `${v.substring(0, 2)}/${v.substring(2)}`;
      }
      
      if (fieldName === 'dob') {
        setFormData(prev => ({ ...prev, dob: formatted, age: calculateCampAge(formatted) }));
      } else {
        setFormData(prev => ({ ...prev, verificationData: formatted }));
      }
    } else if (name === 'contactNumber' || name === 'whatsappNumber' || name === 'emergencyContact') {
      let val = value.replace(/\D/g, ''); // numbers only
      if (val.length > 10) val = val.substring(0, 10);

      setFormData(prev => {
        const next = { ...prev, [name]: val };
        if (name === 'contactNumber') {
          if (syncWhatsapp) next.whatsappNumber = val;
          if (syncEmergency) next.emergencyContact = val;
        }
        return next;
      });
    } else if (!isBooleanField(fieldName)) {
      setFormData(prev => ({ ...prev, [fieldName]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('File size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          paymentProofBase64: reader.result as string,
          paymentProofName: file.name
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSyncWhatsapp = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSyncWhatsapp(checked);
    if (checked) setFormData(prev => ({ ...prev, whatsappNumber: prev.contactNumber }));
  };

  const handleSyncEmergency = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSyncEmergency(checked);
    if (checked) setFormData(prev => ({ ...prev, emergencyContact: prev.contactNumber }));
  };

  const verifyExistingStudent = () => {
    setErrorMsg('');
    const student = EXISTING_STUDENTS[formData.skfId.trim().toUpperCase()];
    if (student) {
      const inputVerification = formData.verificationData.trim(); // DD/MM/YYYY
      const parts = inputVerification.split('/');
      
      let isoDate = inputVerification;
      if (parts.length === 3) {
        isoDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }

      if (student.dob === isoDate) {
        const formattedDob = student.dob.split('-').reverse().join('/'); // YYYY-MM-DD -> DD/MM/YYYY
        setFormData(prev => ({
          ...prev,
          studentName: student.name,
          dob: formattedDob,
          age: calculateCampAge(formattedDob),
          parentName: student.parentName,
          contactNumber: student.contactNumber,
          whatsappNumber: student.whatsappNumber,
          schoolName: student.schoolName,
          area: student.area,
          schoolKarate: student.schoolKarate,
          skfId: formData.skfId.trim().toUpperCase()
        }));
        setStep(2);
      } else {
        setErrorMsg('Verification failed. Date of Birth does not match our records for this SKF ID.');
      }
    } else {
      setErrorMsg('SKF ID not found in our records.');
    }
  };

  const nextStep = () => {
    setErrorMsg('');
    // Validation before moving to next step
    if (step === 1 && formData.registrationType === 'existing') {
      if (!formData.skfId || !formData.verificationData) {
        setErrorMsg('Please enter SKF ID and verification data');
        return;
      }
      verifyExistingStudent();
      return; // verifyExistingStudent advances the step if valid
    }

    if (step === 2) {
      if (!formData.studentName || !formData.dob || !formData.parentName || !formData.contactNumber) {
        setErrorMsg('Please fill all mandatory fields (Name, DOB, Parent Name, Contact)');
        return;
      }
      if (formData.contactNumber.length !== 10) {
        setErrorMsg('Contact Number must be exactly 10 digits');
        return;
      }
      if (formData.whatsappNumber && formData.whatsappNumber.length !== 10) {
        setErrorMsg('WhatsApp Number must be exactly 10 digits');
        return;
      }
    }

    if (step === 3) {
      if (!formData.schoolName || !formData.area || !formData.schoolKarate) {
        setErrorMsg('Please fill all mandatory fields (School, Area, and Karate presence)');
        return;
      }
    }

    if (step === 4) {
      if (!formData.emergencyContact) {
        setErrorMsg('Emergency Contact is required');
        return;
      }
      if (formData.emergencyContact.length !== 10) {
        setErrorMsg('Emergency Contact must be exactly 10 digits');
        return;
      }
    }

    if (step === 5 && formData.registrationType === 'new') {
      if (!formData.paymentProofBase64) {
        setErrorMsg('Please upload a screenshot of your payment');
        return;
      }
    }

    // Existing students skip step 5 (deposit)
    if (step === 4 && formData.registrationType === 'existing') {
      setStep(6);
      return;
    }

    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setErrorMsg('');
    if (step === 2 && formData.registrationType === 'existing') {
      setStep(1);
    } else if (step === 6 && formData.registrationType === 'existing') {
      setStep(4); // Skip back over deposit step
    } else {
      setStep(prev => prev - 1);
    }
  };

  const isExisting = formData.registrationType === 'existing';
  const totalSteps = isExisting ? 5 : 6;
  const lastStep = 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.parentConsent || !formData.campRules) {
      setErrorMsg('You must accept the Parent Consent and Camp Rules to register.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/summer-camp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit registration');
      }

      setIsSuccess(true);
    } catch (err: unknown) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="summer-camp-container">
        <div className="form-wrapper success-screen">
          <div className="success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <h2>Registration Successful!</h2>
          <p>Your form has been submitted successfully. Your payment is currently marked as pending and will be verified and approved by the admin soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="summer-camp-container">
      <div className="bg-watermark" style={{ flexDirection: 'column' }}>
        <span>SKF</span>
        <span style={{ fontSize: '0.5em' }}>KARATE</span>
      </div>
      <div className="form-wrapper">
        <div className="form-header">
          <h1>Summer Camp Registration</h1>
          <p>Nunchaku Training • May • Every Tue, Wed, Fri</p>
        </div>

        <div className="camp-info-card">
          <ul>
            <li><span className="info-label">Type</span><span className="info-value">Karate Summer Camp</span></li>
            <li><span className="info-label">Training</span><span className="info-value">Nunchaku</span></li>
            <li><span className="info-label">Time</span><span className="info-value">4:30 PM - 5:30 PM</span></li>
            <li><span className="info-label">Fee</span><span className="info-value">Free</span></li>
            {!isExisting && (
              <li style={{ gridColumn: '1 / -1' }}>
                <span className="info-label">Deposit</span>
                <span className="info-value" style={{ color: '#ffcc00' }}>₹300 (Refundable if 90% attendance)</span>
              </li>
            )}
          </ul>
        </div>

        <div className="step-indicator">
          {(isExisting ? [1, 2, 3, 4, 6] : [1, 2, 3, 4, 5, 6]).map(i => (
            <div key={i} className={`step-dot ${step === i ? 'active' : ''} ${step > i ? 'completed' : ''}`} />
          ))}
        </div>

        <form onSubmit={step === lastStep ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>

          {/* STEP 1: REGISTRATION TYPE */}
          {step === 1 && (
            <div className="form-step">
              <div className="form-group">
                <label>Are you an existing SKF member?</label>
                <div className="radio-group" style={{ flexDirection: 'column' }}>
                  <label className="radio-option">
                    <input type="radio" name="registrationType" value="existing" checked={formData.registrationType === 'existing'} onChange={handleInputChange} />
                    <span className="radio-label">Yes, Existing SKF Member</span>
                  </label>
                  <label className="radio-option">
                    <input type="radio" name="registrationType" value="new" checked={formData.registrationType === 'new'} onChange={handleInputChange} />
                    <span className="radio-label">No, New Participant</span>
                  </label>
                </div>
              </div>

              {formData.registrationType === 'existing' && (
                <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '1rem' }}>
                  <div className="form-group">
                    <label>SKF ID</label>
                    <input type="text" name="skfId" placeholder="e.g. SKF25MP001" value={formData.skfId} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input type="text" name="verificationData" placeholder="DD/MM/YYYY" value={formData.verificationData} onChange={handleInputChange} className="date-input" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: STUDENT DETAILS */}
          {step === 2 && (
            <div className="form-step">
              <div className="form-group">
                <label>Student Full Name *</label>
                <input type="text" name="studentName" required value={formData.studentName} onChange={handleInputChange} />
              </div>
              <div className="grid-2-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Date of Birth *</label>
                  <input type="text" name="dob" placeholder="DD/MM/YYYY" required value={formData.dob} onChange={handleInputChange} className="date-input" />
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input type="text" name="age" value={formData.age} disabled style={{ opacity: 0.7 }} />
                </div>
              </div>
              {formData.registrationType === 'new' && (
                <div className="form-group">
                  <label>Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>Parent / Guardian Name *</label>
                <input type="text" name="parentName" required value={formData.parentName} onChange={handleInputChange} />
              </div>
              <div className="grid-2-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Contact Number *</label>
                  <input type="tel" name="contactNumber" required value={formData.contactNumber} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>WhatsApp Number</label>
                  <input type="tel" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleInputChange} disabled={syncWhatsapp} />
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.8rem', cursor: 'pointer', color: '#cccccc' }}>
                    <input type="checkbox" checked={syncWhatsapp} onChange={handleSyncWhatsapp} style={{ width: '1rem', height: '1rem', accentColor: '#ffffff' }} />
                    Same as Contact Number
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SCHOOL DETAILS */}
          {step === 3 && (
            <div className="form-step">
              <div className="form-group">
                <label>School / College Name *</label>
                <input type="text" name="schoolName" required value={formData.schoolName} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Area / Locality *</label>
                <input type="text" name="area" required value={formData.area} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Are there Karate Classes in your school? *</label>
                <select name="schoolKarate" value={formData.schoolKarate} onChange={handleInputChange}>
                  <option value="" disabled>Select an option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              {formData.registrationType === 'new' && (
                <>
                  <div className="form-group">
                    <label>Have you previously trained in Karate?</label>
                    <select name="previouslyTrained" value={formData.previouslyTrained} onChange={handleInputChange}>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Karate Experience Level</label>
                    <select name="karateExperience" value={formData.karateExperience} onChange={handleInputChange}>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Experienced">Experienced</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 4: EMERGENCY & MEDICAL */}
          {step === 4 && (
            <div className="form-step">
              <div className="form-group">
                <label>Emergency Contact Number *</label>
                <input type="tel" name="emergencyContact" required value={formData.emergencyContact} onChange={handleInputChange} disabled={syncEmergency} />
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.8rem', cursor: 'pointer', color: '#cccccc' }}>
                  <input type="checkbox" checked={syncEmergency} onChange={handleSyncEmergency} style={{ width: '1rem', height: '1rem', accentColor: '#ffffff' }} />
                  Same as Contact Number
                </label>
              </div>
              <div className="form-group">
                <label>Medical Conditions / Injuries (Optional)</label>
                <textarea name="medicalConditions" rows={4} placeholder="Please list any medical conditions we should be aware of..." value={formData.medicalConditions} onChange={handleInputChange}></textarea>
              </div>
            </div>
          )}

          {/* STEP 5: DEPOSIT & PAYMENT (New Participants Only) */}
          {step === 5 && !isExisting && (
            <div className="form-step">
              <div className="deposit-instructions">
                <h3>₹300 Commitment Deposit</h3>
                <p>Since this camp is highly requested and seats are limited, we require a ₹300 deposit to confirm your spot. This will be <strong>fully refunded</strong> at the end of the camp provided you maintain at least 90% attendance.</p>

                <div className="qr-container">
                  <Image src="/scanner-to-pay.jpeg" alt="UPI QR Code" className="qr-image" width={200} height={200} />
                  <a href="/scanner-to-pay.jpeg" download="skf-karate-qr.jpeg" className="download-qr-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Download QR Code
                  </a>

                  <div className="upi-info-grid">
                    <div className="upi-info-row">
                      <span className="upi-info-label">UPI ID:</span>
                      <span className="upi-info-val">skfkarate@axl</span>
                    </div>
                    <div className="upi-info-row">
                      <span className="upi-info-label">Number:</span>
                      <span className="upi-info-val">9611990869</span>
                    </div>
                    <div className="upi-info-row">
                      <span className="upi-info-label">Name:</span>
                      <span className="upi-info-val">Krishna C</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Payment Screenshot *</label>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                {formData.paymentProofName && <div style={{ fontSize: '0.8rem', color: '#a0a0a0', marginTop: '0.5rem' }}>Selected: {formData.paymentProofName}</div>}
              </div>
            </div>
          )}

          {/* STEP 6: CONSENT & REVIEW */}
          {step === 6 && (
            <div className="form-step">
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffcc00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                Final Review & Consent
              </h3>

              <div className="checkbox-group">
                <input type="checkbox" id="parentConsent" name="parentConsent" checked={formData.parentConsent} onChange={handleInputChange} />
                <label htmlFor="parentConsent">
                  I, <strong>{formData.parentName || 'the parent/guardian'}</strong>, give full consent for my child, <strong>{formData.studentName || 'my child'}</strong>, to participate in the SKF Summer Camp and confirm they are physically fit for the Nunchaku training.
                </label>
              </div>

              <div className="checkbox-group">
                <input type="checkbox" id="campRules" name="campRules" checked={formData.campRules} onChange={handleInputChange} />
                <label htmlFor="campRules">
                  {isExisting
                    ? 'I accept the camp rules and confirm my child will maintain regular attendance throughout the camp.'
                    : <>I accept the camp rules and understand that the ₹300 deposit is <strong>fully refundable</strong> at the end of the camp provided we maintain 90% or above attendance!</>}
                </label>
              </div>

              <div className="checkbox-group">
                <input type="checkbox" id="photoPermission" name="photoPermission" checked={formData.photoPermission} onChange={handleInputChange} />
                <label htmlFor="photoPermission">
                  I happily grant SKF Karate permission to capture and showcase my child&apos;s epic training highlights and action shots to inspire others! 📸🥋
                </label>
              </div>
            </div>
          )}

          {errorMsg && <div className="error-message">{errorMsg}</div>}

          <div className="button-group">
            {step > 1 && (
              <button type="button" className="btn btn-secondary" onClick={prevStep} disabled={isSubmitting}>
                Back
              </button>
            )}

            {step < lastStep ? (
              <button type="submit" className="btn btn-primary">
                Next
              </button>
            ) : (
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Complete Registration'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
