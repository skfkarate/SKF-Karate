import Link from 'next/link';
import { getAllStudents } from '@/lib/server/sheets';
import { BELTS, getBelt } from '@/data/constants/belts';
import { requireAdminSession } from '@/lib/utils/auth';
import StudentCsvImportClient from './StudentCsvImportClient';
import { reactivateStudent } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminStudentsPage({ searchParams }) {
  const session = await requireAdminSession()
  const canManage = session.user.role === 'admin' || session.user.role === 'super_admin'

  const params = await searchParams;
  let athletes = await getAllStudents();
  
  if (params?.q) {
    const query = params.q.toLowerCase();
    athletes = athletes.filter(athlete => 
      athlete.name.toLowerCase().includes(query) ||
      athlete.skfId.toLowerCase().includes(query)
    );
  }

  if (params?.branch) {
    athletes = athletes.filter(athlete => athlete.branch === params.branch);
  }

  const inActiveCount = athletes.filter(a => a.status === 'Inactive').length;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#000',
      color: '#fff',
      paddingBottom: '4rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      
      {/* Header */}
      <header style={{ 
        borderBottom: '1px solid #111', 
        padding: '2rem 2.5rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-end' 
      }}>
        <div>
          <span style={{ 
            color: '#666', 
            fontSize: '0.8rem', 
            fontFamily: 'monospace', 
            letterSpacing: '0.1em', 
            display: 'block', 
            marginBottom: '1rem',
            textTransform: 'uppercase'
          }}>
            Database
          </span>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 400, 
            margin: 0, 
            letterSpacing: '-0.03em' 
          }}>
            Athlete Records
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {canManage && <StudentCsvImportClient />}
          {canManage && (
            <Link href="/admin/students/new" style={{
              background: '#111',
              color: '#fff',
              border: '1px solid #333',
              padding: '0.75rem 1.5rem',
              textDecoration: 'none',
              fontSize: '0.9rem',
              borderRadius: '4px',
              display: 'inline-block'
            }}>
              Add Record
            </Link>
          )}
        </div>
      </header>

      <div style={{ padding: '2rem 2.5rem' }}>
        
        {/* Controls */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          alignItems: 'center', 
          marginBottom: '2rem',
          padding: '1.5rem',
          background: '#050505',
          border: '1px solid #111'
        }}>
          <form style={{ display: 'flex', gap: '1rem', width: '100%' }}>
            <input 
              name="q" 
              defaultValue={params?.q || ''} 
              type="text" 
              placeholder="Search ID, Name..." 
              style={{
                flex: 1,
                background: '#000',
                border: '1px solid #222',
                color: '#fff',
                padding: '0.75rem 1rem',
                fontFamily: 'system-ui, sans-serif',
                fontSize: '0.9rem',
                outline: 'none',
                borderRadius: '4px'
              }}
            />
            <select 
              name="branch" 
              defaultValue={params?.branch || ''}
              style={{
                background: '#000',
                border: '1px solid #222',
                color: '#fff',
                padding: '0.75rem 1rem',
                fontFamily: 'system-ui, sans-serif',
                fontSize: '0.9rem',
                outline: 'none',
                borderRadius: '4px',
                minWidth: '150px'
              }}
            >
              <option value="">All Branches</option>
              {Array.from(new Set(athletes.map(a => a.branch))).filter(Boolean).map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <button type="submit" style={{
              background: '#fff',
              color: '#000',
              border: 'none',
              padding: '0 1.5rem',
              fontWeight: 500,
              cursor: 'pointer',
              borderRadius: '4px',
              fontFamily: 'system-ui, sans-serif'
            }}>
              Filter
            </button>
            {(params?.q || params?.branch) && (
              <Link href="/admin/students" style={{
                color: '#666',
                display: 'flex',
                alignItems: 'center',
                padding: '0 1rem',
                textDecoration: 'none',
                fontSize: '0.9rem',
                border: '1px solid #222',
                borderRadius: '4px'
              }}>
                Clear
              </Link>
            )}
          </form>
        </div>

        {/* Data Table */}
        <div style={{ 
          border: '1px solid #111', 
          background: '#050505', 
          overflowX: 'auto' 
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ borderBottom: '1px solid #222' }}>
              <tr>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 500, color: '#666', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Athlete</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 500, color: '#666', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Rank</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 500, color: '#666', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Location</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 500, color: '#666', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Joined</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 500, color: '#666', letterSpacing: '0.05em', textTransform: 'uppercase' }}>State</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 500, color: '#666', letterSpacing: '0.05em', textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {athletes.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '4rem', textAlign: 'center', color: '#666' }}>
                    No records found
                  </td>
                </tr>
              ) : (
                athletes.map((athlete) => {
                  const beltInfo = getBelt(athlete.belt)
                  const beltColorMap: Record<string, string> = {
                    white: '#f5f5f5',
                    yellow: '#facc15',
                    orange: '#fb923c',
                    green: '#22c55e',
                    blue: '#3b82f6',
                    brown: '#92400e',
                    black: '#171717',
                  }
                  const isInactive = athlete.status === 'Inactive'
                  return (
                    <tr key={athlete.skfId} style={{ 
                        borderBottom: '1px solid #111', 
                        opacity: isInactive ? 0.6 : 1, 
                        background: isInactive ? 'rgba(214, 40, 40, 0.05)' : 'transparent' 
                    }}>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ 
                            width: 32, height: 32, borderRadius: '50%', background: '#111', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            color: '#666', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'monospace' 
                          }}>
                            {athlete.name[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, color: isInactive ? '#999' : '#fff', fontSize: '0.95rem' }}>
                              {athlete.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#666', fontFamily: 'monospace', marginTop: '0.2rem' }}>
                              {athlete.skfId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: 12, height: 12, borderRadius: 2, background: beltColorMap[athlete.belt] || '#fff' }} />
                          <span style={{ fontSize: '0.9rem', color: '#ccc', textTransform: 'capitalize' }}>{beltInfo?.label || athlete.belt}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', color: '#ccc', fontSize: '0.9rem', textTransform: 'capitalize' }}>
                        {athlete.branch || '—'}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', color: '#666', fontSize: '0.85rem' }}>
                        {new Date(athlete.enrolledDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span style={{ 
                          padding: '0.25rem 0.6rem', 
                          fontSize: '0.7rem', 
                          background: isInactive ? 'rgba(214, 40, 40, 0.1)' : 'rgba(255,255,255,0.1)',
                          color: isInactive ? '#ff4444' : '#fff',
                          border: `1px solid ${isInactive ? '#ff4444' : '#333'}`,
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          {athlete.status || 'Active'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                        {canManage ? (
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              {isInactive && (
                                <form action={async () => { 'use server'; await reactivateStudent(athlete.skfId); }}>
                                    <button type="submit" style={{ background: 'transparent', color: '#4caf50', border: '1px solid #4caf50', padding: '0.4rem 0.75rem', fontSize: '0.8rem', borderRadius: '4px', cursor: 'pointer' }}>Reactivate</button>
                                </form>
                              )}
                              <Link href={`/admin/students/${athlete.skfId}/edit`} style={{
                                color: '#fff',
                                border: '1px solid #333',
                                padding: '0.4rem 0.75rem',
                                fontSize: '0.8rem',
                                textDecoration: 'none',
                                borderRadius: '4px'
                              }}>
                                Edit
                              </Link>
                          </div>
                        ) : (
                          <span style={{ color: '#666', fontSize: '0.8rem' }}>Read Only</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
