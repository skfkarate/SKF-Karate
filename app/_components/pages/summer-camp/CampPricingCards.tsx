'use client'

import { useState } from 'react'
import { FaShieldAlt, FaStar, FaBolt, FaCheckCircle } from 'react-icons/fa'
import CampEnrollModal from './CampEnrollModal'

export default function CampPricingCards({ branch, campData }: { branch: string, campData: any }) {
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedTier, setSelectedTier] = useState<string | null>(null)

    const handleSelectTier = (tier: string) => {
        setSelectedTier(tier)
        setModalOpen(true)
    }

    return (
        <>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div style={{ background: 'rgba(255,183,3,0.1)', border: '1px solid rgba(255,183,3,0.3)', color: 'var(--gold)', display: 'inline-block', padding: '0.8rem 2rem', borderRadius: '50px', fontWeight: 'bold' }}>
                    <FaBolt style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} />
                    Only {campData.availableSlots} Slots Remaining for {branch}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
                {/* Month 1 Tier */}
                <div className="glass-card" style={{ padding: '3rem 2rem', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    <h3 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '1rem' }}>Month 1</h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem', minHeight: '48px' }}>Essential fitness conditioning and basic self-defense blocks.</p>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--gold)', marginBottom: '2rem' }}>
                        ₹{campData.priceMonth1}
                    </div>
                    <ul style={{ listStyle: 'none', margin: '0 0 2rem 0', padding: 0, flex: 1, color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem' }}>
                        <li style={{ marginBottom: '1rem', display: 'flex', gap: '8px' }}><FaCheckCircle style={{ color: '#4caf50', marginTop: '4px' }} /> 12 Training Sessions</li>
                        <li style={{ marginBottom: '1rem', display: 'flex', gap: '8px' }}><FaCheckCircle style={{ color: '#4caf50', marginTop: '4px' }} /> Basic Blocks & Punches</li>
                        <li style={{ marginBottom: '1rem', display: 'flex', gap: '8px' }}><FaCheckCircle style={{ color: '#4caf50', marginTop: '4px' }} /> Core Flexibility</li>
                    </ul>
                    <button className="btn btn-secondary" onClick={() => handleSelectTier('Month 1')} style={{ width: '100%', justifyContent: 'center' }}>
                        Enrol + Pay
                    </button>
                </div>

                {/* Month 2 Tier */}
                <div className="glass-card" style={{ padding: '3rem 2rem', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    <h3 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '1rem' }}>Month 2</h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem', minHeight: '48px' }}>Intermediate weapon training and advanced striking.</p>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--gold)', marginBottom: '2rem' }}>
                        ₹{campData.priceMonth2}
                    </div>
                    <ul style={{ listStyle: 'none', margin: '0 0 2rem 0', padding: 0, flex: 1, color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem' }}>
                        <li style={{ marginBottom: '1rem', display: 'flex', gap: '8px' }}><FaCheckCircle style={{ color: '#4caf50', marginTop: '4px' }} /> 12 Advanced Sessions</li>
                        <li style={{ marginBottom: '1rem', display: 'flex', gap: '8px' }}><FaCheckCircle style={{ color: '#4caf50', marginTop: '4px' }} /> Nunchaku Introduction</li>
                        <li style={{ marginBottom: '1rem', display: 'flex', gap: '8px' }}><FaCheckCircle style={{ color: '#4caf50', marginTop: '4px' }} /> Kumite (Sparring) Basics</li>
                    </ul>
                    <button className="btn btn-secondary" onClick={() => handleSelectTier('Month 2')} style={{ width: '100%', justifyContent: 'center' }}>
                        Enrol + Pay
                    </button>
                </div>

                {/* Full Camp VIP Tier */}
                <div className="glass-card" style={{ padding: '3rem 2rem', display: 'flex', flexDirection: 'column', position: 'relative', border: '1px solid var(--crimson)', background: 'rgba(214, 40, 40, 0.1)' }}>
                    <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', background: 'var(--crimson)', padding: '0.4rem 1.5rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', color: '#fff', whiteSpace: 'nowrap' }}>
                        <FaStar style={{ display: 'inline', marginRight: '4px' }} /> Most Popular
                    </div>
                    <h3 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '1rem' }}>Full Camp</h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem', minHeight: '48px' }}>The ultimate transformation. Includes both months plus exclusive kit.</p>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#fff', marginBottom: '2rem' }}>
                        ₹{campData.priceFull}
                    </div>
                    <ul style={{ listStyle: 'none', margin: '0 0 2rem 0', padding: 0, flex: 1, color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem' }}>
                        <li style={{ marginBottom: '1rem', display: 'flex', gap: '8px' }}><FaCheckCircle style={{ color: 'var(--gold)', marginTop: '4px' }} /> All 24 Training Sessions</li>
                        <li style={{ marginBottom: '1rem', display: 'flex', gap: '8px' }}><FaCheckCircle style={{ color: 'var(--gold)', marginTop: '4px' }} /> Achievement Kit Included</li>
                        <li style={{ marginBottom: '1rem', display: 'flex', gap: '8px' }}><FaCheckCircle style={{ color: 'var(--gold)', marginTop: '4px' }} /> Official Certificate</li>
                        <li style={{ marginBottom: '1rem', display: 'flex', gap: '8px' }}><FaCheckCircle style={{ color: 'var(--gold)', marginTop: '4px' }} /> Master Instructor Access</li>
                    </ul>
                    <button className="btn btn-primary" onClick={() => handleSelectTier('Full Camp')} style={{ width: '100%', justifyContent: 'center' }}>
                        Enrol + Pay
                    </button>
                </div>
            </div>

            {modalOpen && (
                <CampEnrollModal 
                    isOpen={modalOpen} 
                    onClose={() => setModalOpen(false)} 
                    branch={branch} 
                    tier={selectedTier!} 
                    price={selectedTier === 'Month 1' ? campData.priceMonth1 : selectedTier === 'Month 2' ? campData.priceMonth2 : campData.priceFull}
                />
            )}
        </>
    )
}
