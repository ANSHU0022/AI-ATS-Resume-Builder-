import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import Features from '../../components/Features.jsx';
import Steps from '../../components/Steps.jsx';
import FeedbackSection from '../../components/FeedbackSection/FeedbackSection.jsx';

const RESUME_IMAGES = [
    '/Anshu_Prasad _EuropassCV._page-0001.jpg',
    '/Anshu_Prasad_Resume_page-0001.jpg',
    '/Anshu Prasad (2)_pages-to-jpg-0001.jpg',
];

function ResumeCard3D() {
    const cardRef = useRef(null);
    const [activeImg, setActiveImg] = useState(0);
    const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });
    const [isHovering, setIsHovering] = useState(false);
    const [animDone, setAnimDone] = useState(false);
    const rafRef = useRef(null);

    useEffect(() => {
        const id = setInterval(() => {
            setActiveImg(prev => (prev + 1) % RESUME_IMAGES.length);
        }, 6000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        const t = setTimeout(() => setAnimDone(true), 950);
        return () => clearTimeout(t);
    }, []);

    const handleMouseMove = useCallback((e) => {
        if (!cardRef.current) return;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
            const rect = cardRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateY = ((x - centerX) / centerX) * 18;
            const rotateX = ((centerY - y) / centerY) * 14;
            setTilt({
                rotateX,
                rotateY,
                glareX: (x / rect.width) * 100,
                glareY: (y / rect.height) * 100,
            });
        });
    }, []);

    const handleMouseEnter = useCallback(() => setIsHovering(true), []);

    const handleMouseLeave = useCallback(() => {
        setIsHovering(false);
        setTilt({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }, []);

    const cardStyle = animDone ? {
        transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(${isHovering ? 1.04 : 1})`,
        transition: isHovering ? 'transform 0.08s ease-out' : 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
        animation: 'none',
    } : {};

    return (
        <div
            className="resume3d-wrapper"
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={cardStyle}
        >
            <div className="resume3d-inner">
                {RESUME_IMAGES.map((src, i) => (
                    <img
                        key={i}
                        src={src}
                        alt={`Resume template ${i + 1}`}
                        className={`resume3d-img${activeImg === i ? ' active' : ''}`}
                        draggable={false}
                    />
                ))}
                <div
                    className="resume3d-glare"
                    style={{
                        background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.06) 40%, transparent 70%)`,
                        opacity: isHovering ? 1 : 0,
                    }}
                />
            </div>
            <div className="resume3d-shadow" style={{
                transform: `translateX(${tilt.rotateY * 1.2}px) translateY(${-tilt.rotateX * 0.8 + 12}px)`,
                opacity: isHovering ? 0.22 : 0.12,
            }} />
            <div className="resume3d-dots">
                {RESUME_IMAGES.map((_, i) => (
                    <div key={i} className={`resume3d-dot${activeImg === i ? ' active' : ''}`} />
                ))}
            </div>
        </div>
    );
}

