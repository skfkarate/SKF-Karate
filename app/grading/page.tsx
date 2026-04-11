'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { FaArrowRight, FaFistRaised } from 'react-icons/fa'
import { GiBlackBelt, GiYinYang } from 'react-icons/gi'
import './grading.css'
import { allDojos } from '@/lib/data/dojos'

const kyuBelts = [
    { kyu: '10th Kyu', belt: 'White Belt', color: '#f8f9fa', textSync: '#212529', desc: "\"In the beginner's mind there are many possibilities, in the expert's mind there are few.\" — Shunryū Suzuki. White represents Shoshin (初心), the empty mind ready to receive. You own nothing yet — and that is your greatest advantage." },
    { kyu: '9th Kyu', belt: 'Yellow Belt', color: '#ffb703', textSync: '#ffffff', desc: "The first sunrise. As Gichin Funakoshi taught: \"Karate begins and ends with courtesy.\" The yellow belt learns that every technique starts with Rei (礼) — respect and humility on the tatami." },
    { kyu: '8th Kyu', belt: 'Orange Belt', color: '#fb8500', textSync: '#ffffff', desc: "The warming fire within. The practitioner discovers Kime (決め) — the art of focusing total energy into a single decisive point. Movements transition from mechanical repetition to deliberate intent." },
    { kyu: '7th Kyu', belt: 'Green II', color: '#2a9d8f', textSync: '#ffffff', desc: "The bamboo bends but never breaks. At this stage, the karateka learns Tai Sabaki (体捌き) — body shifting to evade and redirect force. As Miyamoto Musashi wrote: \"Do not waste movement. Do not waste time.\"" },
    { kyu: '6th Kyu', belt: 'Green I', color: '#206a5d', textSync: '#ffffff', desc: "Deep roots, unbending trunk. The student begins to grasp Koshi (腰) — generating devastating power from the hips, not the arms. Every senior karateka knows: the punch is born in the floor, travels through the hips, and exits through the fist." },
    { kyu: '5th Kyu', belt: 'Blue Belt', color: '#023e8a', textSync: '#ffffff', desc: "The ocean has no wasted motion. Blue represents the pursuit of Nagare (流れ) — flow. Techniques begin to chain seamlessly. The gap between thought and action narrows. As the ancient maxim states: \"Flowing water never goes stale.\"" },
    { kyu: '4th Kyu', belt: 'Purple Belt', color: '#7209b7', textSync: '#ffffff', desc: "\"To know the Kata is not enough. You must know the Bunkai.\" Purple marks the threshold where the student looks beyond the visible form and discovers the hidden combat applications (Bunkai 分解) embedded within every Kata since the Okinawan masters." },
    { kyu: '3rd Kyu', belt: 'Brown III', color: '#cd7f32', textSync: '#ffffff', desc: "The harvest before winter. Brown represents earth — the karateka is grounded, conditioned, dangerous. The concept of Ikken Hissatsu (一拳必殺) — \"one strike, certain defeat\" — becomes the standard. No technique is thrown without total commitment." },
    { kyu: '2nd Kyu', belt: 'Brown II', color: '#a0522d', textSync: '#ffffff', desc: "Zanshin (残心) — the lingering mind. After delivering a technique, the warrior remains alert, poised, unfinished. There is no relaxation until the threat is neutralized. At this level, mental discipline eclipses physical ability." },
    { kyu: '1st Kyu', belt: 'Brown I', color: '#5c4033', textSync: '#ffffff', desc: "\"Before enlightenment, chop wood, carry water. After enlightenment, chop wood, carry water.\" The final Kyu grade demands absolute mastery of fundamentals. Fancy techniques mean nothing — Kihon (基本), the basics, must be flawless under any condition." },
]

