import { requireAdminSession } from '@/lib/server/auth/session'
import { getAllShopOrders } from '@/lib/server/repositories/shop'

import AdminShopClient from './AdminShopClient'

export const dynamic = 'force-dynamic'

export default async function AdminShopPage() {
  await requireAdminSession('admin')

  const orders = await getAllShopOrders()

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#050505',
        color: '#fff',
        paddingBottom: '4rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <header style={{ borderBottom: '1px solid #111', padding: '2.2rem 2.5rem', background: '#000' }}>
        <p style={{ color: '#666', fontSize: '0.8rem', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '1rem', textTransform: 'uppercase' }}>
          Commerce / Orders
        </p>
        <h1 style={{ fontSize: '2.6rem', fontWeight: 500, margin: 0, letterSpacing: '-0.04em' }}>
          Shop Orders
        </h1>
        <p style={{ color: '#888', maxWidth: '760px', margin: '0.9rem 0 0', lineHeight: 1.6 }}>
          Review athlete and guest orders, track approvals, and update fulfilment states from a layout that matches the rest of the admin system.
        </p>
      </header>

      <div style={{ padding: '2rem 2.5rem' }}>
        <AdminShopClient rawOrders={orders} />
      </div>
    </div>
  )
}
