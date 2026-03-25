import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';

export default function HomePathsOfMastery() {
    return (
        <section className="section paths">
            <div className="container">
                <div className="paths__grid">
                    <Link href="/grading" className="path-card group">
                        <div className="path-card__bg" style={{ backgroundImage: "url('/gallery/beltexam.jpg')" }}></div>
                        <div className="path-card__overlay"></div>
                        <div className="path-card__content">
                            <h3>The Kyu Journey</h3>
                            <p>Build your unshakable foundation and discipline.</p>
                            <span className="path-card__arrow"><FaArrowRight /></span>
                        </div>
                    </Link>

                    <Link href="/grading" className="path-card group">
                        <div className="path-card__bg" style={{ backgroundImage: "url('/gallery/belt.jpg')" }}></div>
                        <div className="path-card__overlay"></div>
                        <div className="path-card__content">
                            <h3>The Dan Sanctuary</h3>
                            <p>Advance into true artistry and complete mastery.</p>
                            <span className="path-card__arrow"><FaArrowRight /></span>
                        </div>
                    </Link>

                    <Link href="/summer-camp" className="path-card group">
                        <div className="path-card__bg" style={{ backgroundImage: "url('/gallery/Train the Elite - Training Camp starred.jpeg')" }}></div>
                        <div className="path-card__overlay"></div>
                        <div className="path-card__content">
                            <h3>Train the Elite</h3>
                            <p>Join the intense competitive Kumite and Kata camps.</p>
                            <span className="path-card__arrow"><FaArrowRight /></span>
                        </div>
                    </Link>
                </div>
            </div>
        </section>
    );
}