const danGrades = [
    { dan: 'Shodan', level: '1st Dan', kanji: '初段', role: 'Sempai — Senior Student', principle: 'Hitotsu! Doryoku no Seishin wo Yashinau Koto — Foster the spirit of effort.', desc: "\"Shodan does not mean expert. It means you are now ready to truly begin.\" — Gichin Funakoshi. The Black Belt is not a destination; it is permission to start learning Karate-do for real. The ego dissolves; the student is reborn." },
    { dan: 'Nidan', level: '2nd Dan', kanji: '弐段', role: 'Sempai — Mentor & Demonstrator', principle: 'Hitotsu! Makoto no Michi wo Mamoru Koto — Be faithful and sincere.', desc: "The rough edges are polished. Techniques become silk over steel — smooth on the surface, devastating underneath. The Nidan practitioner begins teaching junior students, learning that to teach is the deepest form of understanding." },
    { dan: 'Sandan', level: '3rd Dan', kanji: '参段', role: 'Sensei — Qualified Instructor', principle: 'Hitotsu! Reigi wo Omonzuru Koto — Respect others and practice etiquette.', desc: "\"Karate is not about winning. Karate is about not losing — not losing your composure, not losing your dignity.\" At Sandan, Bunkai mastery is expected. The practitioner sees the invisible threads connecting every Kata to real combat." },
    { dan: 'Yondan', level: '4th Dan', kanji: '四段', role: 'Shihan-Dai — Master Instructor', principle: 'Hitotsu! Kekki no Yu wo Imashimuru Koto — Refrain from violent and impetuous behaviour.', desc: "Sensei (先生) — \"one who has walked before.\" The Yondan has earned the full right to lead a Dojo, shape curriculum, and forge the next generation. Physical technique and teaching pedagogy exist in perfect Wa (和) — harmony." },
    { dan: 'Godan', level: '5th Dan', kanji: '五段', role: 'Shihan — Grand Master', principle: 'Hitotsu! Jinkaku Kansei ni Tsutomuru Koto — Seek perfection of character.', desc: "Mushin (無心) — the mind of no mind. At Godan, technique is forgotten because it has become the practitioner. There is no separation between thought and action. The body moves; the conscious mind simply watches. This is the way of the master." },
]

