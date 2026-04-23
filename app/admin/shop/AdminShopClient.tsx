'use client'

import { useState } from 'react'
import type { ShopOrder, ShopOrderStatus } from '@/lib/shop/types'
import {
  SHOP_ORDER_STATUS_OPTIONS,
  getShopOrderStatusLabel,
} from '@/lib/shop/types'

import { mutateOrderStatus } from './actions'

const STATUS_STYLES: Record<
  ShopOrderStatus,
  { border: string; color: string; background: string }
> = {
  processing: {
    border: '#ffb703',
    color: '#ffb703',
    background: 'rgba(255,183,3,0.08)',
  },
  'payment-pending': {
    border: '#ffb703',
    color: '#ffb703',
    background: 'rgba(255,183,3,0.08)',
  },
  'pending-approval': {
    border: '#ff6b6b',
    color: '#ff6b6b',
    background: 'rgba(255,107,107,0.08)',
  },
  approved: {
    border: '#4caf50',
    color: '#4caf50',
    background: 'rgba(76,175,80,0.08)',
  },
  shipped: {
    border: '#4facfe',
    color: '#4facfe',
    background: 'rgba(79,172,254,0.08)',
  },
  delivered: {
    border: '#22c55e',
    color: '#22c55e',
    background: 'rgba(34,197,94,0.08)',
  },
  cancelled: {
    border: '#9ca3af',
    color: '#9ca3af',
    background: 'rgba(156,163,175,0.08)',
  },
}

