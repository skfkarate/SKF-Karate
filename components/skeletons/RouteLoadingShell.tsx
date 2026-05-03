import {
  SkeletonBlock,
  SkeletonButton,
  SkeletonCircle,
  SkeletonLine,
} from './SkeletonPrimitives'
import './skeleton.css'

type RouteLoadingShellProps = {
  variant?: 'public' | 'admin' | 'portal' | 'form' | 'article'
}

function LoadingStatus({ label }: { label: string }) {
  return (
    <div className="skeleton-status" role="status" aria-live="polite">
      <span className="skeleton-status__dot" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

function PublicSkeleton() {
  return (
    <>
      <section className="skel-hero">
        <LoadingStatus label="Loading page" />
        <SkeletonLine width="min(72vw, 460px)" height={54} style={{ marginTop: '1.15rem' }} />
        <SkeletonLine width="min(80vw, 640px)" height={16} style={{ marginTop: '1rem' }} />
        <SkeletonLine width="min(62vw, 480px)" height={16} style={{ marginTop: '0.55rem' }} />
        <div className="skel-row skel-row--center skel-row--wrap skel-mt-lg" style={{ gap: '0.75rem' }}>
          <SkeletonButton width={140} height={42} />
          <SkeletonButton width={110} height={42} />
        </div>
      </section>

      <section className="skel-section">
        <div className="skel-row skel-row--between skel-mb-md">
          <SkeletonLine width={150} height={18} />
          <SkeletonLine width={88} height={18} />
        </div>
        <div className="skel-grid skel-grid--cards">
          {Array.from({ length: 6 }).map((_, index) => (
            <div className="skel-card" key={index}>
              <SkeletonBlock height={160} radius={0} />
              <div className="skel-card__body">
                <SkeletonLine width="72%" height={20} />
                <SkeletonLine width="100%" height={13} style={{ marginTop: '0.7rem' }} />
                <SkeletonLine width="82%" height={13} style={{ marginTop: '0.45rem' }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function ArticleSkeleton() {
  return (
    <>
      <section className="skel-hero skel-hero--compact">
        <LoadingStatus label="Loading guide" />
        <SkeletonLine width="min(76vw, 620px)" height={46} style={{ marginTop: '1.15rem' }} />
        <SkeletonLine width="min(78vw, 700px)" height={16} style={{ marginTop: '1rem' }} />
      </section>

      <section className="skel-section skel-section--narrow">
        <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 'clamp(1.25rem, 3vw, 2rem)', background: 'rgba(255,255,255,0.025)' }}>
          <SkeletonLine width="34%" height={18} style={{ marginBottom: '1.25rem' }} />
          {Array.from({ length: 7 }).map((_, index) => (
            <SkeletonLine
              key={index}
              width={index % 3 === 2 ? '72%' : '100%'}
              height={15}
              style={{ marginBottom: '0.75rem' }}
            />
          ))}
          <div className="skel-grid skel-grid--cards-sm skel-mt-lg">
            {Array.from({ length: 3 }).map((_, index) => (
              <div className="skel-card--padded" key={index} style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1rem' }}>
                <SkeletonLine width="46%" height={13} />
                <SkeletonLine width="86%" height={20} style={{ marginTop: '0.8rem' }} />
                <SkeletonLine width="62%" height={13} style={{ marginTop: '0.65rem' }} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

function AdminSkeleton() {
  return (
    <div className="skel-section skel-section--wide">
      <div className="skel-row skel-row--between skel-row--wrap skel-mb-lg" style={{ paddingBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div>
          <LoadingStatus label="Loading admin" />
          <SkeletonLine width={260} height={36} style={{ marginTop: '1rem' }} />
          <SkeletonLine width="min(56vw, 620px)" height={14} style={{ marginTop: '0.85rem' }} />
        </div>
        <div className="skel-row" style={{ gap: '0.75rem' }}>
          <SkeletonButton width={128} height={42} />
          <SkeletonButton width={104} height={42} />
        </div>
      </div>

      <div className="skel-grid skel-grid--cards-sm skel-mb-lg">
        {Array.from({ length: 5 }).map((_, index) => (
          <div className="skel-card--padded" key={index} style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1rem' }}>
            <SkeletonLine width="58%" height={12} />
            <SkeletonLine width={72} height={32} style={{ marginTop: '0.9rem' }} />
            <SkeletonLine width="84%" height={12} style={{ marginTop: '0.7rem' }} />
          </div>
        ))}
      </div>

      <div className="skel-grid skel-grid--cards">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="skel-card--padded" key={index} style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1rem', minHeight: 230 }}>
            <SkeletonLine width="42%" height={20} />
            <SkeletonLine width="78%" height={13} style={{ marginTop: '0.75rem' }} />
            <div className="skel-col skel-mt-md" style={{ gap: '0.85rem' }}>
              {Array.from({ length: 3 }).map((__, rowIndex) => (
                <div className="skel-row" key={rowIndex} style={{ gap: '0.8rem' }}>
                  <SkeletonCircle size={28} />
                  <SkeletonLine width={`${54 + rowIndex * 10}%`} height={14} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PortalSkeleton() {
  return (
    <div className="skel-section skel-section--wide">
      <div className="skel-row skel-row--between skel-row--wrap skel-mb-lg" style={{ paddingBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div>
          <LoadingStatus label="Loading portal" />
          <SkeletonLine width={250} height={38} style={{ marginTop: '1rem' }} />
          <SkeletonLine width="min(64vw, 540px)" height={14} style={{ marginTop: '0.85rem' }} />
        </div>
        <SkeletonCircle size={58} />
      </div>

      <div className="skel-grid skel-grid--cards">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="skel-card" key={index}>
            <div className="skel-card__body">
              <SkeletonCircle size={34} />
              <SkeletonLine width="68%" height={20} style={{ marginTop: '1rem' }} />
              <SkeletonLine width="100%" height={13} style={{ marginTop: '0.7rem' }} />
              <SkeletonLine width="72%" height={13} style={{ marginTop: '0.45rem' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FormSkeleton() {
  return (
    <div className="skel-section" style={{ display: 'grid', placeItems: 'center', minHeight: '80vh' }}>
      <div className="skel-form-card" style={{ width: 'min(560px, 100%)' }}>
        <LoadingStatus label="Loading form" />
        <SkeletonLine width="72%" height={36} style={{ marginTop: '1rem' }} />
        <SkeletonLine width="88%" height={14} style={{ marginTop: '0.8rem', marginBottom: '1.6rem' }} />
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="skel-field" key={index}>
            <SkeletonLine width={index === 3 ? '30%' : '42%'} height={12} />
            <SkeletonBlock height={48} radius={10} style={{ marginTop: '0.55rem' }} />
          </div>
        ))}
        <SkeletonButton width="48%" height={48} style={{ marginTop: '1rem' }} />
      </div>
    </div>
  )
}

export default function RouteLoadingShell({ variant = 'public' }: RouteLoadingShellProps) {
  return (
    <div className="skel-page" aria-busy="true">
      {variant === 'admin' ? <AdminSkeleton /> : null}
      {variant === 'portal' ? <PortalSkeleton /> : null}
      {variant === 'form' ? <FormSkeleton /> : null}
      {variant === 'article' ? <ArticleSkeleton /> : null}
      {variant === 'public' ? <PublicSkeleton /> : null}
    </div>
  )
}
