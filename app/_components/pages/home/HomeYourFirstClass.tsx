'use client'

import Link from 'next/link'
import { FaArrowRight, FaCalendarCheck, FaChild, FaTshirt, FaSmile } from 'react-icons/fa'
import { homeYourFirstClassData } from '@/data/constants/homeContent'

const renderIcon = (type: string) => {
    switch(type) {
        case 'calendar': return <FaCalendarCheck />;
        case 'tshirt': return <FaTshirt />;
        case 'child': return <FaChild />;
        case 'smile': return <FaSmile />;
        default: return <FaSmile />;
    }
}

export default function HomeYourFirstClass() {
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
                    {homeYourFirstClassData.map((step, i) => (
                        <div key={i} className="first-class-step">
                            <div className="first-class-step__number">{step.number}</div>
                            <div className="first-class-step__icon">{renderIcon(step.iconType)}</div>
                            <h3 className="first-class-step__title">{step.title}</h3>
                            <p className="first-class-step__desc">{step.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="home-first-class__cta">
                    <Link href="/book-trial" className="btn btn-primary">
                        Book Free Trial <FaArrowRight />
                    </Link>
                </div>
            </div>
        </section>
    )
}
