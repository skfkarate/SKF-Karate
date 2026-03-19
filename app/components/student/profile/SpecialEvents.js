'use client'

import { styles } from './studentData'

// Special events — seminars, training camps, workshops
export default function SpecialEvents({ events }) {
    if (!events || events.length === 0) return null

    const typeBadgeColors = {
        'Seminar': { bg: '#fff3e0', color: '#e65100', border: '#ffcc80' },
        'Training Camp': { bg: '#e8f5e9', color: '#2e7d32', border: '#a5d6a7' },
        'Workshop': { bg: '#e3f2fd', color: '#1565c0', border: '#90caf9' },
    }

    return (
        <div style={{ marginBottom: 60 }}>
            {/* Header bar */}
            <div style={styles.categoryHeaderBar}>
                <h2 style={styles.categoryHeaderName}>Special Events &amp; Training</h2>
            </div>

            {/* Event cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {events.map((event, idx) => {
                    const badge = typeBadgeColors[event.type] || typeBadgeColors['Workshop']
                    return (
                        <div key={idx} style={{
                            backgroundColor: '#fafafa',
                            border: '1px solid #eee',
                            borderRadius: 10,
                            padding: '24px 28px',
                            transition: 'box-shadow 0.2s ease',
                        }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                            {/* Top row: badge + date */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '4px 14px',
                                    borderRadius: 20,
                                    fontSize: 12,
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    backgroundColor: badge.bg,
                                    color: badge.color,
                                    border: `1px solid ${badge.border}`,
                                }}>{event.type}</span>
                                <span style={{ fontSize: 14, color: '#888' }}>{event.date}</span>
                            </div>

                            {/* Title */}
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#222', margin: '0 0 6px 0', lineHeight: 1.3 }}>
                                {event.title}
                            </h3>

                            {/* Location */}
                            <p style={{ fontSize: 14, color: '#888', margin: '0 0 10px 0', fontWeight: 500 }}>
                                📍 {event.location}
                            </p>

                            {/* Description */}
                            <p style={{ fontSize: 15, color: '#555', margin: 0, lineHeight: 1.6 }}>
                                {event.description}
                            </p>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
