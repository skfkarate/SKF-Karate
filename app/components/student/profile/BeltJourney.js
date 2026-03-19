'use client'

import { beltColors, styles } from './studentData'

// Belt examination journey — visual progression from white to current belt
export default function BeltJourney({ examinations }) {
    if (!examinations || examinations.length === 0) return null

    return (
        <div style={{ marginBottom: 60 }}>
            {/* Header bar */}
            <div style={styles.categoryHeaderBar}>
                <h2 style={styles.categoryHeaderName}>Belt Examinations</h2>
            </div>

            {/* Timeline-style table */}
            <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Date</th>
                            <th style={styles.th}>Belt</th>
                            <th style={styles.th}>Grade</th>
                            <th style={styles.th}>Examiner</th>
                            <th style={styles.th}>Dojo</th>
                            <th style={styles.thCenter}>Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        {examinations.map((exam, idx) => (
                            <tr key={idx}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8f8f8'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <td style={styles.tdDate}>{exam.date}</td>
                                <td style={styles.td}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <BeltIndicator color={beltColors[exam.belt] || '#ccc'} belt={exam.belt} />
                                        <span style={{ fontWeight: 600 }}>{exam.belt} Belt</span>
                                    </div>
                                </td>
                                <td style={{ ...styles.td, fontWeight: 500 }}>{exam.grade}</td>
                                <td style={styles.td}>{exam.examiner}</td>
                                <td style={styles.td}>{exam.dojo}</td>
                                <td style={styles.tdCenter}>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '4px 16px',
                                        borderRadius: 20,
                                        fontSize: 13,
                                        fontWeight: 700,
                                        backgroundColor: exam.result === 'Pass' ? '#e8f5e9' : '#ffebee',
                                        color: exam.result === 'Pass' ? '#2e7d32' : '#c62828',
                                    }}>{exam.result}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

// Visual belt color indicator
function BeltIndicator({ color, belt }) {
    const isWhite = belt === 'White'
    return (
        <div style={{
            width: 36,
            height: 14,
            borderRadius: 3,
            backgroundColor: color,
            border: isWhite ? '1px solid #ccc' : 'none',
            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
            flexShrink: 0,
        }} />
    )
}
