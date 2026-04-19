'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FaSearch, FaTrophy, FaMedal, FaStar } from 'react-icons/fa'
import SearchBox from '@/app/_components/athlete/SearchBox'
import RankingDashboard from '@/app/_components/athlete/RankingDashboard'
import './rankings.css'

export default function RankingsClient({ rankingsData, honoursData }: any) {
    const [activeTab, setActiveTab] = useState<'search' | 'standings' | 'honours'>('search')

    return (
        <div className="rankings-page">
            {/* ═══════ HERO & TABS ═══════ */}
            <section className="rankings-hero">
                <div className="rankings-hero__bg">
                    <div className="glow glow-red rankings-hero__glow-1"></div>
                    <div className="glow glow-gold rankings-hero__glow-2"></div>
                </div>
                
                <div className="container rankings-hero__content">
                    <span className="section-label"><FaTrophy /> Worldwide Performance</span>
                    <h1 className="rankings-hero__title">
                        SKF <span className="text-gradient">Rankings</span>
                    </h1>
                    <p className="rankings-hero__subtitle">
                        Explore athlete profiles, official standings, and our undisputed champions.
                    </p>

                    {/* TABS */}
                    <div className="rankings-tabs-nav">
                        <button 
                            className={`rankings-tab-btn ${activeTab === 'search' ? 'active' : ''}`}
                            onClick={() => setActiveTab('search')}
                        >
                            <FaSearch /> Athlete Lookup
                        </button>
                        <button 
                            className={`rankings-tab-btn ${activeTab === 'standings' ? 'active' : ''}`}
                            onClick={() => setActiveTab('standings')}
                        >
                            <FaTrophy /> Official Standings
                        </button>
                        <button 
                            className={`rankings-tab-btn ${activeTab === 'honours' ? 'active' : ''}`}
                            onClick={() => setActiveTab('honours')}
                        >
                            <FaMedal /> Honours Board
                        </button>
                    </div>
                </div>
            </section>

            {/* ═══════ TAB 1: SEARCH ═══════ */}
            {activeTab === 'search' && (
                <section className="rankings-tab-content active" style={{ padding: '4rem 0 8rem' }}>
                    <div className="container">
                        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '1rem', color: '#fff' }}>Find An Athlete</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                                Search by name or SKF registration number to view full belt history, medals, and career points.
                            </p>
                            <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', border: 'var(--border-glass)' }}>
                                <SearchBox />
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ═══════ TAB 2: STANDINGS ═══════ */}
            {activeTab === 'standings' && (
                <div className="rankings-tab-content active view-dashboard-wrapper">
                    <RankingDashboard 
                        boards={rankingsData.boards} 
                        dojos={rankingsData.dojos} 
                        totalRanked={rankingsData.totalRanked} 
                    />
                </div>
            )}

            {/* ═══════ TAB 3: HONOURS ═══════ */}
            {activeTab === 'honours' && (
                <div className="rankings-tab-content active honours-wrapper">
                    {/* STATS */}
                    <section className="hon-milestones-section" style={{ borderTop: 'none', background: 'transparent', padding: '3rem 0' }}>
                        <div className="container">
                            <div className="hon-stats-row">
                                {honoursData.stats.map((stat: any) => (
                                    <div key={stat.label} className="hon-stat">
                                        <p className="hon-stat__number">{stat.value}</p>
                                        <p className="hon-stat__label">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* CHAMPIONS */}
                    <section className="hon-champions-section" style={{ background: 'transparent' }}>
                        <div className="container">
                        {honoursData.sections.map((section: any) => (
                            <div key={section.title} className="hon-section-block">
                                <div className="text-center" style={{ marginBottom: '2.5rem' }}>
                                    <h2 className="section-title">
                                        {section.title.split(' ')[0]} <span className="text-gradient">{section.title.split(' ').slice(1).join(' ')}</span>
                                    </h2>
                                    <p className="hon-section-desc" style={{ color: 'var(--text-muted)' }}>{section.description}</p>
                                </div>

                                {section.entries.length === 0 ? (
                                    <div className="hon-empty">No qualifying athlete records yet.</div>
                                ) : (
                                    <div className="hon-champ-grid">
                                    {section.entries.map(({ athlete, achievement, label, date }: any) => (
                                        <div key={`${athlete.id}-${achievement.id}`} className="hon-champ-card">
                                            <div className="hon-champ-card__inner">
                                                <div className="hon-champ-card__avatar">
                                                    {athlete.photoUrl ? (
                                                        <Image
                                                            src={athlete.photoUrl}
                                                            alt={`${athlete.firstName} ${athlete.lastName}`}
                                                            width={80} height={80}
                                                            style={{ objectFit: 'cover', borderRadius: '50%' }}
                                                        />
                                                    ) : (
                                                        <span>{athlete.firstName[0]}{athlete.lastName[0]}</span>
                                                    )}
                                                </div>
                                                <h3 className="hon-champ-card__name">
                                                    {athlete.firstName} {athlete.lastName}
                                                </h3>
                                                <p className="hon-champ-card__branch">SKF {athlete.branchName}</p>
                                                <p className="hon-champ-card__achievement" style={{ color: 'var(--gold)' }}>{label}</p>
                                                <p className="hon-champ-card__date">{date}</p>
                                                <div className="hon-champ-card__actions">
                                                    <Link href={`/athlete/${athlete.registrationNumber}`} className="hon-link">
                                                        View Athlete
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        </div>
                    </section>

                    {/* DERIVED AWARDS */}
                    <section className="hon-awards-section" style={{ background: 'var(--bg-card)', borderTop: 'var(--border-glass)', padding: '5rem 0' }}>
                        <div className="container">
                            <div className="text-center" style={{ marginBottom: '3rem' }}>
                                <span className="section-label"><FaStar /> Highlights</span>
                                <h2 className="section-title">
                                    Academy <span className="text-gradient">Records</span>
                                </h2>
                            </div>

                            <div className="hon-awards-grid">
                                {honoursData.derivedAwards.map((award: any) => (
                                    <Link key={award.title} href={award.href} className="hon-award-card">
                                        <p className="hon-award-card__title">{award.title}</p>
                                        <h3 className="hon-award-card__recipient">{award.recipient}</h3>
                                        <p className="hon-award-card__detail" style={{ color: 'var(--gold)' }}>{award.detail}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </div>
    )
}
