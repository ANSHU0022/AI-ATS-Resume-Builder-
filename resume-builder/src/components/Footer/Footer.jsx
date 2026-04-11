import { useNavigate } from 'react-router-dom';
import './Footer.css';

const columns = [
    {
        title: 'Product',
        links: [
            { label: 'Resume Builder', path: '/builder' },
            { label: 'LaTeX Editor', path: '/latex-editor' },
            { label: 'CV Upload & Auto-fill', path: '/builder', state: { openUpload: true } },
            { label: 'Cover Letter Generator', path: '/cover-letter' },
            { label: 'Job Description Keyword Match', path: '/builder', state: { openJDPanel: true } },
            { label: 'Networking', path: '/networking' },
        ],
    },
    {
        title: 'Features',
        links: [
            { label: 'ATS Score Checker', path: '/builder' },
            { label: 'AI Summary Generator', path: '/builder' },
            { label: 'JD Keyword Match', path: '/builder', state: { openJDPanel: true } },
            { label: 'PDF Export', path: '/builder' },
            { label: 'Cold Email', path: '/networking' },
            { label: 'Cold DM', path: '/networking' },
            { label: '100+ Job Portals', path: '/job-portals' },
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
                        <img src="/high-resolution-color-logo.png" alt="ATSForge Logo" className="footer-logo-img" />
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
                                onClick={link.path ? () => navigate(link.path, { state: link.state }) : undefined}
                            >
                                {link.label}
                            </span>
                        ))}
                    </div>
                ))}
            </div>

            {/* Bottom bar */}
            <div className="footer-bottom">
                <span>© {year} ATSForge. All rights reserved.</span>
                <div className="footer-bottom-links">
                    <span>Free to use</span>
                    <span className="footer-dot">·</span>
                    <span className="footer-bottom-link" onClick={() => navigate('/privacy-policy')}>Privacy Policy</span>
                    <span className="footer-dot">·</span>
                    <span className="footer-bottom-link" onClick={() => navigate('/terms-and-conditions')}>Terms & Conditions</span>
                </div>
            </div>
        </footer>
    );
}
