import { FaQuoteLeft, FaStar } from 'react-icons/fa'

const testimonials = [
  { name: 'Anjali M.', role: 'Parent of 8yo', text: 'My son used to be very shy, but his confidence has completely changed. He even wakes up early by himself for practice!' },
  { name: 'Rahul S.', role: 'Parent of 10yo', text: 'The discipline they teach here is excellent. Along with karate, they are teaching real respect for elders and teachers.' },
  { name: 'Priya K.', role: 'Parent of 6yo', text: 'I was worried about screen time during holidays. This camp was the perfect mix of serious training and fun.' },
  { name: 'Vikram R.', role: 'Parent of 12yo', text: 'Best summer investment. He stopped playing video games all day and actually looks forward to the fitness routines.' },
  { name: 'Neha D.', role: 'Parent of 9yo', text: 'The self-defense techniques are so practical. As a mother, it gives me great peace of mind knowing she can protect herself.' },
  { name: 'Suresh P.', role: 'Parent of 7yo', text: 'Very professional and safe environment. The Senseis are strict on the mat but very encouraging with the kids.' },
  { name: 'Kavita N.', role: 'Parent of 11yo', text: 'We noticed an improvement in his focus, even in his studies! Karate has really taught him how to concentrate.' },
  { name: 'Arvind V.', role: 'Parent of 8yo', text: 'Fantastic energy. It\'s not just hitting and kicking; they focus heavily on warmups, stretching, and proper technique.' },
  { name: 'Meera C.', role: 'Parent of 14yo', text: 'Even my teenager, who argues about everything, absolutely loved the Nunchaku training. Highly recommended.' },
  { name: 'Amit B.', role: 'Parent of 6yo & 9yo', text: 'Both my kids come home totally exhausted and happy. It\'s the best way to utilize their summer break productively.' },
]

function TestimonialsTrack({ duplicate = false }) {
  return (
    <div className="testimonials__track" aria-hidden={duplicate ? 'true' : undefined}>
      {testimonials.map((testimonial, index) => (
        <div
          key={duplicate ? `dup-${index}` : index}
          className="glass-card testimonial-card"
        >
          <FaQuoteLeft className="testimonial-card__quote" />
          <p>&quot;{testimonial.text}&quot;</p>
          <div className="testimonial-card__author">
            <div className="testimonial-card__avatar">{testimonial.name.charAt(0)}</div>
            <div>
              <strong>{testimonial.name}</strong>
              <span>{testimonial.role}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function SummerCampTestimonials() {
  return (
    <section className="section testimonials">
      <div className="container">
        <div className="testimonials__header">
          <span className="section-label">
            <FaStar /> Testimonials
          </span>
          <h2 className="section-title">
            What Our <span className="text-gradient">Athletes Say</span>
          </h2>
        </div>

        <div className="featured-quote glass-card">
          <FaQuoteLeft className="featured-quote__icon" />
          <h3 className="featured-quote__text">
            &quot;I was worried it would be too violent, but it&apos;s actually all about{' '}
            <strong className="text-gold">discipline, respect, and fitness</strong>. My
            8-year-old absolutely loves it and even wakes up early to practice!&quot;
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
          <TestimonialsTrack />
          <TestimonialsTrack duplicate />
        </div>
      </div>
    </section>
  )
}
