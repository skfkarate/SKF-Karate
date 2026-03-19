'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { styles } from './studentData'
import MedalBadge from './MedalBadge'

// Competition results table with independent filter and totals
export default function ResultsTable({ results, totalPoints, actualPoints, showFilter = true }) {
    const [filter, setFilter] = useState('')

    const filteredResults = useMemo(() => {
        if (!filter.trim()) return results
        const q = filter.toLowerCase()
        return results.filter(r =>
            r.event.toLowerCase().includes(q) ||
            r.type.toLowerCase().includes(q) ||
            r.date.includes(q)
        )
    }, [filter, results])

    return (
        <div>
            {/* Filter */}
            {showFilter && (
                <div style={styles.filterWrap}>
                    <input
                        type="text"
                        placeholder="Filter events by name or type..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        style={styles.filterInput}
                    />
                    <div style={styles.filterIcon}>
                        <Search size={20} />
                    </div>
                </div>
            )}

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Date</th>
                            <th style={styles.th}>Event</th>
                            <th style={styles.th}>Type</th>
                            <th style={styles.th}>Category</th>
                            <th style={styles.thCenter}>Event Factor</th>
                            <th style={styles.thCenter}>View</th>
                            <th style={styles.thCenter}>Rank</th>
                            <th style={styles.thCenter}>Wins</th>
                            <th style={styles.thCenter}>Points</th>
                            <th style={styles.thCenter}>Actual</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredResults.map((r, idx) => (
                            <tr key={idx} style={{ cursor: 'default' }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8f8f8'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <td style={styles.tdDate}>{r.date}</td>
                                <td style={styles.td}>
                                    <div style={styles.eventCellWrap}>
                                        <img src={r.flag} alt="" style={styles.tableFlag} />
                                        <span>{r.event}</span>
                                    </div>
                                </td>
                                <td style={styles.td}>{r.type}</td>
                                <td style={styles.td}>{r.category}</td>
                                <td style={styles.tdCenter}>{r.factor}</td>
                                <td style={styles.tdCenter}>
                                    {r.hasView && <Search size={18} style={{ color: '#999', cursor: 'pointer', margin: '0 auto', display: 'block' }} />}
                                </td>
                                <td style={styles.tdCenter}><MedalBadge rank={r.rank} /></td>
                                <td style={styles.tdCenter}>{r.wins}</td>
                                <td style={styles.tdCenter}>{r.points}</td>
                                <td style={{ ...styles.tdCenter, color: r.actual > 0 ? '#8B0000' : '#444', fontWeight: r.actual > 0 ? 600 : 400 }}>{r.actual}</td>
                            </tr>
                        ))}
                        {totalPoints !== undefined && (
                            <tr style={styles.totalsRow}>
                                <td style={styles.totalsTd}></td>
                                <td style={styles.totalsTd} colSpan={7}>Total Points: {totalPoints}</td>
                                <td style={{ ...styles.totalsTd, textAlign: 'center' }} colSpan={2}>Actual: {actualPoints}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