export default function HomePage() {
    const navigate = useNavigate();

    useEffect(() => {
        if (window.history.state?.usr?.scrollToFeedback) {
            const timeoutId = setTimeout(() => {
                const feedbackSection = document.getElementById('feedback');
                if (feedbackSection) {
                    feedbackSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                window.history.replaceState(
                    {
                        ...window.history.state,
                        usr: {
                            ...window.history.state?.usr,
                            scrollToFeedback: false,
                        },
                    },
                    ''
                );
            }, 150);

            return () => clearTimeout(timeoutId);
        }

        return undefined;
    }, []);

    return (
        <div className="hero-page">
            <div className="bg-wrap" aria-hidden="true" />

            <section className="hero">
                <div className="hero-left">
                    <div className="tag-pill"><span className="tag-dot" />AI-Powered · Free · No Sign-up</div>

                    <h1>The <span className="highlight">All-in-One</span><br />ATS Resume Suite</h1>

                    <p className="hero-desc">Upload your existing CV — our AI instantly parses, refines, and rebuilds a fully ATS-optimized resume. Score your resume, match JD keywords, generate cover letters, and compile LaTeX — all in one place.</p>

                    <div className="features-text">
                        <span>
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <path d="M14 2v6h6" />
                                <path d="M8 13h8" />
                                <path d="M8 17h6" />
                            </svg>
                            ATS Resume Builder
                        </span>
                        <span>
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <circle cx="12" cy="12" r="9" />
                                <circle cx="12" cy="12" r="5" />
                                <circle cx="12" cy="12" r="1.5" />
                            </svg>
                            All Job Portals
                        </span>
                        <span>
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <circle cx="8.5" cy="11.5" r="3.5" />
                                <path d="M12 11.5h9M18 11.5v2M21 11.5v2" />
                            </svg>
                            JD Keyword Matching
                        </span>
                        <span>
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <rect x="3" y="5" width="18" height="14" rx="2" />
                                <path d="M3 7l9 6 9-6" />
                            </svg>
                            Cover Letter Generator
                        </span>
                        <span>
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <rect x="3" y="6" width="18" height="12" rx="2" />
                                <path d="M7 10h.01M10 10h.01M13 10h.01M16 10h.01" />
                                <path d="M7 14h10" />
                            </svg>
                            LaTeX Editor
                        </span>
                        <span>
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <rect x="4" y="7" width="16" height="12" rx="3" />
                                <path d="M9 11h.01M15 11h.01" />
                                <path d="M8 15h8" />
                                <path d="M12 7V4" />
                            </svg>
                            AI Resume Analysis
                        </span>
                        <span>
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                            </svg>
                            Ai Cold Email & Dm
                        </span>
                    </div>

                    <div className="cta-group">
                        <button className="cta-main" type="button" onClick={() => navigate('/builder')}>
                            Build My Resume
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </button>
                        <button className="cta-outline" type="button" onClick={() => navigate('/builder', { state: { openUpload: true } })}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
                            Upload Existing CV
                        </button>
                    </div>

                    <div className="stats-row">
                        <div className="stat">
                            <div className="stat-n">95<sup>+</sup></div>
                            <div className="stat-l">ATS Score Achievable</div>
                        </div>
                        <div className="stat-sep" />
                        <div className="stat">
                            <div className="stat-n">8</div>
                            <div className="stat-l">Auto-fill Sections</div>
                        </div>
                        <div className="stat-sep" />
                        <div className="stat">
                            <div className="stat-n">3<sup>+</sup></div>
                            <div className="stat-l">ATS Templates</div>
                        </div>
                        <div className="stat-sep" />
                        <div className="stat">
                            <div className="stat-n">100<sup>%</sup></div>
                            <div className="stat-l">Free Forever</div>
                        </div>
                    </div>

                    <div className="proof-box">
                        <div className="proof-row">
                            <div className="proof-item"><span className="arrow-up">↑</span><span className="proof-num">38%</span><span>more interview callbacks</span></div>
                            <div className="proof-sep" />
                            <div className="proof-item"><span className="arrow-up">↑</span><span className="proof-num">42%</span><span>higher recruiter response</span></div>
                        </div>
                    </div>

                </div>

                <div className="hero-right">
                    <div className="blob blob-1" />
                    <div className="blob blob-2" />
                    <div className="blob blob-3" />

                    <div className="mockup-scene">
                        <div className="font-panel">
                            <div className="fp-label">Font</div>
                            <div className="fp-fonts">
                                <div className="fp-font">Rubik</div>
                                <div className="fp-font">Lato</div>
                                <div className="fp-font">Raleway</div>
                                <div className="fp-font">Exo</div>
                                <div className="fp-font active">Sora</div>
                                <div className="fp-font">Montserr…</div>
                                <div className="fp-font">Oswald</div>
                                <div className="fp-font">Bitter</div>
                            </div>
                        </div>

                        <ResumeCard3D />

                        <div className="chip chip-hired">
                            <span className="h-text">✓ Hired</span>
                        </div>

                        <div className="chip chip-photo" aria-label="Profile highlight">
                            <img src="/IMG_20260304_193723.png" alt="Profile" />
                        </div>

                        <div className="chip chip-jd">
                            <div className="jd-top">
                                <span className="jd-label">JD Match</span>
                                <span className="jd-val">87%</span>
                            </div>
                            <div className="jd-sub">14 / 16 keywords matched</div>
                            <div className="jd-dots">
                                <div className="d-on" /><div className="d-on" /><div className="d-on" /><div className="d-on" />
                                <div className="d-on" /><div className="d-on" /><div className="d-on" /><div className="d-on" />
                                <div className="d-on" /><div className="d-on" /><div className="d-on" /><div className="d-on" />
                                <div className="d-on" /><div className="d-on" />
                                <div className="d-off" /><div className="d-off" />
                            </div>
                        </div>

                        <div className="chip chip-cover">
                            <div className="cv-icon">✉️</div>
                            <div className="cv-title">Cover Letter</div>
                            <div className="cv-sub">AI Generated</div>
                            <div className="cv-badge">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                                Ready
                            </div>
                        </div>

                        <div className="chip chip-new-entry">
                            <span className="ne-plus">+</span>
                            <span className="ne-text">New entry</span>
                            <div className="ne-icons">
                                <div className="ne-icon">T</div>
                                <div className="ne-icon">≡</div>
                                <div className="ne-icon">🗑</div>
                                <div className="ne-icon">⚙</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="marquee-section">
                <div className="marquee-track">
                    {[0, 1].map(loop => (
                        <span className="m-item m-logos" key={`logos-${loop}`}>
                            <img src="/featured-in-logos (1).svg" alt="Featured company logos" />
                        </span>
                    ))}
                </div>
            </div>




            <Features />

            <Steps />

            <FeedbackSection />
        </div>
    );
}
