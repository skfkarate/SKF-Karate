import { FaShieldAlt, FaUserGraduate, FaTrophy, FaUsers, FaAward } from 'react-icons/fa'

const reasons = [
    {
        icon: <FaShieldAlt />,
        title: 'WKF Certified',
        desc: 'World Karate Federation-affiliated. Every belt, every grade is internationally recognized.',
    },
    {
        icon: <FaUserGraduate />,
        title: 'Black Belt Instructors',
        desc: 'All classes led by certified Dan-graded black belt instructors with competition experience.',
    },
    {
        icon: <FaTrophy />,
        title: 'Competition Ready',
        desc: 'From local tournaments to international championships — we prepare champions at every level.',
    },
    {
        icon: <FaUsers />,
        title: 'Small Class Sizes',
        desc: 'Personal attention guaranteed. Every student gets the coaching they deserve.',
    },
    {
        icon: <FaAward />,
        title: 'Character First',
        desc: 'Discipline, respect, confidence — values that go far beyond the dojo.',
    },
]

export default function HomeWhyParentsChoose() {
    return (
        <section className="home-why-parents section section--tint-warm">
            <div className="container">
                <div className="home-why-parents__header">
                    <span className="section-label"><FaShieldAlt /> Why SKF</span>
                    <h2 className="section-title">
                        Why Parents Choose <span className="text-gradient">SKF Karate</span>
                    </h2>
                </div>

                <div className="home-why-parents__grid">
                    {reasons.map((reason, i) => (
                        <div key={i} className="why-card">
                            <div className="why-card__icon">{reason.icon}</div>
                            <h3 className="why-card__title">{reason.title}</h3>
                            <p className="why-card__desc">{reason.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
