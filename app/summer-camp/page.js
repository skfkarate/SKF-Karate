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
            <section className="section vip-pass-section" id="pricing" style={{ position: 'relative', padding: '6rem 0' }}>
                <div className="glow glow-gold" style={{ top: '20%', left: '50%', transform: 'translateX(-50%)', opacity: 0.15, width: '600px', height: '600px' }}></div>
                
                <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                    <div className="programs__header" style={{ marginBottom: '4rem' }}>
                        <span className="section-label camp-pulse" style={{ borderColor: 'var(--color-gold)', color: 'var(--color-gold)' }}><FaFire style={{ marginRight: '8px' }}/> The Summer Scholarship</span>
                        <h2 className="section-title">Claim Your <span className="text-gradient">VIP Access</span></h2>
                        <p className="section-subtitle programs__subtitle" style={{ maxWidth: '700px', margin: '0 auto', fontSize: '1.2rem' }}>
                            We are giving away <strong>20 exclusive VIP Passes</strong> that grant your child 100% free access to Month 1 of our immersive Summer Camp. 
                        </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        {/* VIP TICKET VISUAL */}
                        <div className="vip-ticket" style={{
                            display: 'flex',
                            flexDirection: 'row',
                            maxWidth: '1000px',
                            width: '100%',
                            background: 'linear-gradient(135deg, #111 0%, #000 100%)',
                            borderRadius: '24px',
                            border: '1px solid rgba(255, 215, 0, 0.4)',
                            boxShadow: '0 30px 60px rgba(0,0,0,0.8), 0 0 40px rgba(255, 215, 0, 0.15)',
                            overflow: 'hidden',
                            position: 'relative'
                        }}>
                            {/* Left Stub / Barcode Area */}
                            <div className="vip-ticket__stub" style={{
                                width: '25%',
                                minWidth: '220px',
                                borderRight: '2px dashed rgba(255, 215, 0, 0.4)',
                                padding: '3rem 1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'linear-gradient(to bottom, rgba(255, 215, 0, 0.08), transparent)',
                                position: 'relative'
                            }}>
                                {/* Ticket Cutout notches matching the dashed border */}
                                <div className="ticket-notch-top" style={{ position: 'absolute', top: '-20px', right: '-20px', width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-bg)', borderBottom: '1px solid rgba(255,215,0,0.4)', zIndex: 5 }}></div>
                                <div className="ticket-notch-bottom" style={{ position: 'absolute', bottom: '-20px', right: '-20px', width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-bg)', borderTop: '1px solid rgba(255,215,0,0.4)', zIndex: 5 }}></div>
                                
                                <div className="stub-vertical-text" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: '3rem', fontWeight: '900', color: 'rgba(255,255,255,0.03)', letterSpacing: '8px', position: 'absolute', left: '15px' }}>
                                    ADMIT ONE
                                </div>
                                
                                <FaShieldAlt style={{ fontSize: '4.5rem', color: 'var(--color-gold)', marginBottom: '1.5rem', filter: 'drop-shadow(0 0 15px rgba(255,215,0,0.4))' }} />
                                <h3 style={{ fontSize: '1.3rem', textTransform: 'uppercase', letterSpacing: '3px', color: '#ddd', textAlign: 'center', margin: 0 }}>Month 1</h3>
                                <div style={{ color: 'var(--color-gold)', fontWeight: '900', fontSize: '1.8rem', marginTop: '0.8rem', textAlign: 'center', textShadow: '0 0 10px rgba(255,215,0,0.3)' }}>FREE PASS</div>
                            </div>
                            
                            {/* Right Main Area */}
                            <div className="vip-ticket__main" style={{
                                padding: '3.5rem 3rem',
                                flex: 1,
                                position: 'relative'
                            }}>
                                {/* Watermark */}
                                <div style={{ position: 'absolute', right: '30px', bottom: '10px', fontSize: '12rem', opacity: 0.02, fontWeight: '900', color: 'var(--color-gold)', pointerEvents: 'none', lineHeight: 1 }}>
                                    VIP
                                </div>

                                <div className="vip-ticket__header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
                                    <div style={{ flex: '1 1 300px' }}>
                                        <div style={{ display: 'inline-block', background: 'var(--color-gold)', color: '#000', padding: '0.4rem 1rem', borderRadius: '6px', fontSize: '0.95rem', fontWeight: '900', marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '1.5px', boxShadow: '0 4px 15px rgba(255,215,0,0.3)' }}>
                                            Strictly Limited to 20 Slots
                                        </div>
                                        <h3 className="vip-title" style={{ fontSize: '2.8rem', margin: '0 0 0.8rem 0', lineHeight: 1.1 }}>Ultimate Self Defense <br/><span className="text-gold">Experience</span></h3>
                                        <p style={{ color: '#aaa', fontSize: '1.15rem', margin: 0 }}>Focus, Discipline, &amp; Real-World Skills.</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.1rem', color: '#777', textDecoration: 'line-through', marginBottom: '0.5rem' }}>Regular Value: ₹1,500</div>
                                        <div className="vip-price" style={{ fontSize: '4.5rem', fontWeight: '900', color: 'var(--color-gold)', lineHeight: 0.9, textShadow: '0 0 20px rgba(255,215,0,0.2)' }}>₹0</div>
                                    </div>
                                </div>

                                <div className="setup-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) minmax(200px, 1fr)', gap: '1.2rem', marginBottom: '3rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem', color: '#ddd' }}>
                                        <div style={{ width: '8px', height: '8px', background: 'var(--color-gold)', borderRadius: '50%', boxShadow: '0 0 8px var(--color-gold)' }}></div>
                                        Action-packed modules
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem', color: '#ddd' }}>
                                        <div style={{ width: '8px', height: '8px', background: 'var(--color-gold)', borderRadius: '50%', boxShadow: '0 0 8px var(--color-gold)' }}></div>
                                        Screen-free environment
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem', color: '#ddd' }}>
                                        <div style={{ width: '8px', height: '8px', background: 'var(--color-gold)', borderRadius: '50%', boxShadow: '0 0 8px var(--color-gold)' }}></div>
                                        Reflex &amp; evasion games
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem', color: '#ddd' }}>
                                        <div style={{ width: '8px', height: '8px', background: 'var(--color-gold)', borderRadius: '50%', boxShadow: '0 0 8px var(--color-gold)' }}></div>
                                        Zero commitment required
                                    </div>
                                </div>

                                <Link href="/summer-camp/enroll" className="btn vip-btn" style={{ 
                                    background: 'linear-gradient(90deg, #FFDF00 0%, #D4AF37 100%)', 
                                    color: '#000', 
                                    fontWeight: '900', 
                                    fontSize: '1.2rem', 
                                    padding: '1.2rem 2.8rem', 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    gap: '12px',
                                    border: 'none',
                                    borderRadius: '50px',
                                    boxShadow: '0 10px 25px rgba(255, 215, 0, 0.4)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    transition: 'all 0.3s ease'
                                }}>
                                    Redeem VIP Pass <FaArrowRight />
                                </Link>
                            </div>
                        </div>
                    </div>
                    
                    {/* Add a subtle CSS block for mobile responsiveness of the ticket */}
                    <style dangerouslySetInnerHTML={{__html: `
                        @media (max-width: 768px) {
                            .vip-ticket { flex-direction: column !important; }
                            .vip-ticket__stub {
                                width: 100% !important; border-right: none !important;
                                border-bottom: 2px dashed rgba(255, 215, 0, 0.4) !important; padding: 2.5rem !important;
                            }
                            .ticket-notch-top { left: -20px !important; top: auto !important; bottom: -20px !important; border-bottom: none !important; border-right: 1px solid rgba(255,215,0,0.4) !important; }
                            .ticket-notch-bottom { right: -20px !important; bottom: -20px !important; top: auto !important; border-top: none !important; border-left: 1px solid rgba(255,215,0,0.4) !important; }
                            .stub-vertical-text { display: none !important; }
                            .setup-grid { grid-template-columns: 1fr !important; gap: 0.8rem !important; }
                            .vip-ticket__main { padding: 2rem 1.25rem !important; }
                            .vip-ticket__header-row { text-align: center; gap: 1rem !important; }
                            .vip-ticket__header-row > div { flex: 1 1 100% !important; text-align: center !important; }
                            .vip-title { font-size: 2.2rem !important; }
                            .vip-price { font-size: 3.5rem !important; }
                            .vip-btn { width: 100% !important; justify-content: center !important; }
                        }
                    `}} />
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
