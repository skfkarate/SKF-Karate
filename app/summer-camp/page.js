import Link from 'next/link'
import Image from 'next/image'
import { FaFire, FaCalendarAlt, FaArrowRight, FaQuoteLeft, FaStar, FaShieldAlt, FaMapMarkerAlt, FaClock, FaUsers, FaWhatsapp, FaPhoneAlt, FaQuestion } from 'react-icons/fa'
import { GiBlackBelt, GiNunchaku } from 'react-icons/gi'
import ScrollVideo from '../_components/pages/summer-camp/SummerCampVideo'
import CountdownTimer from '../_components/pages/summer-camp/SummerCampCountdownTimer'
import FAQSection from '../_components/pages/summer-camp/SummerCampFAQ'
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
                    <CountdownTimer targetDate="2026-04-03T16:30:00+05:30" />
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
                                    Master the Nunchaku, learn cool self-defense strikes, and earn your summer camp belt!
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

            {/* ===== VIP SCHOLARSHIP PASS ===== */}
            <section className="section vip-pass-section" id="pricing">
                <div className="glow glow-gold"></div>
                
                <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                    <div className="programs__header" style={{ marginBottom: '4rem' }}>
                        <span className="section-label camp-pulse"><FaFire style={{ marginRight: '8px' }}/> The Summer Scholarship</span>
                        <h2 className="section-title">Claim Your <span className="text-gradient">VIP Access</span></h2>
                        <p className="section-subtitle programs__subtitle" style={{ maxWidth: '700px', margin: '0 auto', fontSize: '1.2rem' }}>
                            We are giving away <strong>20 exclusive VIP Passes</strong> that grant your child 100% free access to Month 1 of our immersive Summer Camp. 
                        </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div className="vip-ticket">
                            {/* Left Stub */}
                            <div className="vip-ticket__stub">
                                <div className="ticket-notch-top"></div>
                                <div className="ticket-notch-bottom"></div>
                                <div className="stub-vertical-text">ADMIT ONE</div>
                                <FaShieldAlt className="vip-ticket__stub-icon" />
                                <h3 className="vip-ticket__stub-label">Month 1</h3>
                                <div className="vip-ticket__stub-pass">FREE PASS</div>
                            </div>
                            
                            {/* Right Main Area */}
                            <div className="vip-ticket__main">
                                <div className="vip-ticket__watermark">VIP</div>

                                <div className="vip-ticket__header-row">
                                    <div className="vip-ticket__info">
                                        <div className="vip-ticket__badge">
                                            Strictly Limited to 20 Slots
                                        </div>
                                        <h3 className="vip-title">Ultimate Self Defense <br/><span className="text-gold">Experience</span></h3>
                                        <p className="vip-ticket__tagline">Focus, Discipline, &amp; Real-World Skills.</p>
                                    </div>
                                    <div className="vip-ticket__pricing">
                                        <div className="vip-ticket__old-price">Regular Value: ₹1,500</div>
                                        <div className="vip-price">₹0</div>
                                    </div>
                                </div>

                                <div className="vip-ticket__features">
                                    <div className="vip-ticket__feature">
                                        <div className="vip-ticket__feature-dot"></div>
                                        Real-world self-defense drills
                                    </div>
                                    <div className="vip-ticket__feature">
                                        <div className="vip-ticket__feature-dot"></div>
                                        Screen-free environment
                                    </div>
                                    <div className="vip-ticket__feature">
                                        <div className="vip-ticket__feature-dot"></div>
                                        Reflex &amp; evasion games
                                    </div>
                                    <div className="vip-ticket__feature">
                                        <div className="vip-ticket__feature-dot"></div>
                                        Zero commitment required
                                    </div>
                                </div>

                                <Link href="/summer-camp/enroll" className="btn vip-btn">
                                    Redeem VIP Pass <FaArrowRight />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* ===== LOCATION / MAP ===== */}
            <section className="section location section--tint-mid">
                <div className="container">
                    <div className="location__header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <span className="section-label"><FaMapMarkerAlt /> Camp Venue</span>
                        <h2 className="section-title">Where the <span className="text-gradient">Action Happens</span></h2>
                        <p className="section-subtitle" style={{ margin: '0 auto' }}>
                            MP SPORTS CLUB <br />
                            14/1, 2nd Main Rd, M P M Layout, Mallathahalli, Bengaluru, Karnataka 560056
                        </p>
                    </div>

                    <div className="glass-card" style={{ padding: '1rem', borderRadius: '24px', overflow: 'hidden', position: 'relative' }}>
                        {/* Transparent clickable overlay */}
                        <a
                            href="https://www.google.com/maps/place/MP+SPORTS+CLUB/@12.9570313,77.4992052,17z/data=!4m14!1m7!3m6!1s0x3bae3e9c06dbfd9f:0x35b15daf110f7b7!2sMP+SPORTS+CLUB!8m2!3d12.9570313!4d77.4992052!16s%2Fg%2F11dfk18c3k!3m5!1s0x3bae3e9c06dbfd9f:0x35b15daf110f7b7!8m2!3d12.9570313!4d77.4992052!16s%2Fg%2F11dfk18c3k?entry=ttu"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                zIndex: 10,
                                cursor: 'pointer'
                            }}
                            aria-label="Open MP SPORTS CLUB in Google Maps"
                        ></a>

                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.243542284908!2d77.4966302!3d12.9570313!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae3e9c06dbfd9f%3A0x35b15daf110f7b7!2sMP%20SPORTS%20CLUB!5e0!3m2!1sen!2sin!4v1710323719948!5m2!1sen!2sin"
                            width="100%"
                            height="450"
                            style={{ border: 0, borderRadius: '16px', filter: 'invert(90%) hue-rotate(180deg) contrast(85%)' }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="SKF Karate Location"
                            sandbox="allow-scripts allow-same-origin"
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
            <section className="section recent-camp section--tint-mid">
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
                    {(() => {
                        const testimonials = [
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
                        ]
                        const renderTrack = (items, keyPrefix = '') => (
                            <div className="testimonials__track" aria-hidden={keyPrefix === 'dup-' ? 'true' : undefined}>
                                {items.map((testimonial, i) => (
                                    <div key={`${keyPrefix}${i}`} className="glass-card testimonial-card">
                                        <FaQuoteLeft className="testimonial-card__quote" />
                                        <p>&quot;{testimonial.text}&quot;</p>
                                        <div className="testimonial-card__author">
                                            <div className="testimonial-card__avatar">{testimonial.name.charAt(0)}</div>
                                            <div><strong>{testimonial.name}</strong><span>{testimonial.role}</span></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                        return (
                            <>
                                {renderTrack(testimonials)}
                                {renderTrack(testimonials, 'dup-')}
                            </>
                        )
                    })()}</div>
                </div>
            </section>

            {/* ===== FAQ ===== */}
            <section className="section faq section--tint-mid">
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
                            <Link href="/summer-camp/enroll" className="btn btn-primary">Enroll Now <FaArrowRight /></Link>
                            <a href="tel:+919019971726" className="btn btn-secondary"><FaPhoneAlt /> Call Us</a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FLOATING WHATSAPP BUTTON ===== */}
            <a 
                href="https://wa.me/9019971726" 
                className="floating-whatsapp"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with us on WhatsApp"
            >
                <FaWhatsapp />
            </a>
        </div>
    )
}
