'use client'

import { styles } from './studentData'
import HonoursDisplay from './HonoursDisplay'
import ResultsTable from './ResultsTable'

// Reusable category block for secondary categories (grey header bar + honours + table)
export default function CategoryBlock({ category }) {
    return (
        <div style={{ marginBottom: 60 }}>
            {/* Grey header bar with category name */}
            <div style={styles.categoryHeaderBar}>
                <h2 style={styles.categoryHeaderName}>{category.name}</h2>
                {category.rank && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: 30, height: 30, borderRadius: '50%',
                            backgroundColor: '#2e7d32', color: '#fff', fontSize: 16, fontWeight: 700,
                        }}>{category.rank}</span>
                        <span style={{ fontSize: 16, fontWeight: 700, color: '#333' }}>RANK</span>
                        <span style={{ fontSize: 16, color: '#666' }}>{category.points} points</span>
                    </div>
                )}
            </div>

            {/* Honours */}
            <HonoursDisplay honours={category.honours} />

            {/* Results table with independent filter */}
            <ResultsTable
                results={category.results}
                totalPoints={category.totalPoints}
                actualPoints={category.points}
            />
        </div>
    )
}
