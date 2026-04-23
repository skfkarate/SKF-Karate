import Link from 'next/link'

import '../shop.css'

export default async function ShopSuccessPage(props: {
  searchParams: Promise<{ orderId?: string }>
}) {
  const searchParams = await props.searchParams
  const orderId = searchParams.orderId || 'Pending'

  return (
    <div className="obsidian-store">
      <div
        className="obsidian-container"
        style={{
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          className="obsidian-summary-card"
          style={{
            maxWidth: '640px',
            width: '100%',
            textAlign: 'center',
            padding: '2.5rem',
          }}
        >
          <div
            style={{
              color: '#4caf50',
              fontWeight: 900,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            Order Confirmed
          </div>
          <h1
            className="obsidian-header__title"
            style={{ fontSize: '2.8rem', marginBottom: '1rem' }}
          >
            Your Request Is Saved
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            The admin dashboard can now see this order immediately. Keep the order ID
            below for reference.
          </p>
          <div
            style={{
              marginBottom: '2rem',
              padding: '1rem 1.2rem',
              borderRadius: '14px',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.03)',
              color: '#fff',
              fontWeight: 800,
              letterSpacing: '1px',
            }}
          >
            {orderId}
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.8rem',
              flexWrap: 'wrap',
            }}
          >
            <Link href="/shop" className="obsidian-btn-add" style={{ width: 'auto', textDecoration: 'none', padding: '0.9rem 1.5rem' }}>
              Back to Shop
            </Link>
            <Link
              href="/portal/login?callbackUrl=/shop/orders"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.9rem 1.5rem',
                borderRadius: '12px',
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
              }}
            >
              Athlete Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
