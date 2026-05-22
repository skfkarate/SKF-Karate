import AdminSidebar from "@/app/_components/admin/AdminSidebar";
import { getAdminSession } from "@/lib/utils/auth";
import { buildNoIndexMetadata } from "@/data/constants/seo";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_ROLES = new Set(['admin', 'instructor'])

export const metadata = buildNoIndexMetadata(
  '/admin',
  'SKF Karate private administration area for karate classes, students, events, certificates, shop, fees, and website operations.'
)

export default async function AdminLayout({ children }) {
  const session = await getAdminSession()
  if (!session) {
    // If not logged in, just render the dark wrapper for the login page
    // The actual protected pages will call requireAdminSession() and redirect if needed.

    return (
      <div style={{ minHeight: '100dvh', background: '#0a0a0a', color: '#fff' }}>
        {children}
      </div>
    )
  }

  if (!ADMIN_ROLES.has(String(session.user?.role || ''))) {
    redirect('/admin/login')
  }

  return (
    <div style={{
      minHeight: '100dvh',
      width: '100%',
      overflowX: 'auto',
      background: '#000',
      color: '#fff',
      WebkitOverflowScrolling: 'touch'
    }}>
      <div style={{ display: 'flex', minHeight: '100dvh', minWidth: '1280px', background: '#000', color: '#fff' }}>
        {/* Persistent Sidebar */}
        <AdminSidebar />
        
        {/* Main Content Area */}
        <main style={{
          flex: 1,
          minHeight: '100dvh',
          background: '#000'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}
