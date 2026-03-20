import SearchBox from '@/app/_components/athlete/SearchBox';
import RankingDashboard from '@/app/_components/athlete/RankingDashboard';
import { FaSearch } from 'react-icons/fa';
import './athlete.css';

export const metadata = {
  title: 'Athlete Rankings & Profile | SKF Karate',
  description: 'Official SKF Karate athlete rankings and profile lookup. View live standings across all categories, or search for an athlete by name or registration number.',
  openGraph: {
    title: 'Official Rankings & Athlete Profile — SKF Karate',
    description: 'Live SKF Karate rankings across all categories. Search athletes by name or SKF registration number.',
    url: 'https://www.skfkarate.org/athlete',
    siteName: 'SKF Karate',
    type: 'website',
  }
};

export default function AthleteLookupPage() {
  return (
    <div className="athlete-page">

      {/* ═══════ HERO ═══════ */}
      <section className="ath-hero">
        <div className="ath-hero__bg">
          <div className="ath-hero__glow ath-hero__glow--1"></div>
          <div className="ath-hero__glow ath-hero__glow--2"></div>
        </div>
        <div className="container ath-hero__content">
          <span className="ath-badge"><FaSearch /> Athlete Lookup</span>
          <h1 className="ath-hero__title">Find Your <span className="ath-text-grad">Profile</span></h1>
          <p className="ath-hero__subtitle">
            Search by name or registration number to access your complete athlete profile — belt history, medals, career points and more.
          </p>
          <div className="ath-hero__search-wrap">
            <div className="elite-search-wrapper">
              <div className="elite-search-glow"></div>
              <div className="ath-hero__search-inner">
                <SearchBox />
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════
          SECTION 2: OFFICIAL RANKINGS DASHBOARD
         ═══════════════════════════════════════════ */}
      <RankingDashboard />
    </div>
  );
}
