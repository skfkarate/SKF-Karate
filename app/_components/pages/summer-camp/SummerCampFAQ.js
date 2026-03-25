'use client'

import { useState } from 'react'
import { FaChevronDown } from 'react-icons/fa'

const faqs = [
    {
        q: "What age group is this camp for?",
        a: <>The summer camp is open to children and teens aged <strong>5 to 18 years</strong>. No prior karate experience is required for <strong>Month 1 (Self Defence)</strong>. Month 2 (Nunchaku) is also <strong>beginner-friendly</strong>.</>
    },
    {
        q: "Does my child need prior martial arts experience?",
        a: <>Not at all. Both months are designed to welcome <strong>complete beginners</strong>. Our Senseis will guide each athlete from the basics, adjusting the intensity to <strong>each child's level</strong>.</>
    },
    {
        q: "What should my child wear to training?",
        a: <>For the summer camp, athletes should wear a <strong>comfortable, stretchable dress</strong> like track pants and a T-shirt. <strong>No karate uniform</strong> is required.</>
    },
    {
        q: "Do I have to commit to the whole summer?",
        a: <>Not at all! You can enroll just for <strong>Month 1 (Self Defense)</strong>. Best of all, if you are among our <strong>first 20 enrollments</strong>, Month 1 is <strong className="text-gold">100% FREE</strong>! If your child loves it, you can optionally secure their spot for Month 2 later.</>
    },
    {
        q: "Is the training safe for young children?",
        a: <>Absolutely. <strong>Safety is our highest priority</strong>. All sessions are supervised by experienced Senseis, with age-appropriate drills. Nunchaku training uses <strong>foam-padded training weapons</strong> for beginners.</>
    },
    {
        q: "What are the training days and timings?",
        a: <>Camp sessions are held on <strong>Tuesdays, Wednesdays, and Fridays</strong>. Contact us via WhatsApp for the exact timings and full schedule.</>
    },
    {
        q: "How do I enroll my child?",
        a: <>You can reach us directly via <strong>WhatsApp</strong> or through our <strong>contact page</strong>. Slots are limited and filled on a <strong>first-come, first-served</strong> basis.</>
    },
]

export default function SummerCampFAQ() {
    const [openIndex, setOpenIndex] = useState(null)

    const toggle = (i) => {
        setOpenIndex(openIndex === i ? null : i)
    }

    return (
        <div className="faq__list">
            {faqs.map((faq, i) => (
                <div
                    key={i}
                    className={`glass-card faq__item ${openIndex === i ? 'faq__item--open' : ''}`}
                    onClick={() => toggle(i)}
                >
                    <div className="faq__question">
                        <div className="faq__q-content">
                            <span className="faq__number">{String(i + 1).padStart(2, '0')}</span>
                            <span>{faq.q}</span>
                        </div>
                        <FaChevronDown className="faq__chevron" />
                    </div>
                    <div className="faq__answer">
                        <div className="faq__answer-inner">
                            <p>{faq.a}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
