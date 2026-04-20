'use client'

import { useState } from 'react'
import { ShopOrder } from '@/lib/server/sheets'
import { mutateOrderStatus } from './actions'

export default function AdminShopClient({ rawOrders }: { rawOrders: ShopOrder[] }) {
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('All')
    const [updatingId, setUpdatingId] = useState<string | null>(null)

    const filtered = rawOrders.filter(o => {
        const matchSearch = String(o.skfId).toLowerCase().includes(search.toLowerCase()) || 
                            o.orderId.toLowerCase().includes(search.toLowerCase())
        const matchStatus = statusFilter === 'All' || o.status === statusFilter
        return matchSearch && matchStatus
    })

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        setUpdatingId(orderId)
        await mutateOrderStatus(orderId, newStatus)
        setUpdatingId(null)
    }

    return (
        <div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <input 
                    type="text"
                    placeholder="Search by SKF ID or Order ID..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ flex: 1, padding: '0.8rem', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
                />
                <select 
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    style={{ padding: '0.8rem', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
                >
                    <option value="All">All Statuses</option>
                    <option value="Processing">Processing</option>
                    <option value="Processing (Payment Pending)">Payment Pending</option>
                    <option value="Pending Instructor Approval">Instructor Approval</option>
                    <option value="Approved">Approved</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                </select>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.05)', color: '#aaa', fontSize: '0.9rem' }}>
                            <th style={{ padding: '1rem', borderBottom: '1px solid #333' }}>Order ID / Date</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid #333' }}>SKF ID / Address</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid #333' }}>Items Summary</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid #333' }}>Total</th>
                            <th style={{ padding: '1rem', borderBottom: '1px solid #333' }}>Status Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No orders found matching criteria.</td>
                            </tr>
                        ) : filtered.map(order => {
                            const addr = JSON.parse(order.addressJson || '{}')
                            const items = JSON.parse(order.itemsJson || '[]')
                            
                            return (
                                <tr key={order.orderId} style={{ borderBottom: '1px solid #222', opacity: updatingId === order.orderId ? 0.5 : 1 }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 'bold' }}>{order.orderId}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#888' }}>{new Date(order.date).toLocaleDateString()}</div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 'bold', color: 'var(--gold)' }}>{order.skfId}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#ccc' }}>{addr.fullName}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#888' }}>{addr.city}, {addr.state} {addr.pincode}</div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontSize: '0.85rem', color: '#ccc', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            {items.map((it: any, i: number) => (
                                                <div key={i}>{it.quantity}x {it.size}</div>
                                            ))}
                                            {order.discount > 0 && <span style={{ color: '#4caf50', fontWeight: 'bold', fontSize: '0.8rem' }}>−₹{order.discount} pts disc.</span>}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>₹{order.total}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <select 
                                            value={order.status}
                                            disabled={updatingId === order.orderId}
                                            onChange={e => handleStatusChange(order.orderId, e.target.value)}
                                            style={{ 
                                                padding: '0.5rem', 
                                                background: '#000', 
                                                border: `1px solid ${order.status === 'Delivered' ? '#4caf50' : order.status === 'Shipped' ? '#4facfe' : order.status.includes('Approval') ? '#ff4444' : '#ffb703'}`, 
                                                color: order.status === 'Delivered' ? '#4caf50' : order.status === 'Shipped' ? '#4facfe' : order.status.includes('Approval') ? '#ff4444' : '#ffb703', 
                                                borderRadius: '4px',
                                                fontWeight: 'bold',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <option value="Processing">Processing</option>
                                            <option value="Processing (Payment Pending)">Payment Pending</option>
                                            <option value="Pending Instructor Approval">Instructor Approval</option>
                                            <option value="Approved">Approved</option>
                                            <option value="Shipped">Shipped</option>
                                            <option value="Delivered">Delivered</option>
                                        </select>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
