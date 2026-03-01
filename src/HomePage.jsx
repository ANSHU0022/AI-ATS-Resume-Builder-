import { useNavigate } from 'react-router-dom';
import './HomePage.css';

export default function HomePage() {
    const navigate = useNavigate();

    return (
        <div className="hero-page">
            {/* Floating background circles */}
            <div className="hero-float-circle c1" />
            <div className="hero-float-circle c2" />
            <div className="hero-float-circle c3" />

            {/* ── Navbar ── */}
            <nav className="hero-nav">
                <div className="hero-nav-logo">
                    <div className="hero-nav-logo-icon">R</div>
                    <div className="hero-nav-logo-text">ATS Resume Builder</div>
                </div>
                <div className="hero-nav-links">
                    <span className="hero-nav-link" onClick={() => navigate('/')}>Home</span>
                    <span className="hero-nav-link" onClick={() => navigate('/builder')}>Builder</span>
                    <button className="hero-cta" style={{ padding: '10px 22px', fontSize: 13 }} onClick={() => navigate('/builder')}>
                        Get Started
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </nav>

            {/* ── Hero Section ── */}
            <section className="hero-section">
                {/* Left Content */}
                <div className="hero-left">
                    <div className="hero-badge">
                        <div className="hero-badge-dot" />
                        AI-Powered · Free · No Sign-up
                    </div>

                    <h1 className="hero-heading">
                        <span>ATS AI</span><br />Resume Builder
                    </h1>

                    <p className="hero-subtitle">
                        Build professional, ATS-optimized resumes in minutes. Our AI parses your existing CV and auto-fills every section — powered by Groq LLaMA 3.3 70B for lightning-fast results.
                    </p>

                    <div className="hero-features">
                        <div className="hero-feature">
                            <div className="hero-feature-icon">
                                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
                            </div>
                            Real-time ATS score with smart optimization tips
                        </div>
                        <div className="hero-feature">
                            <div className="hero-feature-icon">
                                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
                            </div>
                            Upload existing PDF — AI auto-fills all 8 sections instantly
                        </div>
                        <div className="hero-feature">
                            <div className="hero-feature-icon">
                                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6" /></svg>
                            </div>
                            3 professional templates — Classic, Modern &amp; Minimal
                        </div>
                        <div className="hero-feature">
                            <div className="hero-feature-icon">
                                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
                            </div>
                            Download pixel-perfect PDF — ready for any job portal
                        </div>
                    </div>

                    <div className="hero-cta-row">
                        <button className="hero-cta" onClick={() => navigate('/builder')}>
                            Build Your Resume
                            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </button>
                        <button className="hero-secondary" onClick={() => navigate('/builder')}>
                            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
                            Upload CV
                        </button>
                    </div>
                </div>

                {/* Right — 3D Resume Visual */}
                <div className="hero-right">
                    <div className="resume-3d-wrapper">
                        <div className="resume-3d">
                            {/* ATS Score Badge */}
                            <div className="r3d-ats-badge">
                                <div className="r3d-ats-score">95</div>
                                <div className="r3d-ats-label">ATS</div>
                            </div>

                            {/* Mock Resume Content */}
                            <div className="r3d-header">
                                <div className="r3d-name">Anshu Prasad</div>
                                <div className="r3d-title">Data Analyst · AI Enthusiast</div>
                                <div className="r3d-contacts">
                                    <span className="r3d-contact-item">📧 email</span>
                                    <span className="r3d-contact-item">📱 phone</span>
                                    <span className="r3d-contact-item">📍 location</span>
                                </div>
                            </div>

                            <div className="r3d-section-title">SUMMARY</div>
                            <div className="r3d-line long" />
                            <div className="r3d-line medium" />
                            <div className="r3d-line short" />

                            <div className="r3d-section-title">TECHNICAL SKILLS</div>
                            <div className="r3d-skill-row">
                                <span className="r3d-skill">Python</span>
                                <span className="r3d-skill">SQL</span>
                                <span className="r3d-skill">Power BI</span>
                                <span className="r3d-skill">Excel</span>
                                <span className="r3d-skill">React</span>
                            </div>
                            <div className="r3d-skill-row">
                                <span className="r3d-skill">TensorFlow</span>
                                <span className="r3d-skill">Pandas</span>
                                <span className="r3d-skill">Git</span>
                            </div>

                            <div className="r3d-section-title">EXPERIENCE</div>
                            <div className="r3d-line long" />
                            <div className="r3d-line medium" />
                            <div className="r3d-line long" />
                            <div className="r3d-line short" />

                            <div className="r3d-section-title">PROJECTS</div>
                            <div className="r3d-line long" />
                            <div className="r3d-line medium" />
                            <div className="r3d-line xs" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Stats Bar ── */}
            <div className="hero-stats">
                <div className="hero-stat">
                    <div className="hero-stat-value">100<span>%</span></div>
                    <div className="hero-stat-label">Free Forever</div>
                </div>
                <div className="hero-stat">
                    <div className="hero-stat-value">3<span>+</span></div>
                    <div className="hero-stat-label">Resume Templates</div>
                </div>
                <div className="hero-stat">
                    <div className="hero-stat-value">8</div>
                    <div className="hero-stat-label">Auto-Fill Sections</div>
                </div>
                <div className="hero-stat">
                    <div className="hero-stat-value">95<span>+</span></div>
                    <div className="hero-stat-label">ATS Score Achievable</div>
                </div>
            </div>
        </div>
    );
}
