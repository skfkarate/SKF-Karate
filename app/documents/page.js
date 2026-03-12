import { FaFileAlt, FaDownload, FaBook, FaClipboardList, FaShieldAlt } from 'react-icons/fa'
import './documents.css'



const docCategories = [
    {
        title: 'Competition Rules',
        icon: <FaClipboardList />,
        docs: [
            { name: 'WKF Kata Rules & Regulations', size: 'PDF — 2.1 MB' },
            { name: 'WKF Kumite Rules & Regulations', size: 'PDF — 1.8 MB' },
            { name: 'SKF Inter-Dojo Tournament Rules', size: 'PDF — 950 KB' },
            { name: 'Referee Hand Signals Guide', size: 'PDF — 1.2 MB' },
        ],
    },
    {
        title: 'Grading & Examination',
        icon: <FaBook />,
        docs: [
            { name: 'Kyu Grading Requirements (White to Brown)', size: 'PDF — 1.5 MB' },
            { name: 'Dan Grading Requirements (Shodan to Godan)', size: 'PDF — 1.1 MB' },
            { name: 'Grading Application Form', size: 'PDF — 320 KB' },
            { name: 'Kata Syllabus — Complete List', size: 'PDF — 800 KB' },
        ],
    },
    {
        title: 'Membership & Forms',
        icon: <FaFileAlt />,
        docs: [
            { name: 'New Member Registration Form', size: 'PDF — 280 KB' },
            { name: 'Student Transfer Form', size: 'PDF — 220 KB' },
            { name: 'Competition Entry Form', size: 'PDF — 350 KB' },
            { name: 'Summer Camp Registration Form', size: 'PDF — 400 KB' },
        ],
    },
    {
        title: 'Code of Conduct',
        icon: <FaShieldAlt />,
        docs: [
            { name: 'Dojo Kun — Student Code of Conduct', size: 'PDF — 180 KB' },
            { name: 'Sensei & Official Code of Ethics', size: 'PDF — 250 KB' },
            { name: 'Anti-Doping Policy', size: 'PDF — 300 KB' },
            { name: 'Safeguarding & Child Protection Policy', size: 'PDF — 450 KB' },
        ],
    },
]

export default function DocumentsPage() {
    return (
        <div className="documents-page">
            <section className="page-hero">
                <div className="page-hero__bg">
                    <div className="glow glow-blue page-hero__glow-1"></div>
                    <div className="glow glow-gold page-hero__glow-2"></div>
                </div>
                <div className="container page-hero__content">
                    <span className="section-label"><FaFileAlt /> Documents</span>
                    <h1 className="page-hero__title">Rules & <span className="text-gradient">Documents</span></h1>
                    <p className="page-hero__subtitle">Forms, Rules & Official Documents</p>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <div className="docs__grid">
                        {docCategories.map((cat, i) => (
                            <div className="glass-card docs-category" key={i}>
                                <div className="docs-category__header">
                                    <div className="docs-category__icon">{cat.icon}</div>
                                    <h3>{cat.title}</h3>
                                </div>
                                <div className="docs-category__list">
                                    {cat.docs.map((d, j) => (
                                        <div className="doc-item" key={j}>
                                            <div className="doc-item__info">
                                                <p className="doc-item__name">{d.name}</p>
                                                <span className="doc-item__size">{d.size}</span>
                                            </div>
                                            <button className="doc-item__download" aria-label="Download">
                                                <FaDownload />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="docs__note">
                        Download links will be active once the actual documents are uploaded. Contact SKF Karate for any document requests.
                    </p>
                </div>
            </section>
        </div>
    )
}
