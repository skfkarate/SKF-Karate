'use client'

import { useState } from 'react'
import { FaDownload, FaSearch } from 'react-icons/fa'

// In a real app this would be fetched via an API / Server Action reading from Google Sheets
const dummyEnrollments = [
    { branch: 'Koramangala HQ', student: 'Rahul Sharma', skfId: 'NEW', tier: 'Month 1', amount: 1500, date: '2026-03-01T10:30:00Z', status: 'PAID' },
    { branch: 'Koramangala HQ', student: 'Neshu Ram', skfId: 'SKF25MP001', tier: 'Full Camp', amount: 0, date: '2026-03-02T11:15:00Z', status: 'FREE' },
    { branch: 'Whitefield', student: 'Aisha K', skfId: 'NEW', tier: 'Month 2', amount: 1200, date: '2026-03-05T09:20:00Z', status: 'PAID' }
]

export default function AdminSummerCamp() {
    const [branchFilter, setBranchFilter] = useState('All')
    
    const filteredEnrollments = branchFilter === 'All' 
        ? dummyEnrollments 
        : dummyEnrollments.filter(e => e.branch === branchFilter)

    const handleExport = () => {
        const headers = ["Branch", "Student Name", "SKF ID", "Tier", "Amount", "Date", "Status"]
        const csvRows = [headers.join(",")]

        filteredEnrollments.forEach(e => {
            csvRows.push(`${e.branch},${e.student},${e.skfId},${e.tier},${e.amount},${new Date(e.date).toLocaleDateString()},${e.status}`)
        })

        const csvString = csvRows.join("\n")
        const blob = new Blob([csvString], { type: "text/csv" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.hidden = true
        a.href = url
        a.download = `SummerCamp_Enrollments_${branchFilter}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', margin: 0, fontFamily: 'var(--font-heading)' }}>Summer Camp Admin</h1>
                <button onClick={handleExport} className="btn" style={{ background: 'var(--gold)', color: '#000', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    <FaDownload /> Export CSV
                </button>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <FaSearch style={{ color: 'rgba(255,255,255,0.4)' }} />
                <select 
                    value={branchFilter} 
                    onChange={e => setBranchFilter(e.target.value)}
                    style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1rem', outline: 'none', cursor: 'pointer' }}
                >
                    <option value="All" style={{ color: '#000' }}>All Branches</option>
                    <option value="Koramangala HQ" style={{ color: '#000' }}>Koramangala HQ</option>
                    <option value="Whitefield" style={{ color: '#000' }}>Whitefield</option>
                    <option value="JP Nagar" style={{ color: '#000' }}>JP Nagar</option>
                </select>
            </div>

            <div style={{ overflowX: 'auto', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <th style={{ padding: '1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.85rem' }}>Branch</th>
                            <th style={{ padding: '1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.85rem' }}>Student Name</th>
                            <th style={{ padding: '1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.85rem' }}>SKF ID</th>
                            <th style={{ padding: '1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.85rem' }}>Tier</th>
                            <th style={{ padding: '1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.85rem' }}>Amount</th>
                            <th style={{ padding: '1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.85rem' }}>Date</th>
                            <th style={{ padding: '1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.85rem' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEnrollments.map((e, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s', cursor: 'default' }}
                                onMouseEnter={(evt) => evt.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                onMouseLeave={(evt) => evt.currentTarget.style.background = 'transparent'}>
                                <td style={{ padding: '1.5rem' }}>{e.branch}</td>
                                <td style={{ padding: '1.5rem', fontWeight: 'bold' }}>{e.student}</td>
                                <td style={{ padding: '1.5rem', color: e.skfId === 'NEW' ? 'var(--gold)' : '#fff' }}>{e.skfId}</td>
                                <td style={{ padding: '1.5rem' }}>
                                    <span style={{ display: 'inline-block', background: e.tier === 'Full Camp' ? 'rgba(214, 40, 40, 0.2)' : 'rgba(255,255,255,0.1)', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.85rem', color: e.tier === 'Full Camp' ? 'var(--crimson)' : '#fff' }}>
                                        {e.tier}
                                    </span>
                                </td>
                                <td style={{ padding: '1.5rem' }}>₹{e.amount}</td>
                                <td style={{ padding: '1.5rem', color: 'rgba(255,255,255,0.6)' }}>{new Date(e.date).toLocaleDateString()}</td>
                                <td style={{ padding: '1.5rem' }}>
                                    <span style={{ display: 'inline-block', background: 'rgba(76, 175, 80, 0.1)', color: '#4caf50', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                        {e.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {filteredEnrollments.length === 0 && (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.4)', fontSize: '1.1rem' }}>
                                    No enrollments found for this branch.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
