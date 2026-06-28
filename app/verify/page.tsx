'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Award, DatabaseBackup, Fingerprint, LoaderCircle, Search, ShieldCheck } from 'lucide-react'
import './verify.css'

export default function CertificateSearchPage() {
    const router = useRouter()
    const [query, setQuery] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSearch(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!query.trim()) return

        setIsLoading(true)
        setError('')
        
        try {
            const apiReq = fetch(`/api/certificates/search?id=${encodeURIComponent(query.trim())}`)
            const res = await apiReq
            
            if (!res.ok) {
                if (res.status === 404) {
                    throw new Error('Certificate not found.')
                } else {
                    throw new Error('Search failed')
                }
            }
            
            const data = await res.json()
            if (data.verificationCode) {
                router.push(`/verify/c/${data.verificationCode}`)
            } else if (data.skfId && data.enrollmentId) {
                router.push(`/verify/${data.skfId}/${data.enrollmentId}`)
            } else {
                throw new Error('Invalid certificate data from server')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not complete search. Please try again.')
            setIsLoading(false)
        }
    }

    return (
        <div className="verify-page">
            <div className="verify-bg" />
            
            <div className="verify-container">
                {/* ═══════ HEADER ═══════ */}
                <div className="verify-header">
                    <div className="verify-icon-wrapper">
                        <Award className="verify-icon" aria-hidden="true" />
                    </div>
                    <h1 className="verify-title">
                        Certificate <span className="text-gradient">Verification</span>
                    </h1>
                    <p className="verify-subtitle">
                        SKF Karate issues mathematically paired certificates linked directly
                        to student identity. Enter your document ID below to authenticate.
                    </p>
                </div>

                {/* ═══════ SEARCH FORM ═══════ */}
                <form
                    onSubmit={handleSearch}
                    className={`verify-form-wrapper ${isLoading ? 'is-scanning' : ''}`}
                >
                    <div className="scanner-line" />
                    
                    <div className="verify-input-group">
                        <div className="verify-input-wrapper" style={{ display: 'flex', flex: 1 }}>
                            <Search className="verify-search-icon" size={24} />
                            <input 
                                type="text" 
                                placeholder="ex. SKF-C-000001"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                className="verify-input"
                                disabled={isLoading}
                                spellCheck={false}
                                autoComplete="off"
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="verify-btn"
                            disabled={isLoading || !query.trim()}
                        >
                            <span className="btn-content">
                                {isLoading ? (
                                    <>
                                        <LoaderCircle className="spin" size={18} /> Scanning...
                                    </>
                                ) : (
                                    'Authenticate'
                                )}
                            </span>
                        </button>
                    </div>
                </form>

                {/* ═══════ ERROR STATE ═══════ */}
                {error && (
                    <div className="verify-error">
                        <div className="error-icon">
                            <span style={{ position: 'relative', top: '-1px' }}>!</span>
                        </div>
                        <div className="error-content">
                            <h3>{error}</h3>
                            <p>Please double-check the ID from your physical document or email. Certificate IDs are accepted in uppercase or lowercase.</p>
                        </div>
                    </div>
                )}

                {/* ═══════ TRUST BADGES ═══════ */}
                <div className="verify-trust-badges">
                    <div className="trust-badge gold">
                        <ShieldCheck size={16} /> Official Records
                    </div>
                    <div className="trust-badge blue">
                        <DatabaseBackup size={16} /> Digitally Signed
                    </div>
                    <div className="trust-badge green">
                        <Fingerprint size={16} /> Identity Linked
                    </div>
                </div>
            </div>
        </div>
    )
}
