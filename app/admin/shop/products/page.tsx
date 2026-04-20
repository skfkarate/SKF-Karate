import { getProducts } from '@/lib/server/repositories/products'
import AdminProductClient from './AdminProductClient'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
    const products = await getProducts()
    
    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#fff' }}>Shop Product Management</h1>
            <p style={{ color: '#aaa', marginBottom: '2rem' }}>Configure exclusives, belt-gates, and stock limits.</p>
            
            {/* The client component will handle the state and mutators */}
            <AdminProductClient initialProducts={products} />
        </div>
    )
}
