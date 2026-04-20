import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';
import { homePathsOfMasteryData } from '@/data/constants/homeContent'

export default function HomePathsOfMastery() {
    return (
        <section className="section paths">
            <div className="container">
                <div className="paths__grid">
                    {homePathsOfMasteryData.map((path) => (
                        <Link key={path.id} href={path.link} className="path-card group">
                            <div className="path-card__bg" style={{ backgroundImage: `url('${path.bgImage}')` }}></div>
                            <div className="path-card__overlay"></div>
                            <div className="path-card__content">
                                <h3>{path.title}</h3>
                                <p>{path.desc}</p>
                                <span className="path-card__arrow"><FaArrowRight /></span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
