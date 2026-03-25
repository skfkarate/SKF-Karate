'use client';

export default function Loading() {
  return (
    <div className="profile-dashboard animate-pulse">
      <div className="profile-dashboard__bg" />

      <div className="container profile-dashboard__content">
        <div className="profile-topbar">
          <div className="h-12 w-40 rounded-full border border-white/8 bg-white/[0.04]" />
          <div className="flex gap-3">
            <div className="h-12 w-32 rounded-full border border-white/8 bg-white/[0.04]" />
            <div className="h-12 w-36 rounded-full border border-white/8 bg-white/[0.04]" />
          </div>
        </div>

        <section className="profile-panel profile-hero-shell">
          <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)_300px]">
            <div className="space-y-4">
              <div className="min-h-[320px] rounded-[28px] border border-white/8 bg-white/[0.04]" />
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="h-28 rounded-[24px] border border-white/8 bg-white/[0.04]" />
                <div className="h-28 rounded-[24px] border border-white/8 bg-white/[0.04]" />
              </div>
            </div>

            <div className="space-y-5">
              <div className="h-4 w-28 rounded bg-white/[0.04]" />
              <div className="h-20 w-3/4 rounded-[24px] bg-white/[0.04]" />
              <div className="h-16 w-full rounded-[24px] bg-white/[0.04]" />
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="h-32 rounded-[24px] border border-white/8 bg-white/[0.04]" />
                ))}
              </div>
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                <div className="h-64 rounded-[28px] border border-white/8 bg-white/[0.04]" />
                <div className="h-64 rounded-[28px] border border-white/8 bg-white/[0.04]" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="h-60 rounded-[28px] border border-white/8 bg-white/[0.04]" />
              <div className="h-80 rounded-[28px] border border-white/8 bg-white/[0.04]" />
            </div>
          </div>
        </section>

        <div className="profile-utility-grid">
          <div className="h-56 rounded-[28px] border border-white/8 bg-white/[0.04]" />
          <div className="h-56 rounded-[28px] border border-white/8 bg-white/[0.04]" />
        </div>

        <div className="profile-main-grid">
          <div className="space-y-6">
            <div className="h-[640px] rounded-[30px] border border-white/8 bg-white/[0.04]" />
            <div className="h-[720px] rounded-[30px] border border-white/8 bg-white/[0.04]" />
          </div>

          <div className="space-y-6">
            <div className="h-[760px] rounded-[28px] border border-white/8 bg-white/[0.04]" />
            <div className="h-[460px] rounded-[28px] border border-white/8 bg-white/[0.04]" />
            <div className="h-[260px] rounded-[28px] border border-white/8 bg-white/[0.04]" />
          </div>
        </div>
      </div>
    </div>
  );
}
