import AdminSidebar from "@/app/_components/admin/AdminSidebar";
import { getAdminSession } from "@/lib/utils/auth";
import { redirect } from "next/navigation";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminLayout({ children }) {
  const session = await getAdminSession()

  // If not logged in, show the login page (children will render login route)
  if (!session) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
        {children}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#000', color: '#fff' }}>
      {/* Persistent Sidebar */}
      <AdminSidebar user={session.user} />
      
      {/* Main Content Area */}
      <main style={{
        flex: 1,
        minHeight: '100vh',
        background: '#000'
      }}>
        {children}
      </main>
    </div>
  );
}
