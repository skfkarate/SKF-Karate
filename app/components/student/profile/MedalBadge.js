'use client'

// Medal badge for competition ranks (1st=gold, 2nd=silver, 3rd=bronze)
export default function MedalBadge({ rank }) {
    if (rank === '*' || rank === '-') {
        return <span style={{ fontSize: 14, fontWeight: 500, color: '#999' }}>{rank}</span>
    }
    const numRank = typeof rank === 'number' ? rank : parseInt(rank)
    const colors = { 1: '#B8860B', 2: '#C0C0C0', 3: '#CD7F32' }
    if (numRank >= 1 && numRank <= 3) {
        return (
            <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32, borderRadius: '50%',
                backgroundColor: colors[numRank], color: '#fff',
                fontSize: 15, fontWeight: 700,
            }}>{numRank}</span>
        )
    }
    return <span style={{ fontSize: 14, fontWeight: 500, color: '#666' }}>{rank}</span>
}
