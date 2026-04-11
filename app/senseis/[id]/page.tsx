import Link from 'next/link'
import { FaArrowLeft, FaTrophy, FaCalendarAlt, FaCamera, FaMedal, FaEnvelope } from 'react-icons/fa'
import { GiBlackBelt, GiKatana } from 'react-icons/gi'
import './sensei-profile.css'

// Placeholder data dictionary. In production this would come from a database or CMS.
const mastersData = {
    'akira': {
        name: 'Sensei Akira',
        dan: '5th Dan — Godan',
        role: 'Chief Instructor & Founder',
        spec: 'Kata & Kumite Mastery',
        dojos: 'SKF Headquarters',
        exp: '20+ years',
        bio: `Sensei Akira is the founding pillar of SKF Karate. With over two decades of relentless dedication to the art, he has cultivated champions at the state and national levels. His philosophy marries traditional discipline with highly modern sports science. Under his guidance, students internalize that true mastery is not merely found in defeating an opponent, but in the perfection of the self through tireless, unyielding discipline.`,
        achievements: ['National Kumite Champion (3x)', 'State Kata Champion (5x)', 'WKF-certified Elite Coach', 'Founding Member of SKF Karate'],
        color: 'gold',
        icon: <GiKatana />
    },
    'ravi': {
        name: 'Sensei Ravi',
        dan: '4th Dan — Yondan',
        role: 'Senior Instructor',
        spec: 'Advanced Kumite',
        dojos: 'Central Dojo',
        exp: '15+ years',
        bio: `Known for his explosive kumite tactics and deep tactical understanding of point-scoring, Sensei Ravi has served as a National Team Coach and has developed some of the most competitive athletes in the state. He brings an intense, high-energy environment to his sessions, pushing students beyond their perceived limits.`,
        achievements: ['State Kumite Champion (5x)', 'National Team Coach', 'Elite Tactic Specialist', 'Head of Central Dojo Operations'],
        color: 'crimson',
        icon: <GiBlackBelt />
    },
    'meera': {
        name: 'Sensei Meera',
        dan: '3rd Dan — Sandan',
        role: 'Instructor',
        spec: 'Technical Kata',
        dojos: 'East District Dojo',
        exp: '12+ years',
        bio: `Sensei Meera approaches Karate-Do as a true art form. Her exactness in Form (Kata) training is unmatched. As a Certified Kata Judge, she understands exactly what adjudicators look for, and passes that meticulous eye for detail to her students. Every block, every punch, every stance is taught with mathematical precision.`,
        achievements: ['State Kata Champion (2x)', 'Certified National Kata Judge', 'Form Correction Expert', 'Women\'s Self Defence Lead'],
        color: 'blue',
        icon: <GiBlackBelt />
    },
    'arjun': {
        name: 'Sensei Arjun',
        dan: '3rd Dan — Sandan',
        role: 'Instructor',
        spec: 'Kumite & Self-Defence',
        dojos: 'North District Dojo',
        exp: '10+ years',
        bio: `Sensei Arjun bridges the gap between tournament kumite and practical street self-defence. He firmly believes that preparedness brings peace, instructing students on threat assessment, situational awareness, and effective neutralizing techniques.`,
        achievements: ['National Kumite Bronze', 'Self-Defence Program Director', 'Street-Ready Tactical Lead', 'Youth Mentor'],
        color: 'gold',
        icon: <GiBlackBelt />
    },
    'priya': {
        name: 'Sensei Priya',
        dan: '2nd Dan — Nidan',
        role: 'Assistant Instructor',
        spec: 'Junior Training',
        dojos: 'SKF Headquarters',
        exp: '8+ years',
        bio: `Specializing in the development of our youngest karatekas, Sensei Priya brings a blend of deep patience and firm discipline. She understands child psychology within sports, transforming short-attention spans into focused, disciplined, and highly respectful young athletes.`,
        achievements: ['Junior Development Lead', 'State Medalist', 'Specialist in Child Psychology inside the Dojo'],
        color: 'crimson',
        icon: <GiBlackBelt />
    },
    'karthik': {
        name: 'Sensei Karthik',
        dan: '2nd Dan — Nidan',
        role: 'Assistant Instructor',
        spec: 'Fitness Conditioning',
        dojos: 'South District Dojo',
        exp: '7+ years',
        bio: `A master of athletic conditioning, Sensei Karthik ensures that SKF students are the fittest on any tournament floor. His rigorous training focuses on core strengthening, explosive agility, and reflex mastery, guaranteeing athletes have the cardiovascular engine to perform at their peak.`,
        achievements: ['Conditioning Specialist', 'Core Strengthening Lead', 'Agility & Reflex Mastery Coach'],
        color: 'blue',
        icon: <GiBlackBelt />
    }
};

