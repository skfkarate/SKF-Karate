'use client'

import { useState } from 'react'
import { CertificateCard } from '@/components/CertificateCard'
import { CertificateModal } from '@/components/CertificateModal'

export default function CertificatesClient({ initialCertificates, skfId }: { initialCertificates: any[], skfId: string }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [activeEnrollmentId, setActiveEnrollmentId] = useState<string | null>(null)

  const handleView = (id: string) => {
    setActiveEnrollmentId(id)
    setModalOpen(true)
  }

  if (initialCertificates.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <p style={{ color: '#888', marginBottom: '0.5rem' }}>No certificates have been assigned to your profile yet.</p>
        <p style={{ color: '#555', fontSize: '0.9rem' }}>Check back later after completing exams or programs.</p>
      </div>
    )
  }

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {initialCertificates.map(c => (
          <CertificateCard 
            key={c.id} 
            cert={{ ...c, onView: () => handleView(c.id) }} 
          />
        ))}
      </div>
      
      <CertificateModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        enrollmentId={activeEnrollmentId || ''}
        skfId={skfId}
      />
    </>
  )
}
