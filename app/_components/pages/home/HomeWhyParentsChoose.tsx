import { FaShieldAlt, FaUserGraduate, FaTrophy, FaUsers, FaAward } from 'react-icons/fa'
import { homeWhyParentsChooseData } from '@/data/constants/homeContent'
import ScrollReveal from '@/app/_components/ScrollReveal'

const renderIcon = (type: string) => {
    switch(type) {
        case 'shield': return <FaShieldAlt />;
        case 'graduate': return <FaUserGraduate />;
        case 'trophy': return <FaTrophy />;
        case 'users': return <FaUsers />;
        case 'award': return <FaAward />;
        default: return <FaAward />;
    }
}

export default function HomeWhyParentsChoose() {
    return (
        <section className="home-why-parents section section--tint-warm">
            <div className="container">
                <ScrollReveal>
                    <div className="home-why-parents__header">
                        <span className="section-label"><FaShieldAlt /> Why SKF</span>
                        <h2 className="section-title">
                            Why Parents Choose <span className="text-gradient">SKF Karate</span>
                        </h2>
                    </div>
                </ScrollReveal>

                <div className="home-why-parents__grid">
                    {homeWhyParentsChooseData.map((reason, i) => (
                        <ScrollReveal key={i} delay={i * 0.1}>
                            <div className="why-card">
                                <div className="why-card__icon">{renderIcon(reason.iconType)}</div>
                                <h3 className="why-card__title">{reason.title}</h3>
                                <p className="why-card__desc">{reason.desc}</p>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    )
}
