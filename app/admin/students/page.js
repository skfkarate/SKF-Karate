import Link from 'next/link';
import Image from 'next/image';
import { getAllAthletes } from '../../../lib/data/athletes';
import { getBelt } from '../../../lib/data/belts';
import { requireAdminSession } from '@/lib/utils/auth';

export const dynamic = 'force-dynamic';

export default async function AdminStudentsPage({ searchParams }) {
  const session = await requireAdminSession()
  const canManage = session.role === 'admin' || session.role === 'super_admin'

  const params = await searchParams;
  let athletes = await getAllAthletes();
  
  if (params?.q) {
    const query = params.q.toLowerCase();
    athletes = athletes.filter(athlete => 
      athlete.firstName.toLowerCase().includes(query) ||
      athlete.lastName.toLowerCase().includes(query) ||
      athlete.registrationNumber.toLowerCase().includes(query)
    );
  }

  if (params?.branch) {
    athletes = athletes.filter(athlete => athlete.branch === params.branch);
  }

  const inActiveCount = athletes.filter(a => a.status === 'inactive').length;

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
        {canManage && (
          <Link href="/admin/students/new" style={{
            background: '#111',
            color: '#fff',
            border: '1px solid #333',
            padding: '0.75rem 1.5rem',
            textDecoration: 'none',
            fontSize: '0.9rem',
            borderRadius: '4px'
          }}>
            Add Record
          </Link>
        )}
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
                  const beltInfo = getBelt(athlete.beltRank)
                  return (
                    <tr key={athlete.id} style={{ borderBottom: '1px solid #111' }}>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ 
                            width: 32, height: 32, borderRadius: '50%', background: '#111', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            color: '#666', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'monospace' 
                          }}>
                            {athlete.firstName[0]}{athlete.lastName[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, color: '#fff', fontSize: '0.95rem' }}>
                              {athlete.firstName} {athlete.lastName}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#666', fontFamily: 'monospace', marginTop: '0.2rem' }}>
                              {athlete.registrationNumber}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: 12, height: 12, borderRadius: 2, background: beltInfo?.hexCode || '#fff' }} />
                          <span style={{ fontSize: '0.9rem', color: '#ccc' }}>{beltInfo?.name || athlete.beltRank}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', color: '#ccc', fontSize: '0.9rem' }}>
                        {athlete.branch || '—'}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', color: '#666', fontSize: '0.85rem' }}>
                        {new Date(athlete.dateOfJoin).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span style={{ 
                          padding: '0.25rem 0.6rem', 
                          fontSize: '0.7rem', 
                          background: athlete.status === 'active' ? 'rgba(255,255,255,0.1)' : 'transparent',
                          color: athlete.status === 'active' ? '#fff' : '#666',
                          border: `1px solid ${athlete.status === 'active' ? '#333' : '#222'}`,
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          {athlete.status || 'Active'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                        {canManage ? (
                          <Link href={`/admin/students/${athlete.id}/edit`} style={{
                            color: '#fff',
                            border: '1px solid #333',
                            padding: '0.4rem 0.75rem',
                            fontSize: '0.8rem',
                            textDecoration: 'none',
                            borderRadius: '4px'
                          }}>
                            Edit
                          </Link>
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
