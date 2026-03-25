'use client'

import { useState } from 'react'
import { UserPlus, Save, ArrowLeft, Camera, HelpCircle } from 'lucide-react'
import Link from 'next/link'

export default function NewStudentForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: 'Male',
    branch: 'Sunkadakatte',
    joiningDate: new Date().toISOString().split('T')[0],
    fatherName: '',
    motherName: '',
    phonePrimary: '',
    phoneSecondary: '',
    email: '',
    bloodGroup: 'O+',
    medicalNotes: ''
  })

  const [generatedId, setGeneratedId] = useState(null)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Generate SKF ID: SKF-[YEAR]-[RANDOM 4 DIGITS]
    const year = new Date(formData.joiningDate).getFullYear() || new Date().getFullYear()
    const randomNum = Math.floor(1000 + Math.random() * 9000)
    const newId = `SKF-${year}-${randomNum}`
    
    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          skfId: newId
        })
      })

      if (!res.ok) throw new Error('API request failed')
      
      setGeneratedId(newId)
    } catch (error) {
      console.error(error)
      alert("Failed to save student. Make sure server is running.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div style={{ padding: '2rem', background: '#05080f', minHeight: '100vh', color: '#fff' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <Link href="/admin/students" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '0.5rem', borderRadius: 8, display: 'flex' }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', color: '#ffb703', margin: 0 }}>
              Register New Student
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', margin: '0.5rem 0 0 0' }}>Add a new athlete to the central SKF database.</p>
          </div>
        </div>

        {/* Generated ID Alert */}
        {generatedId && (
          <div style={{ background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.3)', padding: '1.5rem', borderRadius: 16, marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#2dd4bf', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus size={18} /> Registration Successful
              </h3>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)' }}>The student has been added. Their official SKF ID is:</p>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#fff', letterSpacing: '2px' }}>
              {generatedId}
            </div>
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Section 1: Basic Info */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: '2rem' }}>
            <h2 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
              Primary Details
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>First Name</label>
                <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.75rem', borderRadius: 8 }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Last Name</label>
                <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.75rem', borderRadius: 8 }} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Date of Birth</label>
                <input required type="date" name="dob" value={formData.dob} onChange={handleChange} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.75rem', borderRadius: 8 }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.75rem', borderRadius: 8 }}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Branch / Dojo</label>
                <select name="branch" value={formData.branch} onChange={handleChange} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.75rem', borderRadius: 8 }}>
                  <option value="Sunkadakatte">Sunkadakatte</option>
                  <option value="Rajajinagar">Rajajinagar</option>
                  <option value="Malleshwaram">Malleshwaram</option>
                  <option value="JP Nagar">JP Nagar</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Date of Joining</label>
                <input required type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.75rem', borderRadius: 8 }} />
              </div>
            </div>
          </div>

          {/* Section 2: Parent/Guardian Details */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: '2rem' }}>
            <h2 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
              Guardian & Contact
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Father's Name</label>
                <input required type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.75rem', borderRadius: 8 }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Mother's Name</label>
                <input required type="text" name="motherName" value={formData.motherName} onChange={handleChange} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.75rem', borderRadius: 8 }} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Primary WhatsApp Number</label>
                <input required type="tel" name="phonePrimary" placeholder="+91" value={formData.phonePrimary} onChange={handleChange} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.75rem', borderRadius: 8 }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Email Address</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.75rem', borderRadius: 8 }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '1rem 2rem', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>
              Cancel
            </button>
            <button disabled={isSubmitting} type="submit" style={{ background: '#ffb703', color: '#000', border: 'none', padding: '1rem 2.5rem', borderRadius: 8, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
              <Save size={18} /> {isSubmitting ? 'Registering...' : 'Register Student'}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
