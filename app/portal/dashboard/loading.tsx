export default function DashboardLoading() {
  return (
    <div style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Student Header Skeleton */}
      <div className="skeleton" style={{ height: '150px', borderRadius: '24px', marginBottom: '2rem' }}></div>
      
      {/* Stats Row Skeletons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="skeleton" style={{ height: '140px', borderRadius: '16px' }}></div>
        <div className="skeleton" style={{ height: '140px', borderRadius: '16px' }}></div>
        <div className="skeleton" style={{ height: '140px', borderRadius: '16px' }}></div>
        <div className="skeleton" style={{ height: '140px', borderRadius: '16px' }}></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* Feed Skeleton */}
        <div className="skeleton" style={{ height: '300px', borderRadius: '24px' }}></div>
        {/* Actions Skeleton */}
        <div className="skeleton" style={{ height: '300px', borderRadius: '24px' }}></div>
      </div>

    </div>
  )
}
