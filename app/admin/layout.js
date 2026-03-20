import AdminNavbar from "@/app/_components/admin/AdminNavbar";
import { getAdminSession } from "@/lib/utils/auth";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminLayout({ children }) {
  const session = await getAdminSession()

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {session ? <AdminNavbar user={session.user} /> : null}
      <main className="p-6">{children}</main>
    </div>
  );
}
