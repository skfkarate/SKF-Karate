'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaCoins } from 'react-icons/fa'
import { supabaseClient, isSupabaseReady } from '@/lib/server/supabase'

export default function PointsBadge({ skfId }: { skfId: string }) {
    const [balance, setBalance] = useState<number | null>(null)
    const [toastMsg, setToastMsg] = useState('')

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const res = await fetch('/api/points/balance')
                if (res.ok) {
                    const data = await res.json()
                    setBalance(data.balance)
                }
            } catch (e) {
                console.error(e)
            }
        }
        
        fetchBalance()

        if (isSupabaseReady()) {
            const subscription = supabaseClient
                .channel('points_channel')
                .on('postgres_changes', { 
                    event: 'INSERT', 
                    schema: 'public', 
                    table: 'point_transactions', 
                    filter: `skf_id=eq.${skfId}` 
                }, payload => {
                    const tx = payload.new
                    if (tx.type === 'EARN') {
                        setToastMsg(`+${tx.points} points for ${tx.reason.replace('_', ' ')}!`)
                        setBalance(tx.balance_after)
                        setTimeout(() => setToastMsg(''), 5000)
                    }
                })
                .subscribe()

            return () => {
                supabaseClient.removeChannel(subscription)
            }
        }
    }, [skfId])

    if (balance === null) return null

    return (
        <div style={{ position: 'relative' }}>
            {toastMsg && (
                <div style={{
                    position: 'absolute',
                    top: '110%',
                    right: 0,
                    background: 'rgba(255, 183, 3, 0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid var(--gold)',
                    color: 'var(--gold)',
                    padding: '0.4rem 1rem',
                    borderRadius: '50px',
                    whiteSpace: 'nowrap',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    animation: 'slideDown 0.3s ease-out, fadeOut 0.5s ease-in 4.5s forwards',
                    zIndex: 1000
                }}>
                    {toastMsg}
                </div>
            )}
            <Link href="/portal/points" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                background: 'rgba(255,255,255,0.05)', 
                border: '1px solid rgba(255,183,3,0.3)', 
                padding: '0.4rem 0.8rem', 
                borderRadius: '50px', 
                textDecoration: 'none',
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                transition: 'all 0.2s',
                cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,183,3,0.1)'
                e.currentTarget.style.borderColor = 'var(--gold)'
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                e.currentTarget.style.borderColor = 'rgba(255,183,3,0.3)'
            }}>
                <FaCoins style={{ color: 'var(--gold, #ffb703)' }} />
                <span>{balance}</span>
            </Link>
            <style>{`
                @keyframes slideDown {
                    from { transform: translateY(-10px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; visibility: hidden; }
                }
            `}</style>
        </div>
    )
}
