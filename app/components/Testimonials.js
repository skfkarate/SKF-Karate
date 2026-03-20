'use client'

import { useState, useEffect } from 'react'
import { FaQuoteLeft, FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa'

const testimonials = [
  {
    id: 1,
    name: 'Sarah M.',
    role: 'Parent of 2 Athletes',
    text: 'SKF Karate has completely transformed my children. Not only have they learned self-defense, but their focus in school and respect at home has improved dramatically. The Senseis are truly mentors.',
    rating: 5
  },
  {
    id: 2,
    name: 'Rahul V.',
    role: 'Adult Athlete (Brown Belt)',
    text: 'I started training at 30, thinking I was too old. The adult classes are challenging but supportive. SKF is more than a dojo; it is a community that pushes you to be your absolute best.',
    rating: 5
  },
  {
    id: 3,
    name: 'Priya K.',
    role: 'State Champion (Black Belt)',
    text: 'The elite tournament training here is unmatched. The combination of traditional kata precision with modern sports science conditioning helped me secure gold at the state championships.',
    rating: 5
  }
]

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)

  return (
    <section className="section testimonials" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="glow glow-blue" style={{ width: '500px', height: '500px', top: '10%', right: '-10%', opacity: 0.4 }}></div>
      <div className="glow glow-red" style={{ width: '300px', height: '300px', bottom: '10%', left: '-5%', opacity: 0.3 }}></div>
      
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span className="section-label"><FaStar /> Athlete Stories</span>
          <h2 className="section-title">Hear From Our <span className="text-gradient">Family</span></h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            Real experiences from parents and athletes whose lives have been impacted by SKF Karate.
          </p>
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
          {/* Slider Container */}
          <div style={{ position: 'relative', minHeight: '300px' }}>
            {testimonials.map((test, index) => (
              <div 
                key={test.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  opacity: index === currentIndex ? 1 : 0,
                  transform: `translateX(${(index - currentIndex) * 20}px)`,
                  transition: 'opacity 0.6s ease, transform 0.6s ease',
                  pointerEvents: index === currentIndex ? 'auto' : 'none',
                }}
              >
                <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center', borderRadius: '24px' }}>
                  <FaQuoteLeft style={{ fontSize: '2.5rem', color: 'var(--crimson)', opacity: 0.5, marginBottom: '1.5rem' }} />
                  <p style={{ fontSize: 'clamp(1.1rem, 2vw, 1.3rem)', fontStyle: 'italic', color: 'var(--text-white)', lineHeight: 1.8, marginBottom: '2rem' }}>
                    "{test.text}"
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', color: 'var(--gold)', marginBottom: '1rem' }}>
                    {[...Array(test.rating)].map((_, i) => <FaStar key={i} />)}
                  </div>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', margin: 0 }}>{test.name}</h4>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{test.role}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', marginTop: '2rem' }}>
            <button 
              onClick={prevSlide}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-active)', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'var(--transition)' }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.color = 'var(--navy-deep)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'white'; }}
            >
              <FaChevronLeft />
            </button>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  style={{
                    width: index === currentIndex ? '30px' : '10px',
                    height: '10px',
                    borderRadius: '10px',
                    background: index === currentIndex ? 'var(--gold)' : 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            <button 
              onClick={nextSlide}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-active)', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'var(--transition)' }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.color = 'var(--navy-deep)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'white'; }}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
