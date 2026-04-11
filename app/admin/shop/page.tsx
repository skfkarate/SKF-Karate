import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/server/auth/options'
import { redirect } from 'next/navigation'
import { getAllShopOrders } from '@/lib/server/sheets'
import AdminShopClient from './AdminShopClient'

export default async function AdminShopPage() {
    const session = await getServerSession(authOptions as any)
    if (!session || (session as any)?.role !== 'admin') {
        redirect('/api/auth/signin?callbackUrl=/admin/shop')
    }

    const orders = await getAllShopOrders()
    // Reversing to show latest first
    const sortedOrders = [...orders].reverse()

    return (
        <div className="admin-page">
            <h1 className="admin-page__title">Shop Orders</h1>
            <p className="admin-page__subtitle">Manage and update fulfillment status for merchandise orders.</p>
            
            <div className="admin-card">
                <AdminShopClient rawOrders={sortedOrders} />
            </div>
        </div>
    )
}
