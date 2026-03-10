import Link from 'next/link'
import { FaBullhorn, FaMedal, FaArrowRight, FaUserPlus, FaCalendarAlt } from 'react-icons/fa'
import './news.css'

export const metadata = {
    title: 'News & Updates — Results, Promotions & Announcements',
    description: 'Latest news from SKF Karate — competition results, belt promotion announcements, new dojo openings, national team selections, and association updates.',
    openGraph: { title: 'SKF Karate News & Updates', description: 'Latest results, belt promotions, and announcements from SKF Karate.' },
    alternates: { canonical: 'https://skfkarate.org/news' },
}

const newsItems = [
    { cat: 'Results', icon: <FaMedal />, date: 'Mar 2, 2026', title: 'SKF Dominates State Championship 2026', desc: 'Our karateka brought home 12 Gold, 8 Silver, and 5 Bronze medals, finishing as the top association in the state championship. Oss!' },
    { cat: 'Promotion', icon: <FaUserPlus />, date: 'Feb 20, 2026', title: 'Belt Promotions — Winter Grading', desc: '45 students successfully earned their next belt grade including 3 new Shodan (1st Dan Black Belt) recipients. Congratulations to all karateka!' },
    { cat: 'Announcement', icon: <FaBullhorn />, date: 'Feb 5, 2026', title: 'Summer Camp 2026 — Registration Open', desc: 'The most anticipated event of the year is here. Limited slots available for our intensive Summer Camp. Three programs: Foundation, Advanced, and Elite.' },
    { cat: 'Achievement', icon: <FaMedal />, date: 'Jan 18, 2026', title: 'National Team Selection', desc: '4 SKF karateka have been selected for the National Squad in both Kata and Kumite divisions. A proud moment for the entire SKF family!' },
    { cat: 'Update', icon: <FaBullhorn />, date: 'Jan 5, 2026', title: 'New Dojo Opening — West District', desc: 'SKF expands its reach with a new dojo in West District under Sensei Ravi. Training sessions for all age groups starting January 15.' },
    { cat: 'Event', icon: <FaCalendarAlt />, date: 'Dec 28, 2025', title: 'Annual Day Celebration & Awards Night', desc: 'A spectacular evening celebrating the achievements of our karateka. Year-end awards presented to the best athletes, coaches, and dojos.' },
]

const catColor = { Results: 'cat--results', Promotion: 'cat--promotion', Announcement: 'cat--announcement', Achievement: 'cat--results', Update: 'cat--update', Event: 'cat--event' }

export default function NewsPage() {
    return (
        <div className="news-page">
            <section className="page-hero">
                <div className="page-hero__bg">
                    <div className="glow glow-gold page-hero__glow-1"></div>
                    <div className="glow glow-blue page-hero__glow-2"></div>
                </div>
                <div className="container page-hero__content">
                    <span className="section-label"><FaBullhorn /> News & Updates</span>
                    <h1 className="page-hero__title">Latest from <span className="text-gradient">SKF</span></h1>
                    <p className="page-hero__subtitle">Results, Promotions & Announcements</p>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <div className="news__grid">
                        {newsItems.map((item, i) => (
                            <div className="glass-card news-card" key={i}>
                                <div className="news-card__top">
                                    <span className={`news-cat ${catColor[item.cat]}`}>{item.icon} {item.cat}</span>
                                    <span className="news-card__date">{item.date}</span>
                                </div>
                                <h3>{item.title}</h3>
                                <p>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
