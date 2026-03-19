import Link from 'next/link';
import Image from 'next/image';
import { getAllStudents } from '../../../lib/data/students';
import { getBelt } from '../../../lib/data/belts';
import { requireAdminSession } from '@/lib/utils/auth';

// Add a simple basic auth mechanism or middleware later
// For now this is just UI skeleton for mock data rendering
export const dynamic = 'force-dynamic';

export default async function AdminStudentsPage({ searchParams }) {
  // Require admin session for access - both admin and instructor can view
  const session = await requireAdminSession(["admin", "instructor"]);
  
  const allStudents = getAllStudents();
  const params = await searchParams;
  const query = params?.q?.trim().toLowerCase() || '';
  const branch = params?.branch || 'all';

  const students = allStudents.filter((student) => {
    const matchesQuery =
      !query ||
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(query) ||
      student.registrationNumber.toLowerCase().includes(query);
    const matchesBranch = branch === 'all' || student.branchName === branch;
    return matchesQuery && matchesBranch;
  });
  const branches = [...new Set(allStudents.map((student) => student.branchName))].sort();
  const canManage = session.user.role === 'admin';

  return (
    <div className="min-h-screen bg-[#080b14] pb-20">
      
      {/* Admin Header */}
      <header className="bg-[rgba(20,33,61,0.5)] border-b border-[rgba(255,183,3,0.1)] py-8 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-red rounded-full mix-blend-multiply filter blur-[128px] opacity-20 pointer-events-none"></div>
        <div className="container mx-auto px-4 max-w-7xl relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-brand-red text-sm font-bold uppercase tracking-[0.2em] block mb-2">SKF Portal</span>
            <h1 className="text-4xl font-black uppercase text-white tracking-tight">Student Management</h1>
          </div>
          {canManage ? (
            <Link href="/admin/students/new" className="bg-brand-red text-white px-8 py-3 rounded font-bold tracking-widest hover:bg-red-700 transition flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(214,40,40,0.4)] hover:shadow-[0_0_30px_rgba(214,40,40,0.6)] uppercase text-sm border border-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add New Student
            </Link>
          ) : null}
        </div>
      </header>

      <div className="container mx-auto px-4 max-w-7xl mt-12">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="glass-card p-6 rounded-2xl flex items-center justify-between border border-[rgba(255,255,255,0.05)] shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-[rgba(255,255,255,0.02)]">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Students</p>
              <p className="text-4xl font-black text-white mt-2">{students.length}</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
          </div>
          <div className="glass-card p-6 rounded-2xl flex items-center justify-between border border-[rgba(34,197,94,0.2)] shadow-[0_10px_30px_rgba(34,197,94,0.1)] bg-[rgba(34,197,94,0.05)]">
            <div>
              <p className="text-xs font-bold text-green-500 uppercase tracking-widest">Active</p>
              <p className="text-4xl font-black text-white mt-2">{students.filter(s => s.status === 'active').length}</p>
            </div>
          </div>
          <div className="glass-card p-6 rounded-2xl flex items-center justify-between border border-[rgba(255,255,255,0.1)] shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-[rgba(0,0,0,0.5)]">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Black Belts</p>
              <p className="text-4xl font-black text-white mt-2">{students.filter(s => s.currentBelt.includes('black')).length}</p>
            </div>
          </div>
          <div className="glass-card p-6 rounded-2xl flex items-center justify-between border border-[rgba(255,183,3,0.2)] shadow-[0_10px_30px_rgba(255,183,3,0.05)] bg-[rgba(255,183,3,0.05)]">
            <div>
              <p className="text-xs font-bold text-gold uppercase tracking-widest">Points Distributed</p>
              <p className="text-4xl font-black text-white mt-2">
                {students.reduce((acc, curr) => acc + curr.pointsLifetime, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <form className="glass-card p-5 rounded-t-2xl border-x border-t border-[rgba(255,255,255,0.1)] shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center bg-[rgba(255,255,255,0.02)]">
          <div className="w-full sm:w-96 relative">
            <input name="q" defaultValue={params?.q || ''} type="text" placeholder="Search by name or reg number..." className="w-full pl-11 pr-4 py-3 bg-[rgba(0,0,0,0.5)] text-white border border-[rgba(255,255,255,0.1)] rounded hover:border-[rgba(255,255,255,0.2)] focus:border-gold focus:ring-1 focus:ring-gold transition-colors outline-none" />
            <svg className="w-5 h-5 text-gray-500 absolute left-4 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <select name="branch" defaultValue={branch} className="bg-[rgba(0,0,0,0.5)] outline-none border border-[rgba(255,255,255,0.1)] rounded px-4 py-3 text-sm text-gray-300 font-medium focus:border-gold cursor-pointer">
              <option value="all">All Branches</option>
              {branches.map((branchName) => (
                <option key={branchName} value={branchName}>{branchName}</option>
              ))}
            </select>
            <button type="submit" className="bg-white/10 px-4 py-3 text-sm font-semibold text-white rounded border border-white/10 hover:bg-white/15 transition-colors">
              Filter
            </button>
          </div>
        </form>

        {/* User Table */}
        <div className="glass-card border-x border-b border-[rgba(255,255,255,0.1)] rounded-b-2xl overflow-x-auto bg-[rgba(0,0,0,0.2)]">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-[rgba(255,255,255,0.03)] border-b border-[rgba(255,255,255,0.1)] text-xs font-bold text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-5">Student</th>
                <th className="px-6 py-5">Reg No.</th>
                <th className="px-6 py-5">Branch</th>
                <th className="px-6 py-5">Belt</th>
                <th className="px-6 py-5 text-center">Flags</th>
                <th className="px-6 py-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
              {students.map(student => (
                <tr key={student.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[rgba(20,33,61,0.8)] border-2 border-[rgba(255,255,255,0.1)] flex items-center justify-center font-black text-gray-400 overflow-hidden shadow-md">
                         {student.photoUrl ? <Image src={student.photoUrl} alt={`${student.firstName} ${student.lastName}`} width={48} height={48} className="w-full h-full object-cover" /> : `${student.firstName[0]}${student.lastName[0]}`}
                      </div>
                      <div>
                        <p className="font-bold text-white uppercase tracking-wider">{student.firstName} {student.lastName}</p>
                        <p className="text-xs font-bold tracking-widest text-gold/70 mt-1 uppercase">{student.status}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-gray-400 tracking-wider">
                    <span className="bg-[rgba(0,0,0,0.5)] px-2 py-1 rounded border border-[rgba(255,255,255,0.05)]">{student.registrationNumber}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-300 tracking-wider uppercase">{student.branchName}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[rgba(255,255,255,0.05)] text-xs font-bold border border-[rgba(255,255,255,0.1)] uppercase text-gray-200">
                      {getBelt(student.currentBelt).label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-3">
                       {student.isPublic && <span title="Public Profile" className="text-green-400 opacity-80 group-hover:opacity-100 transition-opacity">👁️</span>}
                       {student.isFeatured && <span title="Featured" className="text-gold opacity-80 group-hover:opacity-100 transition-opacity shadow-[0_0_10px_rgba(255,183,3,0.5)] rounded-full">⭐</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {canManage ? (
                      <Link href={`/admin/students/${student.id}/edit`} className="inline-block text-white font-bold text-xs uppercase tracking-widest px-4 py-2 bg-[rgba(255,255,255,0.05)] rounded border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.1)] hover:border-white transition-all">
                        Edit
                      </Link>
                    ) : (
                      <span className="inline-block text-white/40 font-bold text-xs uppercase tracking-widest px-4 py-2 bg-[rgba(255,255,255,0.03)] rounded border border-[rgba(255,255,255,0.06)]">
                        View Only
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
