'use client'

import { FaArrowRight, FaCalendarCheck, FaChild, FaTshirt, FaSmile } from 'react-icons/fa'
import { useTrialModal } from '@/app/_components/TrialModalContext'

const steps = [
    {
        icon: <FaCalendarCheck />,
        number: '01',
        title: 'Book Your Trial',
        desc: 'Fill out a quick form or WhatsApp us. We\'ll confirm your slot within 24 hours.',
    },
    {
        icon: <FaTshirt />,
        number: '02',
        title: 'Show Up',
        desc: 'Wear comfortable clothes. No special gear needed for your first class.',
    },
    {
        icon: <FaChild />,
        number: '03',
        title: 'Train with Champions',
        desc: 'A 60-minute guided session with a certified black belt instructor.',
    },
    {
        icon: <FaSmile />,
        number: '04',
        title: 'Join the Family',
        desc: 'Loved it? Pick a plan that fits. No long-term contracts required.',
    },
]

export default function HomeYourFirstClass() {
    const { openModal } = useTrialModal()

    return (
        <section className="home-first-class section section--tint-cool">
            <div className="container">
                <div className="home-first-class__header">
                    <span className="section-label"><FaCalendarCheck /> Getting Started</span>
                    <h2 className="section-title">
                        Your First <span className="text-gradient">Class</span>
                    </h2>
                    <p className="section-subtitle">
                        It takes 4 simple steps to start your karate journey.
                    </p>
                </div>

                <div className="home-first-class__steps">
                    {steps.map((step, i) => (
                        <div key={i} className="first-class-step">
                            <div className="first-class-step__number">{step.number}</div>
                            <div className="first-class-step__icon">{step.icon}</div>
                            <h3 className="first-class-step__title">{step.title}</h3>
                            <p className="first-class-step__desc">{step.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="home-first-class__cta">
                    <button className="btn btn-primary" onClick={() => openModal()}>
                        Book Free Trial <FaArrowRight />
                    </button>
                </div>
            </div>
        </section>
    )
}