export default async function SenseiProfilePage({ params }) {
    // Next 15 requires awaiting params
    const { id } = await params;
    const master = mastersData[id] || mastersData['akira']; // Fallback

    const bgMap = {
        'gold': 'linear-gradient(135deg, rgba(255,183,3,0.1), transparent)',
        'crimson': 'linear-gradient(135deg, rgba(214,40,40,0.1), transparent)',
        'blue': 'linear-gradient(135deg, rgba(63,81,181,0.1), transparent)',
    };

    return (
        <div className="sensei-profile-page">
            {/* ═══════ PROFILE HERO ═══════ */}
            <section className="page-hero profile-hero" style={{ background: bgMap[master.color] }}>
                <div className="container">
                    <Link href="/senseis" className="back-link">
                        <FaArrowLeft /> Back to Council of Masters
                    </Link>
                    
                    <div className="profile-hero__grid">
                        {/* Profile Image Area (Placeholder) */}
                        <div className="profile-hero__image-wrapper">
                            <div className={`profile-hero__image-placeholder ring-${master.color}`}>
                                {/* When you have real photos, replace this div with:
                                  <Image src={`/senseis/${master.id}.jpg`} alt={master.name} fill objectFit="cover" /> 
                                */}
                                <div className="photo-placeholder-icon">
                                    <FaCamera />
                                    <span>Portrait Photo</span>
                                </div>
                            </div>
                        </div>

                        {/* Profile Details Area */}
                        <div className="profile-hero__content">
                            <span className="profile-hero__dan">{master.dan}</span>
                            <h1 className="profile-hero__name">{master.name}</h1>
                            <span className="profile-hero__role">{master.role}</span>
                            
                            <div className="profile-hero__quick-stats">
                                <div className="quick-stat">
                                    <GiKatana className="stat-icon" />
                                    <div>
                                        <strong>Specialty</strong>
                                        <span>{master.spec}</span>
                                    </div>
                                </div>
                                <div className="quick-stat">
                                    <FaCalendarAlt className="stat-icon" />
                                    <div>
                                        <strong>Experience</strong>
                                        <span>{master.exp}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="profile-hero__bio glass-card">
                                <p>{master.bio}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ ACHIEVEMENTS TIMELINE ═══════ */}
            <section className="section achievements-section section--tint-mid">
                <div className="container">
                    <div className="section-header center">
                        <span className="section-label"><FaTrophy /> Honors</span>
                        <h2 className="section-title">Career <span className="text-gradient">Achievements</span></h2>
                    </div>

                    <div className="achievements-grid">
                        {master.achievements.map((ach, idx) => (
                            <div className="glass-card achievement-card" key={idx}>
                                <div className={`achievement-icon icon-glow-${master.color}`}>
                                    <FaMedal />
                                </div>
                                <h3>{ach}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════ ACTION GALLERY (PLACEHOLDER) ═══════ */}
            <section className="section gallery-section">
                <div className="container">
                    <div className="section-header">
                        <span className="section-label"><FaCamera /> Media</span>
                        <h2 className="section-title">Master in <span className="text-gradient">Action</span></h2>
                    </div>

                    <div className="action-gallery-grid">
                        {[1, 2, 3].map((num) => (
                            <div className="gallery-placeholder glass-card" key={num}>
                                <FaCamera className="placeholder-cam" />
                                <span>Action Shot {num}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════ BOTTOM CTA ═══════ */}
            <section className="section profile-cta section--tint-cool">
                <div className="container">
                    <div className="glass-card profile-cta__inner">
                        <h2 className="section-title">Train with {master.name.split(' ')[1]}</h2>
                        <p className="section-subtitle">
                            Ready to learn {master.spec.toLowerCase()} under the direct guidance of {master.name}? Reach out to inquire about class schedules at {master.dojos}.
                        </p>
                        <div className="profile-cta__actions">
                            <Link href="/contact" className="btn btn-primary">
                                <FaEnvelope /> Inquire About Classes
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
