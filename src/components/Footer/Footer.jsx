import { useNavigate } from 'react-router-dom';
import './Footer.css';

const columns = [
    {
        title: 'Product',
        links: [
            { label: 'Resume Builder', path: '/builder' },
            { label: 'LaTeX Editor', path: '/latex-editor' },
            { label: 'CV Upload & Auto-fill', path: '/builder' },
            { label: 'Cover Letter Generator', path: '/cover-letter' },
        ],
    },
    {
        title: 'Features',
        links: [
            { label: 'ATS Score Checker' },
            { label: 'AI Summary Generator' },
            { label: 'JD Keyword Match' },
            { label: 'PDF Export' },
        ],
    },
    {
        title: 'Templates',
        links: [
            { label: 'Classic' },
            { label: 'Modern' },
            { label: 'Minimal' },
            { label: 'LaTeX Resume' },
        ],
    },
];

export default function Footer() {
    const navigate = useNavigate();
    const year = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-inner">

                {/* Brand column */}
                <div className="footer-brand">
                    <div className="footer-logo" onClick={() => navigate('/')}>
                        <div className="footer-logo-icon">R</div>
                        <span className="footer-logo-text">Resume<em>Forge</em></span>
                    </div>
                    <p className="footer-tagline">
                        Build professional, ATS-optimized resumes in minutes.<br />
                        Free forever. No sign-up required.
                    </p>
                </div>

                {/* Dynamic link columns */}
                {columns.map(col => (
                    <div key={col.title} className="footer-col">
                        <div className="footer-col-title">{col.title}</div>
                        {col.links.map(link => (
                            <span
                                key={link.label}
                                className="footer-col-link"
                                onClick={link.path ? () => navigate(link.path) : undefined}
                            >
                                {link.label}
                            </span>
                        ))}
                    </div>
                ))}
            </div>

            {/* Bottom bar */}
            <div className="footer-bottom">
                <span>© {year} ResumeForge. All rights reserved.</span>
                <div className="footer-bottom-links">
                    <span>Free to use</span>
                    <span className="footer-dot">·</span>
                    <span>No data stored</span>
                    <span className="footer-dot">·</span>
                    <span>Open source friendly</span>
                </div>
            </div>
        </footer>
    );
}
