import { requireAdminSession } from '@/lib/server/auth/session'
import { getProducts } from '@/lib/server/repositories/shop'
import AdminProductClient from './AdminProductClient'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
  await requireAdminSession('admin')

  const products = await getProducts()

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#fff' }}>
        Shop Product Management
      </h1>
      <p style={{ color: '#aaa', marginBottom: '2rem' }}>
        Create products, manage stock, control guest access, and set belt restrictions
        from the admin dashboard.
      </p>

      <AdminProductClient initialProducts={products} />
    </div>
  )
}
