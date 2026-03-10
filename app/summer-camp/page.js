import Link from 'next/link'
import { FaFire, FaBrain, FaCalendarAlt, FaClock, FaArrowRight, FaQuoteLeft, FaStar } from 'react-icons/fa'
import { GiBlackBelt } from 'react-icons/gi'
import './summer-camp.css'

export const metadata = {
    title: 'Summer Camp 2026 — Karate Training Camp for All Levels',
    description: 'SKF Karate Summer Camp 2026 — intensive karate training camp for beginners to advanced. Foundation, Advanced & Elite programs. Kata, kumite, fitness, self-defence. Limited slots available!',
    openGraph: { title: 'SKF Karate Summer Camp 2026', description: 'Intensive karate training camp — Foundation, Advanced & Elite programs. Limited slots!' },
    alternates: { canonical: 'https://skfkarate.org/summer-camp' },
}

export default function SummerCampPage() {
    return (
        <div className="camp-page">
            <section className="page-hero camp-hero">
                <div className="page-hero__bg">
                    <div className="glow glow-red page-hero__glow-1"></div>
                    <div className="glow glow-gold page-hero__glow-2"></div>
                </div>
                <div className="container page-hero__content">
                    <span className="section-label camp-pulse"><FaFire /> Limited Slots Available</span>
                    <h1 className="page-hero__title">Summer Camp <span className="text-gradient">2026</span></h1>
                    <p className="page-hero__subtitle">Sports Karate-do Fitness & Self Defence Association®</p>
                </div>
            </section>

            <section className="section programs">
                <div className="container">
                    <div className="programs__header">
                        <span className="section-label"><GiBlackBelt /> Training Programs</span>
                        <h2 className="section-title">Choose Your <span className="text-gradient">Path</span></h2>
                        <p className="section-subtitle" style={{ margin: '0 auto' }}>
                            Three intensive programs designed for every level — from first-timers to aspiring black belts.
                        </p>
                    </div>

                    <div className="programs__grid">
                        <div className="glass-card program-card">
                            <div className="program-card__header">
                                <div className="program-card__icon"><FaFire /></div>
                                <h3>Foundation</h3>
                                <p className="program-card__level">Beginner</p>
                            </div>
                            <ul className="program-card__features">
                                <li>Basic kata & stance training</li>
                                <li>Physical conditioning</li>
                                <li>Self-defense fundamentals</li>
                                <li>Discipline & dojo etiquette</li>
                                <li>White to Orange belt prep</li>
                            </ul>
                            <Link href="/contact" className="btn btn-secondary program-card__btn">Enroll Now</Link>
                        </div>

                        <div className="glass-card program-card program-card--featured">
                            <div className="program-card__badge">Most Popular</div>
                            <div className="program-card__header">
                                <div className="program-card__icon"><GiBlackBelt /></div>
                                <h3>Advanced</h3>
                                <p className="program-card__level">Intermediate</p>
                            </div>
                            <ul className="program-card__features">
                                <li>Advanced kata sequences</li>
                                <li>Controlled sparring</li>
                                <li>Competition preparation</li>
                                <li>Mental fortitude training</li>
                                <li>Green to Brown belt prep</li>
                            </ul>
                            <Link href="/contact" className="btn btn-primary program-card__btn">Enroll Now <FaArrowRight /></Link>
                        </div>

                        <div className="glass-card program-card">
                            <div className="program-card__header">
                                <div className="program-card__icon"><FaBrain /></div>
                                <h3>Elite</h3>
                                <p className="program-card__level">Advanced</p>
                            </div>
                            <ul className="program-card__features">
                                <li>Black belt preparation</li>
                                <li>Tournament fighting</li>
                                <li>Advanced pressure drills</li>
                                <li>Leadership & teaching skills</li>
                                <li>Master-level mentorship</li>
                            </ul>
                            <Link href="/contact" className="btn btn-secondary program-card__btn">Enroll Now</Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section schedule">
                <div className="glow glow-blue schedule__glow"></div>
                <div className="container">
                    <div className="schedule__header">
                        <span className="section-label"><FaCalendarAlt /> Daily Schedule</span>
                        <h2 className="section-title">A Day at <span className="text-gradient">Camp</span></h2>
                    </div>
                    <div className="schedule__table glass-card">
                        <div className="schedule__row schedule__row--header">
                            <span><FaClock /> Time</span>
                            <span>Activity</span>
                        </div>
                        <div className="schedule__row"><span className="schedule__time">6:00 AM</span><span>Morning Warm-up & Meditation</span></div>
                        <div className="schedule__row"><span className="schedule__time">7:00 AM</span><span>Kata Training & Form Drills</span></div>
                        <div className="schedule__row"><span className="schedule__time">9:00 AM</span><span>Breakfast Break</span></div>
                        <div className="schedule__row"><span className="schedule__time">10:00 AM</span><span>Sparring & Combat Techniques</span></div>
                        <div className="schedule__row"><span className="schedule__time">12:00 PM</span><span>Lunch & Rest</span></div>
                        <div className="schedule__row"><span className="schedule__time">2:00 PM</span><span>Fitness Conditioning & Agility</span></div>
                        <div className="schedule__row"><span className="schedule__time">4:00 PM</span><span>Self-Defense Scenarios & Cool Down</span></div>
                    </div>
                </div>
            </section>

            <section className="section testimonials">
                <div className="container">
                    <div className="testimonials__header">
                        <span className="section-label"><FaStar /> Testimonials</span>
                        <h2 className="section-title">What Our <span className="text-gradient">Students Say</span></h2>
                    </div>
                    <div className="testimonials__grid">
                        <div className="glass-card testimonial-card">
                            <FaQuoteLeft className="testimonial-card__quote" />
                            <p>&quot;SKF Karate completely transformed my confidence. The discipline I learned on the mat applies to every aspect of my life.&quot;</p>
                            <div className="testimonial-card__author">
                                <div className="testimonial-card__avatar">S</div>
                                <div><strong>Student</strong><span>Brown Belt</span></div>
                            </div>
                        </div>
                        <div className="glass-card testimonial-card">
                            <FaQuoteLeft className="testimonial-card__quote" />
                            <p>&quot;My children have grown so much — not just in their karate skills but in their respect, focus, and determination.&quot;</p>
                            <div className="testimonial-card__author">
                                <div className="testimonial-card__avatar">P</div>
                                <div><strong>Parent</strong><span>2 Children Enrolled</span></div>
                            </div>
                        </div>
                        <div className="glass-card testimonial-card">
                            <FaQuoteLeft className="testimonial-card__quote" />
                            <p>&quot;The Summer Camp was an unforgettable experience. I went from a beginner to earning my Orange belt in just one month!&quot;</p>
                            <div className="testimonial-card__author">
                                <div className="testimonial-card__avatar">K</div>
                                <div><strong>Camp Graduate</strong><span>Orange Belt</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section camp-bottom-cta">
                <div className="container">
                    <div className="camp-bottom-cta__inner glass-card">
                        <h2 className="section-title">Ready to Step on the Mat?</h2>
                        <p className="section-subtitle" style={{ margin: '0 auto 2rem auto', textAlign: 'center' }}>
                            Enrollment is open but slots are limited. Secure your spot today.
                        </p>
                        <Link href="/contact" className="btn btn-primary">Enroll Now <FaArrowRight /></Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
