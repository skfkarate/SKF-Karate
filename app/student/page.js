import SearchBox from '../components/student/SearchBox';
import { getFeaturedStudents } from '../../lib/data/students';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'Student Profile Lookup | SKF Karate',
  description: 'Find your SKF Karate student profile. View your belt history, tournament medals, rankings, achievement timeline, and points balance using your registration number.',
  openGraph: {
    title: 'SKF Karate — Student Profile Lookup',
    description: 'Your complete karate journey in one place. Belt history, medals, rankings, and points.',
    url: 'https://www.skfkarate.org/student',
    siteName: 'SKF Karate',
    type: 'website',
  }
};

export default function StudentLookupPage() {
  const featuredStudents = getFeaturedStudents().slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* ===== HERO ===== */}
      <section className="page-hero">
        <div className="page-hero__bg">
          <div className="glow glow-red page-hero__glow-1"></div>
          <div className="glow glow-blue page-hero__glow-2"></div>
        </div>

        <div className="container page-hero__content">
          <span className="section-label">Your Karate Journey</span>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight uppercase animate-in delay-1 mb-6">
            <span className="text-gradient">Find Your</span> Profile
          </h1>
          <p className="text-lg md:text-xl text-gray-400 w-full md:whitespace-nowrap mx-auto leading-relaxed animate-in delay-2 mb-10">
            Enter your SKF registration number to view your achievements, belt history, live rank, and points.
          </p>
          <br></br>
          <br></br>
          <div className="max-w-3xl mx-auto w-full animate-in delay-3 elite-search-wrapper mt-20 mb-16">
            <div className="elite-search-glow"></div>
            <div className="relative z-10 w-full">
              <SearchBox />
            </div>
          </div>
        </div>
      </section>

      {/* ===== HELP CARDS (ASYMMETRICAL BENTO GRID) ===== */}
      <section className="section relative z-20 animate-in delay-4">
        <div className="container">
          <div className="bento-grid">

            <div className="bento-card bento-card--featured group">
              <div className="bento-number">01</div>
              <div className="bento-content">
                <h3 className="text-2xl font-black text-white mb-3 tracking-tight">Where to find your SKF Number?</h3>
                <p className="text-gray-400 leading-relaxed text-sm max-w-xl">
                  Your unique 13-character SKF registration number (e.g., SKF-2024-0042) is your passkey.
                  It is printed on your official membership card, listed in grading communications, and printed on your tournament certificates.
                </p>
              </div>
            </div>

            <div className="bento-card bento-card--secondary-1 group">
              <div className="bento-number">02</div>
              <div className="bento-content h-full">
                <h3 className="text-xl font-bold text-white mb-3">Forgot your number?</h3>
                <p className="text-gray-400 leading-relaxed text-sm mb-6 flex-grow">
                  No problem. Your Dojo Sensei or the regional SKF association office can securely look up your profile using your registered name and date of birth.
                </p>
                <Link href="/contact" className="text-blue-400 font-bold hover:text-blue-300 flex items-center gap-2 transition-colors mt-auto uppercase tracking-widest text-xs">
                  Contact Office <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>

            <div className="bento-card bento-card--secondary-2 group">
              <div className="bento-number">03</div>
              <div className="bento-content h-full">
                <h3 className="text-xl font-bold text-white mb-3">New to SKF?</h3>
                <p className="text-gray-400 leading-relaxed text-sm mb-6 flex-grow">
                  Profiles are exclusively auto-generated upon your first official SKF dojo enrollment.
                </p>
                <Link href="/contact" className="text-green-400 font-bold hover:text-green-300 flex items-center gap-2 transition-colors mt-auto uppercase tracking-widest text-xs">
                  Start Journey <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===== FEATURED STUDENTS (ELITE ROSTER CARDS) ===== */}
      <section className="section relative overflow-hidden">
        <div className="glow glow-gold absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-15 w-[800px] h-[800px] pointer-events-none mix-blend-screen"></div>
        <div className="glow glow-red absolute bottom-0 right-0 opacity-20 w-[600px] h-[600px] pointer-events-none mix-blend-screen"></div>

        <div className="container relative z-10">
          <div className="text-center mb-24">
            <span className="section-label mb-6">Hall of Fame</span>
            <h2 className="section-title">Our <span className="text-gradient">Champions</span></h2>
          </div>

          <div className="elite-roster-grid">
            {featuredStudents.map((fs) => {
              const beltColorMap = {
                'white': '#ffffff', 'yellow': '#FFD700', 'orange': '#FF8C00', 'green': '#22c55e',
                'blue': '#3b82f6', 'brown': '#8B4513', 'black-1st-dan': '#111', 'black-2nd-dan': '#111',
                'black-3rd-dan': '#111', 'black-4th-dan': '#111', 'black-5th-dan': '#111',
              };
              return (
                <div key={fs.id} className="elite-card group cursor-pointer">
                  <div className="elite-card__image-container">
                    {fs.photoUrl ? (
                      <Image src={fs.photoUrl} alt={`${fs.firstName} ${fs.lastName}`} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#14213d] to-[#080b14] text-7xl font-black text-[rgba(255,255,255,0.05)]">
                        {fs.firstName.charAt(0)}{fs.lastName.charAt(0)}
                      </div>
                    )}
                    <div className="elite-card__overlay"></div>
                  </div>

                  <div className="elite-card__content">
                    <div className="elite-card__belt-indicator" style={{ backgroundColor: beltColorMap[fs.currentBelt] || '#fff' }}></div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tight leading-none mb-1 shadow-sm">{fs.firstName}</h3>
                    <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-200 uppercase tracking-tight">{fs.lastName}</h3>

                    <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.1)] flex justify-between items-center w-full">
                      <div className="text-left">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Branch</p>
                        <p className="text-sm text-gray-300 font-bold uppercase truncate">{fs.branchName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Rank</p>
                        <p className="text-sm text-white font-black uppercase text-glow">{fs.currentBelt.replace(/-/g, ' ')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <p className="text-center text-gray-500 text-sm font-bold uppercase tracking-widest mt-24 pt-12 border-t border-[rgba(255,255,255,0.05)]">
            Search your registration number above to view your full profile.
          </p>
        </div>
      </section>
    </div>
  );
}
