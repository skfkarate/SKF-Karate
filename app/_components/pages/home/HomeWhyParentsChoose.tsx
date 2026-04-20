import { FaShieldAlt, FaUserGraduate, FaTrophy, FaUsers, FaAward } from 'react-icons/fa'
import { homeWhyParentsChooseData } from '@/data/constants/homeContent'

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
                <div className="home-why-parents__header">
                    <span className="section-label"><FaShieldAlt /> Why SKF</span>
                    <h2 className="section-title">
                        Why Parents Choose <span className="text-gradient">SKF Karate</span>
                    </h2>
                </div>

                <div className="home-why-parents__grid">
                    {homeWhyParentsChooseData.map((reason, i) => (
                        <div key={i} className="why-card">
                            <div className="why-card__icon">{renderIcon(reason.iconType)}</div>
                            <h3 className="why-card__title">{reason.title}</h3>
                            <p className="why-card__desc">{reason.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
