'use client'

// Displays medal circles (gold/silver/bronze) with tournament names
export default function HonoursDisplay({ honours }) {
    if (!honours || honours.length === 0) return null

    return (
        <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: '#8B0000', marginBottom: 18, margin: '0 0 18px 0' }}>
                Honours
            </h3>
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
            fontSize: 16, fontWeight: 700, marginRight: 0,
        }}>{count}</span>
    )
}