export default function AdminShopClient({ rawOrders }: { rawOrders: ShopOrder[] }) {
  const [orders, setOrders] = useState(rawOrders)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ShopOrderStatus>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const filtered = orders.filter((order) => {
    const searchableText = [
      order.orderId,
      order.skfId,
      order.customerName,
      order.customerPhone,
      ...order.items.map((item) => `${item.name} ${item.size}`),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const matchesSearch = searchableText.includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter

    return matchesSearch && matchesStatus
  })
  const pendingApprovals = orders.filter((order) => order.status === 'pending-approval').length
  const processingCount = orders.filter((order) => order.status === 'processing').length
  const deliveredCount = orders.filter((order) => order.status === 'delivered').length
  const revenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0)

  const handleStatusChange = async (orderId: string, nextStatus: ShopOrderStatus) => {
    setUpdatingId(orderId)
    setError('')

    const response = await mutateOrderStatus(orderId, nextStatus)

    setUpdatingId(null)

    if (!response.success || !response.order) {
      setError('Failed to update the order status.')
      return
    }

    setOrders((current) =>
      current.map((order) =>
        order.orderId === orderId ? response.order : order
      )
    )
  }

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          marginBottom: '1.25rem',
        }}
      >
        {[
          ['Orders', orders.length],
          ['Pending Approval', pendingApprovals],
          ['Processing', processingCount],
          ['Delivered', deliveredCount],
          ['Revenue', `₹${revenue.toLocaleString()}`],
        ].map(([label, value]) => (
          <div
            key={label}
            style={{
              border: '1px solid #171717',
              background: '#070707',
              borderRadius: '16px',
              padding: '1rem 1.1rem',
            }}
          >
            <div style={{ color: '#666', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {label}
            </div>
            <div style={{ marginTop: '0.45rem', fontSize: '1.65rem', fontWeight: 700, color: '#fff' }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          padding: '1rem',
          borderRadius: '18px',
          border: '1px solid #171717',
          background: '#070707',
        }}
      >
        <input
          type="text"
          placeholder="Search by order ID, name, phone, SKF ID, or product..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          style={{
            flex: 1,
            minWidth: '280px',
            padding: '0.8rem',
            background: '#111',
            border: '1px solid #333',
            color: '#fff',
            borderRadius: '8px',
          }}
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as 'all' | ShopOrderStatus)
          }
          style={{
            padding: '0.8rem',
            background: '#111',
            border: '1px solid #333',
            color: '#fff',
            borderRadius: '8px',
          }}
        >
          <option value="all">All Statuses</option>
          {SHOP_ORDER_STATUS_OPTIONS.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.9rem 1rem',
            borderRadius: '12px',
            border: '1px solid rgba(255,107,107,0.3)',
            background: 'rgba(255,107,107,0.08)',
            color: '#ff9a9a',
          }}
        >
          {error}
        </div>
      ) : null}

      <div style={{ overflowX: 'auto', border: '1px solid #171717', borderRadius: '20px', background: '#070707' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            minWidth: '1040px',
          }}
        >
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)', color: '#aaa', fontSize: '0.9rem' }}>
              <th style={{ padding: '1rem', borderBottom: '1px solid #333' }}>Order</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid #333' }}>Customer</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid #333' }}>Items</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid #333' }}>Pricing</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid #333' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                  No orders found matching the current filters.
                </td>
              </tr>
            ) : (
              filtered.map((order) => {
                const statusStyle = STATUS_STYLES[order.status]

                return (
                  <tr
                    key={order.orderId}
                    style={{
                      borderBottom: '1px solid #222',
                      opacity: updatingId === order.orderId ? 0.55 : 1,
                    }}
                  >
                    <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: 700, color: '#fff' }}>{order.orderId}</div>
                      <div style={{ fontSize: '0.82rem', color: '#888', marginTop: '0.35rem' }}>
                        {new Date(order.createdAt).toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#777', marginTop: '0.6rem' }}>
                        {order.fulfillmentMethod === 'dojo-pickup'
                          ? 'Dojo Pickup'
                          : 'Shipping'}
                      </div>
                    </td>

                    <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: 700, color: 'var(--gold)' }}>
                        {order.customerName}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#ccc', marginTop: '0.35rem' }}>
                        {order.customerPhone || 'Phone not provided'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#888', marginTop: '0.6rem' }}>
                        {order.customerType === 'athlete'
                          ? `Athlete${order.skfId ? ` • ${order.skfId}` : ''}`
                          : 'Guest Checkout'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#777', marginTop: '0.6rem' }}>
                        {order.address.addressLine1}
                        {order.address.city
                          ? `, ${order.address.city}, ${order.address.state} ${order.address.pincode}`
                          : ''}
                      </div>
                    </td>

                    <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.55rem',
                        }}
                      >
                        {order.items.map((item) => (
                          <div key={item.variantId}>
                            <div style={{ color: '#fff', fontWeight: 600 }}>
                              {item.quantity}x {item.name}
                            </div>
                            <div style={{ color: '#888', fontSize: '0.8rem' }}>
                              {item.size}
                              {item.requiresApproval ? ' • Needs approval' : ''}
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                      <div style={{ color: '#fff', fontWeight: 700 }}>
                        ₹{order.total.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.35rem' }}>
                        Subtotal: ₹{order.subtotal.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>
                        Shipping: {order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}
                      </div>
                      {order.discount > 0 ? (
                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: '#4caf50',
                            marginTop: '0.25rem',
                          }}
                        >
                          Discount: -₹{order.discount.toLocaleString()}
                        </div>
                      ) : null}
                    </td>

                    <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          border: `1px solid ${statusStyle.border}`,
                          color: statusStyle.color,
                          background: statusStyle.background,
                          borderRadius: '999px',
                          padding: '0.35rem 0.8rem',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          marginBottom: '0.85rem',
                        }}
                      >
                        {getShopOrderStatusLabel(order.status)}
                      </div>

                      <select
                        value={order.status}
                        disabled={updatingId === order.orderId}
                        onChange={(event) =>
                          handleStatusChange(
                            order.orderId,
                            event.target.value as ShopOrderStatus
                          )
                        }
                        style={{
                          width: '100%',
                          padding: '0.7rem',
                          background: '#000',
                          border: '1px solid #333',
                          color: '#fff',
                          borderRadius: '8px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {SHOP_ORDER_STATUS_OPTIONS.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
