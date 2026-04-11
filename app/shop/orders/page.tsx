import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { verifyStudentJWT } from '@/lib/server/auth'
import { getShopOrdersBySkfId } from '@/lib/server/sheets'

export default async function ShopOrdersPage(props: { searchParams: Promise<any> }) {
    const searchParams = await props.searchParams
    const cookieStore = await cookies()
    const token = cookieStore.get('skf_student_token')?.value
    const session = token ? verifyStudentJWT(token) : null

    if (!session || !session.skfId) {
        redirect('/portal/login?callbackUrl=/shop/orders')
    }

    const orders = await getShopOrdersBySkfId(session.skfId)
    const showSuccess = searchParams.success === 'true'

    return (
        <div style={{ minHeight: '100vh', padding: '120px 2rem 4rem', background: '#050505', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                
                {showSuccess && (
                    <div style={{ background: '#4caf5020', border: '1px solid #4caf50', color: '#4caf50', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center', fontWeight: 'bold' }}>
                        Payment Successful! Your order has been placed.
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--gold)' }}>My Orders</h1>
                    <Link href="/shop" style={{ color: '#aaa', textDecoration: 'underline' }}>Back to Shop</Link>
                </div>

                {orders.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#888' }}>
                        You haven't placed any orders yet.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {orders.map(order => {
                            const items = JSON.parse(order.itemsJson || '[]')
                            
                            let statusColor = '#ffb703' // Processing (amber)
                            if (order.status.toLowerCase() === 'shipped') statusColor = '#4facfe' // blue
                            if (order.status.toLowerCase() === 'delivered') statusColor = '#4caf50' // green

                            return (
                                <details key={order.orderId} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                                    <summary style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', listStyle: 'none' }}>
                                        <div>
                                            <div style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                                                Order placed on {new Date(order.date).toLocaleDateString()}
                                            </div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                                                {order.orderId}
                                            </div>
                                        </div>
                                        
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--gold)' }}>
                                                ₹{order.total}
                                            </div>
                                            <div style={{ display: 'inline-block', marginTop: '0.4rem', border: `1px solid ${statusColor}`, color: statusColor, padding: '0.2rem 0.8rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                                {order.status}
                                            </div>
                                        </div>
                                    </summary>

                                    <div style={{ padding: '0 1.5rem 1.5rem', borderTop: '1px solid #222', marginTop: '0.5rem', paddingTop: '1.5rem', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem' }}>
                                        
                                        <div>
                                            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', color: '#aaa' }}>Items</h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                                {items.map((it: any, idx: number) => (
                                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                                        <span>{it.quantity}x {it.name} ({it.size})</span>
                                                        <span style={{ color: '#ccc' }}>₹{it.price * it.quantity}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {order.discount > 0 && (
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', margin: '0.8rem 0', color: '#4caf50' }}>
                                                    <span>Points Discount</span>
                                                    <span>−₹{order.discount}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', color: '#aaa' }}>Shipping Adddress</h3>
                                            {(() => {
                                                const addr = JSON.parse(order.addressJson || '{}')
                                                return (
                                                    <div style={{ fontSize: '0.9rem', color: '#ccc', lineHeight: 1.6 }}>
                                                        <strong style={{ color: '#fff', display: 'block' }}>{addr.fullName}</strong>
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
