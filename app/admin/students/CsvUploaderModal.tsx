'use client'

import { useState } from 'react'
import Papa from 'papaparse'
import { createStudentSchema } from '@/lib/validators'
import { FaUpload, FaTimes, FaCheckCircle, FaExclamationCircle, FaSpinner } from 'react-icons/fa'

export default function CsvUploaderModal({ isOpen, onClose, onComplete }: { isOpen: boolean, onClose: () => void, onComplete: () => void }) {
    const [rows, setRows] = useState<any[]>([])
    const [status, setStatus] = useState<'idle' | 'preview' | 'importing' | 'complete'>('idle')
    const [progress, setProgress] = useState(0)
    const [results, setResults] = useState({ success: 0, failed: 0, failedList: [] as string[] })

    if (!isOpen) return null

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const parsed = results.data.map((row: any) => {
                    const candidate = {
                        name: row.name,
                        dob: row.dob,
                        branch: row.branch,
                        batch: row.batch,
                        belt: row.belt,
                        parentName: row.parent_name,
                        phone: row.phone,
                        monthlyFee: Number(row.monthly_fee) || 0,
                        photoConsent: row.photo_consent?.toLowerCase() === 'true',
                        enrolledDate: row.enrolled_date || new Date().toISOString().split('T')[0]
                    }

                    const validation = createStudentSchema.safeParse(candidate)
                    return {
                        original: candidate,
                        isValid: validation.success,
                        data: validation.success ? validation.data : null,
                        error: validation.success ? null : validation.error.errors[0].message + ' (' + validation.error.errors[0].path.join('.') + ')'
                    }
                })
                setRows(parsed)
                setStatus('preview')
            }
        })
    }

    const validRows = rows.filter(r => r.isValid)
    
    const handleImport = async () => {
        setStatus('importing')
        let successCount = 0
        let failCount = 0
        const failures: string[] = []

        // Chunking by 10 to avoid hitting limits
        const chunkSize = 10
        for (let i = 0; i < validRows.length; i += chunkSize) {
            const chunk = validRows.slice(i, i + chunkSize)
            
            // Execute chunk sequentially
            for (const r of chunk) {
                try {
                    const res = await fetch('/api/admin/students', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(r.data)
                    })
                    if (res.ok) {
                        successCount++
                    } else {
                        failCount++
                        failures.push(r.data!.name + ' (API Error)')
                    }
                } catch (e) {
                    failCount++
                    failures.push(r.data!.name + ' (Network Error)')
                }
                setProgress(successCount + failCount)
            }
        }

        setResults({ success: successCount, failed: failCount, failedList: failures })
        setStatus('complete')
    }

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ background: '#050505', border: '1px solid #333', borderRadius: '12px', width: '100%', maxWidth: '900px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#fff' }}>CSV Import</h2>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1.2rem' }} disabled={status === 'importing'}><FaTimes /></button>
                </div>

                <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
                    {status === 'idle' && (
                        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                            <FaUpload style={{ fontSize: '3rem', color: '#333', marginBottom: '1rem' }} />
                            <p style={{ color: '#ccc', marginBottom: '1.5rem' }}>Upload a CSV file to bulk import students.</p>
                            <label style={{ background: '#fff', color: '#000', padding: '0.8rem 2rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                Select CSV File
                                <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} />
                            </label>
                            <p style={{ marginTop: '2rem', fontSize: '0.85rem', color: '#666' }}>Expected headers: name, dob, branch, batch, belt, parent_name, phone, monthly_fee, photo_consent, enrolled_date</p>
                        </div>
                    )}

                    {status === 'preview' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                                <p style={{ margin: 0, color: '#ccc' }}>Found <strong>{rows.length}</strong> rows. <strong style={{ color: '#4caf50' }}>{validRows.length} valid</strong>, <strong style={{ color: '#ff4444' }}>{rows.length - validRows.length} invalid</strong>.</p>
                                <button onClick={handleImport} disabled={validRows.length === 0} style={{ background: '#fff', color: '#000', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '4px', fontWeight: 'bold', cursor: validRows.length > 0 ? 'pointer' : 'not-allowed', opacity: validRows.length > 0 ? 1 : 0.5 }}>
                                    Import {validRows.length} Valid Rows
                                </button>
                            </div>
                            
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                <thead>
                                    <tr style={{ background: '#111', color: '#888' }}>
                                        <th style={{ padding: '0.8rem', textAlign: 'left' }}>Status</th>
                                        <th style={{ padding: '0.8rem', textAlign: 'left' }}>Name</th>
                                        <th style={{ padding: '0.8rem', textAlign: 'left' }}>Branch</th>
                                        <th style={{ padding: '0.8rem', textAlign: 'left' }}>Phone</th>
                                        <th style={{ padding: '0.8rem', textAlign: 'left' }}>Info/Error</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((r, i) => (
                                        <tr key={i} style={{ background: r.isValid ? 'rgba(76, 175, 80, 0.05)' : 'rgba(214, 40, 40, 0.1)', borderBottom: '1px solid #222' }}>
                                            <td style={{ padding: '0.8rem' }}>{r.isValid ? <FaCheckCircle color="#4caf50" /> : <FaExclamationCircle color="#ff4444" />}</td>
                                            <td style={{ padding: '0.8rem', color: '#fff' }}>{r.original.name}</td>
                                            <td style={{ padding: '0.8rem', color: '#ccc' }}>{r.original.branch}</td>
                                            <td style={{ padding: '0.8rem', color: '#ccc' }}>{r.original.phone}</td>
                                            <td style={{ padding: '0.8rem', color: r.isValid ? '#666' : '#ff4444' }}>{r.error || 'Valid'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {status === 'importing' && (
                        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                            <FaSpinner className="spin" style={{ fontSize: '3rem', color: 'var(--gold)', marginBottom: '1.5rem' }} />
                            <h3 style={{ color: '#fff' }}>Importing Data</h3>
                            <p style={{ color: '#ccc' }}>{progress} of {validRows.length} complete...</p>
                        </div>
                    )}

                    {status === 'complete' && (
                        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                            <FaCheckCircle style={{ fontSize: '4rem', color: '#4caf50', marginBottom: '1.5rem' }} />
                            <h3 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.8rem' }}>Import Complete</h3>
                            <p style={{ color: '#ccc', fontSize: '1.1rem' }}>
                                <strong>{results.success}</strong> imported successfully. <strong style={{ color: '#ff4444' }}>{results.failed}</strong> failed.
                            </p>
                            
                            {results.failedList.length > 0 && (
                                <div style={{ background: 'rgba(214, 40, 40, 0.1)', border: '1px solid rgba(214, 40, 40, 0.3)', padding: '1rem', borderRadius: '8px', marginTop: '1.5rem', textAlign: 'left' }}>
                                    <h4 style={{ color: '#ff4444', margin: '0 0 0.5rem 0' }}>Failed Entries:</h4>
                                    <ul style={{ color: '#ff8888', margin: 0, paddingLeft: '1.5rem', fontSize: '0.9rem' }}>
                                        {results.failedList.map((f, i) => <li key={i}>{f}</li>)}
                                    </ul>
                                </div>
                            )}

                            <button onClick={() => { onClose(); onComplete(); }} style={{ background: '#fff', color: '#000', border: 'none', padding: '0.8rem 2.5rem', borderRadius: '4px', fontWeight: 'bold', fontSize: '1rem', marginTop: '2rem', cursor: 'pointer' }}>
                                Close
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}
