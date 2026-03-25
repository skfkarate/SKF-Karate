import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';
import './HomeSenseisTeaser.css';

export default function HomeSenseisTeaser() {
    return (
        <section className="section teaser">
            <div className="glow glow-red" style={{ top: "10%", right: "-10%", opacity: 0.2 }}></div>
            <div className="container teaser__container">
                <div className="teaser__text">
                    <span className="section-label">Learn From The Best</span>
                    <h2 className="section-title" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>Lineage of <br/><span className="text-gradient">Masters</span></h2>
                    <p style={{ color: "var(--text-light)", marginBottom: "2.5rem", fontSize: "1.1rem", lineHeight: "1.8" }}>
                        Our Dojo is led by internationally recognized Grandmasters who have dedicated their lives to the perfection of Karate-do. 
                        Train under World Champions and true martial arts scholars.
                    </p>
                    <span className="btn btn-primary" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                        Meet the Masters (Soon)
                    </span>
                </div>
                
                <div className="teaser__avatars">
                    <div className="teaser__avatar-wrap">
                        <div className="teaser__avatar" style={{ backgroundImage: "url('/gallery/In Dojo.jpeg')" }}></div>
                    </div>
                    <div className="teaser__avatar-wrap">
                        <div className="teaser__avatar" style={{ backgroundImage: "url('/gallery/Karate Demonstration2 starred.jpeg')" }}></div>
                    </div>
                    <div className="teaser__avatar-wrap">
                        <div className="teaser__avatar" style={{ backgroundImage: "url('/gallery/Tournment9.jpeg')" }}></div>
                    </div>
                    
                    {/* Floating decoration circle */}
                    <div className="teaser__deco-ring"></div>
                </div>
            </div>
        </section>
    );
}
