import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getShopOrdersBySkfId } from '@/lib/server/sheets'
import '../shop.css'

const jwt = require('jsonwebtoken')

function verifyPortalToken(token: string): any {
    const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET
    if (!secret) return null
    try { return jwt.verify(token, secret) } catch { return null }
}

export default async function ShopOrdersPage(props: { searchParams: Promise<any> }) {
    const searchParams = await props.searchParams
    const cookieStore = await cookies()
    const token = cookieStore.get('skf_portal_token')?.value
    const session = token ? verifyPortalToken(token) : null

    if (!session || !session.skfId) {
        redirect('/portal/login?callbackUrl=/shop/orders')
    }

    const orders = await getShopOrdersBySkfId(session.skfId)
    const showSuccess = searchParams.success === 'true'

    return (
        <div className="obsidian-store">
            <div className="obsidian-container">
                
                {showSuccess && (
                    <div style={{ background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(76, 175, 80, 0.05) 100%)', border: '1px solid rgba(76, 175, 80, 0.4)', color: '#4caf50', padding: '1.5rem', borderRadius: '16px', marginBottom: '3rem', textAlign: 'center', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', boxShadow: '0 10px 30px rgba(76, 175, 80, 0.1)', backdropFilter: 'blur(12px)' }}>
                        ✓ Secure Payment Authorized. Your order is preparing for deployment.
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                    <h1 className="obsidian-header__title" style={{ fontSize: '3.5rem', margin: 0, textAlign: 'left' }}>Requisitions</h1>
                    <Link href="/shop" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '2px', transition: 'all 0.3s' }} onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#fff' }} onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}>
                        Return to Armory
                    </Link>
                </div>

                {orders.length === 0 ? (
                    <div style={{ padding: '4rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', color: 'rgba(255,255,255,0.4)', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
                        No tactical gear requested yet.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {orders.map(order => {
                            const items = JSON.parse(order.itemsJson || '[]')
                            
                            let statusColor = '#ffb703' // Processing (amber)
                            if (order.status.toLowerCase() === 'shipped') statusColor = '#4facfe' // blue
                            if (order.status.toLowerCase() === 'delivered') statusColor = '#4caf50' // green

                            return (
                                <details key={order.orderId} className="obsidian-summary-card" style={{ padding: '0', overflow: 'hidden' }}>
                                    <summary style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', listStyle: 'none', background: 'rgba(255,255,255,0.01)' }}>
                                        <div>
                                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem' }}>
                                                Initiated {new Date(order.date).toLocaleDateString()}
                                            </div>
                                            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-heading)', letterSpacing: '1px' }}>
                                                {order.orderId}
                                            </div>
                                        </div>
                                        
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--gold, #ffb703)', marginBottom: '0.5rem' }}>
                                                ₹{order.total.toLocaleString()}
                                            </div>
                                            <div style={{ display: 'inline-block', border: `1px solid ${statusColor}`, color: statusColor, padding: '0.3rem 1rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', background: `${statusColor}10` }}>
                                                {order.status}
                                            </div>
                                        </div>
                                    </summary>

                                    <div style={{ padding: '0 2rem 2rem', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '0.5rem', paddingTop: '2rem', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '4rem' }}>
                                        
                                        <div>
                                            <h3 style={{ margin: '0 0 1.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '2px' }}>Manifest</h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {items.map((it: any, idx: number) => (
                                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 600 }}>
                                                        <span><strong style={{ color: '#fff' }}>{it.quantity}x</strong> {it.name} ({it.size})</span>
                                                        <span style={{ color: 'rgba(255,255,255,0.6)' }}>₹{(it.price * it.quantity).toLocaleString()}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {order.discount > 0 && (
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', margin: '1rem 0', color: '#4caf50', fontWeight: 800 }}>
                                                    <span>Loyalty Discount</span>
                                                    <span>−₹{order.discount}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <h3 style={{ margin: '0 0 1.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '2px' }}>Drop Zone</h3>
                                            {(() => {
                                                const addr = JSON.parse(order.addressJson || '{}')
                                                return (
                                                    <div style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>
                                                        <strong style={{ color: '#fff', display: 'block', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>{addr.fullName}</strong>
                                                        <span style={{ display: 'block' }}>{addr.phone}</span>
                                                        <span style={{ display: 'block' }}>{addr.addressLine1}</span>
                                                        {addr.addressLine2 && <span style={{ display: 'block' }}>{addr.addressLine2}</span>}
                                                        <span style={{ display: 'block' }}>{addr.city}, {addr.state} {addr.pincode}</span>
                                                    </div>
                                                )
                                            })()}
                                        </div>

                                    </div>
                                </details>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