export default function GradingPage() {
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if(entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });

        document.querySelectorAll('.slab-reveal, .dan-reveal').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    return (
        <div className="grad-redesign">
            {/* ═══════ THE ZENITH HERO ═══════ */}
            <section className="grad-hero">
                <div className="grad-hero__bg"></div>
                
                <div className="container grad-hero__content">
                    <div className="grad-hero__badge">
                        <GiYinYang className="spin-icon"/> Pathway to Mastery
                    </div>
                    <h1 className="grad-hero__title">
                        The Evolution of <br /><span className="text-gradient">Power & Mind</span>
                    </h1>
                    <p className="grad-hero__subtitle">
                        Grading is not merely a test of physical strength. It is an intricate, agonizing, and profoundly beautiful shedding of limitations. Track the legendary journey from 10th Kyu to 5th Dan.
                    </p>
                </div>

                <div className="grad-hero__kanji-bg">級 / 段</div>
            </section>

            {/* ═══════ THE KYU JOURNEY (Sticky Scroll & Floating Glass) ═══════ */}
            <section className="grad-kyu-section">
                <div className="container">
                    <div className="kyu-split-layout">
                        {/* Left Side: Sticky Header */}
                        <div className="kyu-sticky-header slab-reveal">
                            <span className="section-label"><FaFistRaised /> The Foundation</span>
                            <h2 className="section-title">The Path of <span className="text-gradient">Color</span></h2>
                            <p className="kyu-sticky-desc">
                                The vibrant colors of the Kyu belts represent the shifting elements of nature as a student grows. An arduous journey of shedding ego and building unbreakable spirit.
                            </p>
                            <div className="kyu-scroll-indicator">
                                <span>Scroll the Journey</span>
                                <div className="scroll-line"></div>
                            </div>
                        </div>

                        {/* Right Side: Flowing Glass Cards */}
                        <div className="kyu-cards-flow">
                            {kyuBelts.map((rank, i) => (
                                <div className="kyu-glass-card slab-reveal" key={rank.kyu}>
                                    <div className="kyu-ethereal-glow" style={{ background: `radial-gradient(circle at top right, ${rank.color} 0%, transparent 60%)` }}></div>
                                    <div className="kyu-card-inner">
                                        <div className="kyu-rank-meta">
                                            <div className="kyu-orb" style={{ background: rank.color, boxShadow: `0 0 20px ${rank.color}80` }}></div>
                                            <span className="kyu-number">{10 - i}</span>
                                        </div>
                                        <div className="kyu-text-content">
                                            <div className="kyu-titles">
                                                <h3>{rank.kyu}</h3>
                                                <span className="kyu-belt-name" style={{ color: rank.color }}>{rank.belt}</span>
                                            </div>
                                            <p className="kyu-desc">{rank.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ THE DAN SANCTUARY (Sticky Scroll) ═══════ */}
            <section className="grad-dan-sanctuary">
                <div className="sanctuary-bg-glow"></div>
                
                <div className="container">
                    <div className="kyu-split-layout">
                        {/* Left Side: Sticky Header */}
                        <div className="kyu-sticky-header slab-reveal">
                            <GiBlackBelt className="sanctuary-icon" />
                            <h2 className="section-title">The Dan <br/><span className="text-gradient-gold">Sanctuary</span></h2>
                            <p className="kyu-sticky-desc text-secondary">
                                Black Belt is the beginning. This is where physical execution transcends into sheer artistry, pedagogical mastery, and unquestionable leadership.
                            </p>
                            <div className="kyu-scroll-indicator text-gold">
                                <span>Ascend the Ranks</span>
                                <div className="scroll-line scroll-line-gold"></div>
                            </div>
                        </div>

                        {/* Right Side: Flowing Monolith Cards */}
                        <div className="kyu-cards-flow">
                            {danGrades.map((dan, idx) => (
                                <div className="dan-monolith slab-reveal" key={dan.dan}>
                                    <div className="monolith-glow"></div>
                                    <div className="monolith-content">
                                        <div className="monolith-stripe"></div>
                                        <div className="monolith-kanji">{dan.kanji}</div>
                                        <h3 className="monolith-title">{dan.dan}</h3>
                                        <span className="monolith-level">{dan.level}</span>
                                        <span className="monolith-role">{dan.role}</span>
                                        <p className="monolith-desc">{dan.desc}</p>
                                        <div className="monolith-principle">
                                            <em>{dan.principle}</em>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ GRADING PER BRANCH ═══════ */}
            <section className="grad-branches-section slab-reveal pb-standard pt-huge center-text">
                <div className="container">
                    <span className="section-label">Find Your Examiner</span>
                    <h2 className="section-title">Book Your <span className="text-gradient">Grading</span></h2>
                    <p className="text-secondary contained-subtitle mb-standard">
                        Grading sessions are conducted locally at your primary dojo. Select your branch below to view Sensei details and arrange your Kyu test.
                    </p>
                    <div className="flex-center-wrap gap-small">
                        {allDojos.map(dojo => (
                            <Link 
                                key={dojo.id} 
                                href={`/dojos/${dojo.slug}`}
                                className="btn dojo-book-btn"
                            >
                                Book at {dojo.name.split(' ')[0]}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════ JOURNEY CTA ═══════ */}
            <section className="grad-cta-section">
                <div className="container">
                    <div className="grad-cta-monolith slab-reveal">
                        <div className="grad-cta-monolith__glow"></div>
                        <div className="grad-cta-monolith__kanji">道</div>
                        <div className="grad-cta-monolith__stripe"></div>
                        <h2 className="grad-cta-monolith__title">The Path Awaits</h2>
                        <p className="grad-cta-monolith__subtitle">
                            &ldquo;A black belt is a white belt who never quit.&rdquo;<br />
                            Speak with your Sensei. When both mind and body are aligned, the grading board will summon you.
                        </p>
                        <div className="grad-cta-monolith__actions">
                            <Link href="/events" className="btn btn-primary">View Events Calendar <FaArrowRight /></Link>
                            <Link href="/dojos" className="btn btn-secondary">Contact Your Dojo</Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
