import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import * as jose from 'jose'
import { FaMapMarkerAlt, FaArrowRight } from 'react-icons/fa'
import './summer-camp.css'

export default async function SummerCampRoot() {
  const token = cookies().get('skf_student_token')?.value
  
  if (token && process.env.JWT_SECRET) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET)
      const { payload } = await jose.jwtVerify(token, secret)
      if (payload.branch) {
        const branchSlug = payload.branch.toString().toLowerCase().replace(/\s+/g, '-')
        // Auto-redirect to their branch
        redirect(`/summer-camp/${branchSlug}`)
      }
    } catch (e) {
        // ignore and show selector
    }
  }

  const branches = [
    { name: 'Koramangala HQ', slug: 'koramangala', address: 'MP Sports Club, 2nd Main Rd' },
    { name: 'Whitefield', slug: 'whitefield', address: 'SKF Elite Dojo, Main Hub' },
    { name: 'JP Nagar', slug: 'jp-nagar', address: 'J3 Academy, 4th Phase' }
  ]

  return (
    <div className="camp-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="page-hero__bg">
          <div className="glow glow-red page-hero__glow-1"></div>
          <div className="glow glow-gold page-hero__glow-2"></div>
      </div>
      
      <div className="container" style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
        <h1 className="page-hero__title" style={{ marginBottom: '1rem' }}>
          Select Your <span className="text-gradient">Branch</span>
        </h1>
        <p className="page-hero__subtitle" style={{ marginBottom: '4rem', maxWidth: '600px', margin: '0 auto 4rem auto' }}>
          To view availability and pricing for the Summer Camp 2026, please choose your nearest SKF Karate location.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
          {branches.map(b => (
            <Link key={b.slug} href={`/summer-camp/${b.slug}`} style={{ textDecoration: 'none' }}>
              <div className="glass-card" style={{ padding: '2.5rem 2rem', transition: 'all 0.3s ease', cursor: 'pointer', textAlign: 'left', border: '1px solid rgba(255,183,3,0.1)' }}
                   onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.borderColor = 'var(--gold)'; }}
                   onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,183,3,0.1)'; }}>
                <FaMapMarkerAlt style={{ fontSize: '2.5rem', color: 'var(--crimson)', marginBottom: '1.5rem' }} />
                <h3 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>{b.name}</h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem' }}>{b.address}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--gold)', fontWeight: 'bold' }}>
                  View Camp Details <FaArrowRight />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
