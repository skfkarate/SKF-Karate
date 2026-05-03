import Link from 'next/link'
import { Check, ShoppingBag, ArrowRight } from 'lucide-react'
import '../shop.css'

export default async function ShopSuccessPage(props: {
  searchParams: Promise<{ orderId?: string }>
}) {
  const searchParams = await props.searchParams
  const orderId = searchParams.orderId || 'Pending'

  return (
    <div className="obsidian-store">
      <div className="obsidian-container" style={{ minHeight: '90dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '4rem' }}>
        <div className="shop-page-wrap" style={{ maxWidth: '800px', width: '100%' }}>

          <div className="obsidian-summary-card" style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'rgba(255, 255, 255, 0.01)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Success Icon */}
            <div style={{
              width: '100px',
              height: '100px',
              background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2.5rem',
              color: '#fff',
              boxShadow: '0 20px 40px rgba(76, 175, 80, 0.2)',
              position: 'relative',
              zIndex: 2
            }}>
              <Check size={48} strokeWidth={3} />
            </div>

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{
                color: '#4caf50',
                fontWeight: 800,
                letterSpacing: '4px',
                textTransform: 'uppercase',
                fontSize: '0.85rem',
                marginBottom: '1rem'
              }}>
                Payment Received
              </div>

              <h1 className="obsidian-header__title" style={{
                fontSize: 'clamp(2.5rem, 8vw, 4rem)',
                marginBottom: '1.5rem',
                background: 'linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.5) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Order Confirmed
              </h1>

              <p style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: '1.1rem',
                lineHeight: 1.7,
                marginBottom: '3rem',
                maxWidth: '500px',
                margin: '0 auto 3rem'
              }}>
                Thank you for your purchase. Your order has been placed successfully and is now being processed by our team.
              </p>

              {/* Order ID Box */}
              <div style={{
                marginBottom: '4rem',
                padding: '1.5rem',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.02)',
                display: 'inline-flex',
                flexDirection: 'column',
                gap: '0.5rem',
                minWidth: '280px'
              }}>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }}>Order Reference</span>
                <span style={{ color: '#fff', fontWeight: 800, letterSpacing: '1px', fontSize: '1.2rem' }}>{orderId}</span>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.25rem',
              }}>
                <Link href="/shop" className="shop-cta-pill" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  maxWidth: '320px',
                  textDecoration: 'none'
                }}>
                  <ShoppingBag size={18} />
                  Continue Shopping
                </Link>

                <Link href="/shop/orders" style={{
                  color: 'rgba(255,255,255,0.5)',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'color 0.2s'
                }}
                className="shop-link-hover-white"
                >
                  View My Orders <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Background Accent */}
            <div style={{
              position: 'absolute',
              top: '-10%',
              right: '-10%',
              width: '40%',
              height: '40%',
              background: 'radial-gradient(circle, rgba(76, 175, 80, 0.05) 0%, transparent 70%)',
              filter: 'blur(40px)',
              zIndex: 1
            }} />
          </div>

        </div>
      </div>
    </div>
  )
}
