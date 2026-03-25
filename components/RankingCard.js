'use client'

import { forwardRef } from 'react'

const RankingCard = forwardRef(({ athleteInfo, categories, totalG, totalS, totalB }, ref) => {
  const primary = categories?.find((c) => c.isPrimary) || categories?.[0]
  const totalMedals = totalG + totalS + totalB

  return (
    <div 
      ref={ref}
      style={{
        width: '1080px',
        height: '1080px',
        background: '#05080f',
        position: 'absolute',
        top: '-9999px',
        left: '-9999px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-body), sans-serif',
        color: '#fff',
        padding: '60px',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      {/* Background Decor */}
      <div style={{ position: 'absolute', top: -200, left: -200, width: 800, height: 800, background: 'radial-gradient(circle, rgba(214,40,40,0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: -200, right: -200, width: 800, height: 800, background: 'radial-gradient(circle, rgba(255,183,3,0.1) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%' }} />
      
      {/* Container Card */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '2px solid rgba(255,255,255,0.1)',
        borderRadius: '40px',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '60px',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 2,
        boxShadow: '0 40px 100px rgba(0,0,0,0.5)'
      }}>
        
        {/* Header - Brand */}
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', color: '#ffb703', fontSize: '36px', textTransform: 'uppercase', letterSpacing: '4px', margin: 0 }}>SKF Karate</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '20px', margin: '10px 0 0 0', textTransform: 'uppercase', letterSpacing: '2px' }}>Official Athlete Profile</p>
        </div>

        {/* Photo & Name */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '60px' }}>
          <div style={{ 
            width: '280px', 
            height: '280px', 
            borderRadius: '50%', 
            overflow: 'hidden', 
            border: '8px solid rgba(255,255,255,0.1)',
            marginBottom: '30px',
            background: '#111'
          }}>
            <img 
              src={athleteInfo?.photo} 
              alt={athleteInfo?.name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              crossOrigin="anonymous" 
            />
          </div>
          <h1 style={{ fontSize: '72px', margin: '0 0 10px 0', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', fontWeight: 900, textAlign: 'center', lineHeight: 1.1 }}>
            {athleteInfo?.name}
          </h1>
          <div style={{ fontSize: '28px', color: 'rgba(255,255,255,0.6)', display: 'flex', gap: '20px', alignItems: 'center' }}>
            <span>{athleteInfo?.id}</span>
            <span>•</span>
            <img src={athleteInfo?.countryFlag} alt="" style={{ height: '30px' }} crossOrigin="anonymous" />
          </div>
        </div>

        {/* Rank & Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', width: '100%' }}>
          {/* Left: World Rank */}
          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,183,3,0.2)', borderRadius: '24px', padding: '40px', textAlign: 'center' }}>
            <p style={{ margin: '0 0 10px 0', color: 'rgba(255,255,255,0.5)', fontSize: '20px', textTransform: 'uppercase', letterSpacing: '2px' }}>{primary?.name}</p>
            <h3 style={{ margin: 0, fontSize: '80px', color: '#ffb703', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
              {primary?.rank ? `#${primary.rank}` : '—'}
            </h3>
            <p style={{ margin: '10px 0 0 0', color: 'rgba(255,255,255,0.8)', fontSize: '24px' }}>{primary?.points?.toLocaleString()} pts</p>
          </div>

          {/* Right: Medals */}
          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '30px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ margin: '0 0 20px 0', color: 'rgba(255,255,255,0.5)', fontSize: '20px', textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center' }}>Career Medals</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #ffd700 0%, #b8860b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '28px', fontWeight: 'bold', margin: '0 auto 10px auto' }}>{totalG}</div>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '18px' }}>Gold</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #e0e0e0 0%, #9e9e9e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '28px', fontWeight: 'bold', margin: '0 auto 10px auto' }}>{totalS}</div>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '18px' }}>Silver</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #cd7f32 0%, #8b4513 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '28px', fontWeight: 'bold', margin: '0 auto 10px auto' }}>{totalB}</div>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '18px' }}>Bronze</span>
              </div>
              <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '20px' }}>
                <div style={{ fontSize: '48px', color: '#fff', fontWeight: 'bold', lineHeight: 1 }}>{totalMedals}</div>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '18px' }}>Total</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer URL */}
        <div style={{ position: 'absolute', bottom: '40px', color: 'rgba(255,255,255,0.4)', fontSize: '20px', letterSpacing: '2px' }}>
          skfkarate.org
        </div>
      </div>
    </div>
  )
})

RankingCard.displayName = 'RankingCard'
export default RankingCard
