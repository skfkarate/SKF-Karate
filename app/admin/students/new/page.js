import Link from 'next/link';
import { requireAdminSession } from '@/lib/utils/auth';
import AdminStudentFormShell from '@/components/admin/AdminStudentFormShell';

export default async function NewStudentPage() {
  await requireAdminSession("admin");

  return (
    <div className="min-h-screen bg-[#080b14] pb-20">
      <header className="bg-[rgba(20,33,61,0.5)] border-b border-[rgba(255,183,3,0.1)] py-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-red rounded-full mix-blend-multiply filter blur-[128px] opacity-20 pointer-events-none"></div>
        <div className="container mx-auto px-4 max-w-5xl flex items-center justify-between relative z-10">
          <div className="flex items-center gap-6">
            <Link href="/admin/students" className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-white hover:bg-[rgba(255,255,255,0.1)] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            <h1 className="text-3xl font-black uppercase text-white tracking-tight">Add New Student</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4">
        <AdminStudentFormShell isEditing={false} />
      </div>
    </div>
  );
}
