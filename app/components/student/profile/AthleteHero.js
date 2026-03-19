'use client'

import { styles } from './studentData'

// Dark/light split hero card for the athlete profile
export default function AthleteHero({ athlete, primaryCategory }) {
    return (
        <div style={styles.heroCard}>
            {/* Left - Dark Card */}
            <div style={styles.leftPanel}>
                <div style={styles.photoWrap}>
                    <img
                        src={athlete.photo}
                        alt={athlete.name}
                        style={styles.photo}
                        onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 150"><rect fill="%23555" width="140" height="150"/><text x="70" y="80" text-anchor="middle" fill="white" font-size="14">Photo</text></svg>' }}
                    />
                </div>
                <h1 style={styles.athleteName}>{athlete.name}</h1>
                <div style={styles.countryBlock}>
                    <img src={athlete.countryFlag} alt={athlete.country} style={styles.flagImg} />
                    <div>
                        <div style={styles.statRow}><span style={styles.statLabel}>Country:</span><span style={styles.statValue}>{athlete.country}</span></div>
                        <div style={styles.statRow}><span style={styles.statLabel}>ID:</span><span style={styles.statValue}>{athlete.id}</span></div>
                        <div style={styles.statRow}><span style={styles.statLabel}>Age:</span><span style={styles.statValue}>{athlete.age}</span></div>
                        <div style={styles.statRow}><span style={styles.statLabel}>Total Bouts:</span><span style={styles.statValue}>{athlete.totalBouts}</span></div>
                        <div style={styles.statRow}><span style={styles.statLabel}>Win Rate:</span><span style={styles.statValue}>{athlete.winRate}</span></div>
                    </div>
                </div>
            </div>

            {/* Right - Light Card */}
            <div style={styles.rightPanel}>
                <h2 style={styles.category}>{primaryCategory.name}</h2>
                <div style={styles.rankRow}>
                    {primaryCategory.rank && (
                        <span style={styles.rankCircle}>{primaryCategory.rank}</span>
                    )}
                    <span style={styles.rankLabel}>RANK</span>
                    <span style={styles.rankPoints}>{primaryCategory.points} points</span>
                </div>
                <HonoursInline honours={primaryCategory.honours} />
            </div>
        </div>
    )
}

// Inline honours for the hero (no title — it's embedded)
function HonoursInline({ honours }) {
    if (!honours || honours.length === 0) return null
    return (
        <div>
            <h3 style={styles.honoursTitle}>Honours</h3>
            {honours.map((honour, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <MedalCircle count={honour.gold} type="gold" />
                    <MedalCircle count={honour.silver} type="silver" />
                    <MedalCircle count={honour.bronze} type="bronze" />
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#333', marginLeft: 12 }}>
                        {honour.name}
                    </span>
                </div>
            ))}
        </div>
    )
}

function MedalCircle({ count, type }) {
    const colors = { gold: '#B8860B', silver: '#808080', bronze: '#228B22' }
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 38, height: 38, borderRadius: '50%',
            backgroundColor: colors[type], color: '#fff',
            fontSize: 16, fontWeight: 700,
        }}>{count}</span>
    )
}
