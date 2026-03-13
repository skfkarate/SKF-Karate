import Link from 'next/link'
import Image from 'next/image'
import { FaFire, FaCalendarAlt, FaArrowRight, FaQuoteLeft, FaStar, FaShieldAlt, FaMapMarkerAlt, FaClock, FaUsers, FaWhatsapp, FaPhoneAlt, FaQuestion } from 'react-icons/fa'
import { GiBlackBelt, GiNunchaku } from 'react-icons/gi'
import ScrollVideo from '../components/ScrollVideo'
import ScheduleLightbox from '../components/ScheduleLightbox'
import CountdownTimer from '../components/CountdownTimer'
import FAQSection from '../components/FAQSection'
import './summer-camp.css'



export default function SummerCampPage() {
    return (
        <div className="camp-page">
            {/* ===== HERO ===== */}
            <section className="page-hero camp-hero">
                <div className="page-hero__bg">
                    <div className="glow glow-red page-hero__glow-1"></div>
                    <div className="glow glow-gold page-hero__glow-2"></div>
                </div>
                <div className="container page-hero__content">
                    <span className="section-label camp-pulse"><FaFire /> Limited Slots Available</span>
                    <h1 className="page-hero__title">Summer Camp <span className="text-gradient">2026</span></h1>
                    <p className="page-hero__subtitle">
                        Transform their summer with focus and real-world self-defense.
                    </p>
                    <CountdownTimer targetDate="2026-04-01T06:00:00+05:30" />
                </div>
            </section>

            {/* ===== WHY CHOOSE US (DUAL APPEAL) ===== */}
            <section className="section benefits">
                <div className="container">
                    <div className="benefits__grid">
                        <div className="benefit-card">
                            <div className="benefit-card__image">
                                <Image src="/summer-camp/screen-free-growth.png" alt="Kids training karate with focus and discipline" fill style={{ objectFit: 'cover' }} />
                                <div className="benefit-card__image-overlay"></div>
                            </div>
                            <div className="benefit-card__icon-badge"><FaShieldAlt /></div>
                            <div className="benefit-card__content">
                                <h4>Screen-Free Growth</h4>
                                <p>
                                    Swap smartphones for smart moves. We build focus, respect, and physical fitness in a highly disciplined environment.
                                </p>
                            </div>
                        </div>
                        <div className="benefit-card benefit-card--highlight">
                            <div className="benefit-card__image">
                                <Image src="/summer-camp/real-ninja-skills.png" alt="Nunchaku weapon training" fill className="benefit-card__img-ninja" style={{ objectFit: 'cover' }} />
                                <div className="benefit-card__image-overlay benefit-card__image-overlay--crimson"></div>
                            </div>
                            <div className="benefit-card__icon-badge benefit-card__icon-badge--crimson"><GiNunchaku /></div>
                            <div className="benefit-card__content">
                                <h4>Real Ninja Skills</h4>
                                <p>
                                    Master the Nunchaku, learn cool self-defense strikes, and earn your certified summer camp belt!
                                </p>
                            </div>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-card__image">
                                <Image src="/summer-camp/safe-supervised.png" alt="Sensei supervising student training" fill style={{ objectFit: 'cover' }} />
                                <div className="benefit-card__image-overlay"></div>
                            </div>
                            <div className="benefit-card__icon-badge"><FaUsers /></div>
                            <div className="benefit-card__content">
                                <h4>Safe &amp; Supervised</h4>
                                <p>
                                    10+ years experienced Senseis ensuring a 100% safe, injury-free, and encouraging mat experience.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== PRICING / PROGRAMS ===== */}
            <section className="section programs" id="pricing">
                <div className="container">
                    <div className="programs__header">
                        <span className="section-label"><GiBlackBelt /> Camp Structure</span>
                        <h2 className="section-title">Training Plans &amp; <span className="text-gradient">Pricing</span></h2>
                        <p className="section-subtitle programs__subtitle">
                            Choose a single month of specialized training or get the ultimate experience by enrolling for both.
                        </p>
                    </div>

                    {/* ===== EARLY BIRD OFFER BANNER ===== */}
                    <div className="offer-banner glass-card">
                        <div className="offer-banner__glow"></div>
                        <div className="offer-banner__content">
                            <div className="offer-banner__badge">1+1 Free Offer</div>
                            <h3><FaFire className="offer-banner__icon" /> First 10 Enrollments Special</h3>
                            <p>
                                Enroll for the Full Camp and get <strong>1 Month FREE!</strong><br />
                                Pay only <strong className="text-gold">₹1,500</strong> instead of <span className="price-strike">₹2,500</span>.
                            </p>
                        </div>
                    </div>

                    <div className="programs__grid">
                        <div className="glass-card program-card">
                            <div className="program-card__header">
                                <div className="program-card__icon"><FaShieldAlt /></div>
                                <h3>Month 1</h3>
                                <p className="program-card__level">Self Defense Training</p>
                                <div className="program-card__price">₹1,500<span>/mo</span></div>
                            </div>
                            <ul className="program-card__features">
                                <li><strong>For kids:</strong> Cool reflex & evasion games</li>
                                <li><strong>For parents:</strong> Screen-free discipline building</li>
                                <li>Practical self-defense techniques</li>
                                <li>Situational awareness / Bully prevention</li>
                                <li>Certified completion certificate</li>
                            </ul>
                            <Link href="/contact" className="btn btn-secondary program-card__btn">Enroll Month 1</Link>
                        </div>

                        <div className="glass-card program-card program-card--featured program-card--offer">
                            <div className="program-card__badge">First 10 Slots</div>
                            <div className="program-card__header">
                                <div className="program-card__icon"><GiBlackBelt /></div>
                                <h3>Full Camp</h3>
                                <p className="program-card__level">Both Months (1 Month Free!)</p>
                                <div className="program-card__price">
                                    <span className="program-card__price-old">₹2,500</span>
                                    ₹1,500<span>/total</span>
                                </div>
                            </div>
                            <ul className="program-card__features">
                                <li>Month 1: Self Defense (Discipline & Focus)</li>
                                <li>Month 2: Nunchaku (Coordination & Agility)</li>
                                <li>Comprehensive fitness & stamina building</li>
                                <li>Mastery of a predefined Nunchaku sequence</li>
                                <li>Certified completion certificate</li>
                            </ul>
                            <Link href="/contact" className="btn btn-primary program-card__btn">Enroll Full Camp <FaArrowRight /></Link>
                        </div>

                        <div className="glass-card program-card">
                            <div className="program-card__header">
                                <div className="program-card__icon"><GiNunchaku /></div>
                                <h3>Month 2</h3>
                                <p className="program-card__level">Nunchaku Weapon Training</p>
                                <div className="program-card__price">₹1,500<span>/mo</span></div>
                            </div>
                            <ul className="program-card__features">
                                <li><strong>For kids:</strong> Learn movie-style strikes</li>
                                <li><strong>For parents:</strong> Safe, foam training weapons</li>
                                <li>Nunchaku basics, grips, and safety</li>
                                <li>Hand-eye coordination drills</li>
                                <li>Certified completion certificate</li>
                            </ul>
                            <Link href="/contact" className="btn btn-secondary program-card__btn">Enroll Month 2</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== LOCATION / MAP ===== */}
            <section className="section location">
                <div className="container">
                    <div className="location__header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <span className="section-label"><FaMapMarkerAlt /> Camp Venue</span>
                        <h2 className="section-title">Where the <span className="text-gradient">Action Happens</span></h2>
                        <p className="section-subtitle" style={{ margin: '0 auto' }}>
                            MP SPORTS CLUB <br/>
                            14/1, 2nd Main Rd, M P M Layout, Mallathahalli, Bengaluru, Karnataka 560056
                        </p>
                    </div>
                    
                    <div className="glass-card" style={{ padding: '1rem', borderRadius: '24px', overflow: 'hidden' }}>
                        <iframe 
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.243542284908!2d77.49663027581781!3d12.956277315214044!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae3dc569913063%3A0xcb13e17fedec54d0!2sMP%20SPORTS%20CLUB!5e0!3m2!1sen!2sin!4v1710323719948!5m2!1sen!2sin"
                            width="100%" 
                            height="450" 
                            style={{ border: 0, borderRadius: '16px', filter: 'invert(90%) hue-rotate(180deg) contrast(85%)' }} 
                            allowFullScreen="" 
                            loading="lazy" 
                            referrerPolicy="no-referrer-when-downgrade"
                            title="SKF Karate Location"
                        ></iframe>
                    </div>
                </div>
            </section>

            {/* ===== INSTRUCTOR / SENSEI ===== */}
            <section className="section sensei">
                <div className="glow glow-gold sensei__glow"></div>
                <div className="container">
                    <div className="sensei__header">
                        <span className="section-label"><GiBlackBelt /> Your Instructor</span>
                        <h2 className="section-title">Meet Your <span className="text-gradient">Sensei</span></h2>
                    </div>
                    <div className="sensei__content glass-card">
                        <div className="sensei__avatar">
                            <GiBlackBelt />
                        </div>
                        <div className="sensei__info">
                            <h3>Sensei Usha C</h3>
                            <p className="sensei__title">President - SKF Karate</p>
                            <p className="sensei__bio">
                                Sensei Usha C (4th Dan Black Belt & Senior Instructor) leads the SKF Karate Summer Camp 2026.
                                Specializing in self-defense, fitness, and Nunchaku, she blends traditional discipline
                                with modern techniques to build strength, resilience, and confidence in every student.
                            </p>
                            <div className="sensei__stats">
                                <div className="sensei__stat">
                                    <span className="sensei__stat-number">500+</span>
                                    <span className="sensei__stat-label">Students Trained</span>
                                </div>
                                <div className="sensei__stat">
                                    <span className="sensei__stat-number">10+</span>
                                    <span className="sensei__stat-label">Years Experience</span>
                                </div>
                                <div className="sensei__stat">
                                    <span className="sensei__stat-number">3</span>
                                    <span className="sensei__stat-label">Dojo Branches</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== RECENT CAMP VIDEO ===== */}
            <section className="section recent-camp">
                <div className="container">
                    <div className="recent-camp__header">
                        <span className="section-label"><FaStar /> From Our Recent Camp</span>
                        <h2 className="section-title">We Taught. They <span className="text-gradient">Learned.</span></h2>
                        <p className="section-subtitle recent-camp__subtitle">
                            Here&apos;s a glimpse from our recent training camp — real students, real progress.
                        </p>
                    </div>

                    <div className="recent-camp__video-wrapper">
                        <ScrollVideo />
                    </div>
                </div>
            </section>

            {/* ===== TESTIMONIALS ===== */}
            <section className="section testimonials">
                <div className="container">
                    <div className="testimonials__header">
                        <span className="section-label"><FaStar /> Testimonials</span>
                        <h2 className="section-title">What Our <span className="text-gradient">Students Say</span></h2>
                    </div>

                    {/* ===== FEATURED QUOTE ===== */}
                    <div className="featured-quote glass-card">
                        <FaQuoteLeft className="featured-quote__icon" />
                        <h3 className="featured-quote__text">
                            &quot;I was worried it would be too violent, but it&apos;s actually all about <strong className="text-gold">discipline, respect, and fitness</strong>. My 8-year-old absolutely loves it and even wakes up early to practice!&quot;
                        </h3>
                        <div className="featured-quote__author">
                            <div className="featured-quote__avatar">A</div>
                            <div className="featured-quote__info">
                                <strong>Anjali M.</strong>
                                <span>Parent of 8-year-old</span>
                            </div>
                        </div>
                    </div>

                    <div className="testimonials__slider">
                        <div className="testimonials__track">
                            {[
                                { name: "Anjali M.", role: "Parent of 8yo", text: "My son used to be very shy, but his confidence has completely changed. He even wakes up early by himself for practice!" },
                                { name: "Rahul S.", role: "Parent of 10yo", text: "The discipline they teach here is excellent. Along with karate, they are teaching real respect for elders and teachers." },
                                { name: "Priya K.", role: "Parent of 6yo", text: "I was worried about screen time during holidays. This camp was the perfect mix of serious training and fun." },
                                { name: "Vikram R.", role: "Parent of 12yo", text: "Best summer investment. He stopped playing video games all day and actually looks forward to the fitness routines." },
                                { name: "Neha D.", role: "Parent of 9yo", text: "The self-defense techniques are so practical. As a mother, it gives me great peace of mind knowing she can protect herself." },
                                { name: "Suresh P.", role: "Parent of 7yo", text: "Very professional and safe environment. The Senseis are strict on the mat but very encouraging with the kids." },
                                { name: "Kavita N.", role: "Parent of 11yo", text: "We noticed an improvement in his focus, even in his studies! Karate has really taught him how to concentrate." },
                                { name: "Arvind V.", role: "Parent of 8yo", text: "Fantastic energy. It's not just hitting and kicking; they focus heavily on warmups, stretching, and proper technique." },
                                { name: "Meera C.", role: "Parent of 14yo", text: "Even my teenager, who argues about everything, absolutely loved the Nunchaku training. Highly recommended." },
                                { name: "Amit B.", role: "Parent of 6yo & 9yo", text: "Both my kids come home totally exhausted and happy. It's the best way to utilize their summer break productively." }
                            ].map((testimonial, i) => (
                                <div key={i} className="glass-card testimonial-card">
                                    <FaQuoteLeft className="testimonial-card__quote" />
                                    <p>&quot;{testimonial.text}&quot;</p>
                                    <div className="testimonial-card__author">
                                        <div className="testimonial-card__avatar">{testimonial.name.charAt(0)}</div>
                                        <div><strong>{testimonial.name}</strong><span>{testimonial.role}</span></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="testimonials__track" aria-hidden="true">
                            {[
                                { name: "Anjali M.", role: "Parent of 8yo", text: "My son used to be very shy, but his confidence has completely changed. He even wakes up early by himself for practice!" },
                                { name: "Rahul S.", role: "Parent of 10yo", text: "The discipline they teach here is excellent. Along with karate, they are teaching real respect for elders and teachers." },
                                { name: "Priya K.", role: "Parent of 6yo", text: "I was worried about screen time during holidays. This camp was the perfect mix of serious training and fun." },
                                { name: "Vikram R.", role: "Parent of 12yo", text: "Best summer investment. He stopped playing video games all day and actually looks forward to the fitness routines." },
                                { name: "Neha D.", role: "Parent of 9yo", text: "The self-defense techniques are so practical. As a mother, it gives me great peace of mind knowing she can protect herself." },
                                { name: "Suresh P.", role: "Parent of 7yo", text: "Very professional and safe environment. The Senseis are strict on the mat but very encouraging with the kids." },
                                { name: "Kavita N.", role: "Parent of 11yo", text: "We noticed an improvement in his focus, even in his studies! Karate has really taught him how to concentrate." },
                                { name: "Arvind V.", role: "Parent of 8yo", text: "Fantastic energy. It's not just hitting and kicking; they focus heavily on warmups, stretching, and proper technique." },
                                { name: "Meera C.", role: "Parent of 14yo", text: "Even my teenager, who argues about everything, absolutely loved the Nunchaku training. Highly recommended." },
                                { name: "Amit B.", role: "Parent of 6yo & 9yo", text: "Both my kids come home totally exhausted and happy. It's the best way to utilize their summer break productively." }
                            ].map((testimonial, i) => (
                                <div key={`dup-${i}`} className="glass-card testimonial-card">
                                    <FaQuoteLeft className="testimonial-card__quote" />
                                    <p>&quot;{testimonial.text}&quot;</p>
                                    <div className="testimonial-card__author">
                                        <div className="testimonial-card__avatar">{testimonial.name.charAt(0)}</div>
                                        <div><strong>{testimonial.name}</strong><span>{testimonial.role}</span></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FAQ ===== */}
            <section className="section faq">
                <div className="container">
                    <div className="faq__header">
                        <span className="section-label"><FaQuestion /> FAQ</span>
                        <h2 className="section-title">Frequently Asked <span className="text-gradient">Questions</span></h2>
                        <p className="section-subtitle faq__subtitle">
                            Everything parents need to know before enrolling.
                        </p>
                    </div>
                    <FAQSection />
                </div>
            </section>

            {/* ===== BOTTOM CTA WITH WHATSAPP ===== */}
            <section className="section camp-bottom-cta">
                <div className="glow glow-red camp-bottom-cta__glow"></div>
                <div className="container">
                    <div className="camp-bottom-cta__inner glass-card">
                        <h2 className="section-title">Ready to Step on the Mat?</h2>
                        <p className="section-subtitle camp-bottom-cta__subtitle">
                            Enrollment is open but slots are limited. Secure your spot today.
                        </p>
                        <div className="camp-bottom-cta__buttons">
                            <Link href="/contact" className="btn btn-primary">Enroll Now <FaArrowRight /></Link>
                            <a href="tel:+910000000000" className="btn btn-secondary"><FaPhoneAlt /> Call Us</a>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    )
}
