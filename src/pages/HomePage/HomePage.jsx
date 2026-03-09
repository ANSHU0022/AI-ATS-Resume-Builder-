import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import Features from '../../components/Features.jsx';
import Steps from '../../components/Steps.jsx';

function TemplateOne() {
    return (
        <div className="t1" style={{ height: '100%' }}>
            <div className="t1-head">
                <div className="t1-avatar">A</div>
                <div>
                    <div className="t1-name">Anshu Prasad</div>
                    <div className="t1-role">Senior Data Analyst</div>
                    <div className="t1-contacts">
                        <span className="t1-contact">✉ anshu@email.com</span>
                        <span className="t1-contact">☎ +91 98765 43210</span>
                        <span className="t1-contact">📍 Bangalore, IN</span>
                    </div>
                </div>
            </div>
            <div className="t1-body">
                <div className="t1-main">
                    <div className="t1-sec">Experience</div>
                    <div className="t1-job">
                        <div className="t1-jt">Lead Data Analyst</div>
                        <div className="t1-jc">Google · 2021–Present</div>
                        <div className="sk w95" />
                        <div className="sk w80" />
                        <div className="sk w75" />
                    </div>
                    <div className="t1-job">
                        <div className="t1-jt">Data Scientist</div>
                        <div className="t1-jc">Infosys · 2018–2021</div>
                        <div className="sk w88" />
                        <div className="sk w70" />
                    </div>
                    <div className="t1-job">
                        <div className="t1-jt">Analyst Intern</div>
                        <div className="t1-jc">Wipro · 2017–2018</div>
                        <div className="sk w75" />
                    </div>
                    <div className="t1-sec">Education</div>
                    <div className="sk w80" />
                    <div className="sk w65" />
                    <div className="t1-sec">Skills</div>
                    <div className="sbar">
                        <span className="sbar-n">Python</span>
                        <div className="sbar-t"><div className="sbar-f" style={{ width: '92%' }} /></div>
                    </div>
                    <div className="sbar">
                        <span className="sbar-n">SQL</span>
                        <div className="sbar-t"><div className="sbar-f" style={{ width: '87%' }} /></div>
                    </div>
                    <div className="sbar">
                        <span className="sbar-n">Power BI</span>
                        <div className="sbar-t"><div className="sbar-f" style={{ width: '78%' }} /></div>
                    </div>
                    <div className="sbar">
                        <span className="sbar-n">TensorFlow</span>
                        <div className="sbar-t"><div className="sbar-f" style={{ width: '70%' }} /></div>
                    </div>
                </div>
                <div className="t1-side">
                    <div className="t1-sec">Achievements</div>
                    <div className="sk w95" />
                    <div className="sk w80" />
                    <div className="sk w88" />
                    <div className="sk w70" />
                    <div className="t1-sec">My Time</div>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'conic-gradient(#7c5cbf 0% 60%, #c8963e 60% 80%, #eee 80% 100%)', margin: '6px 0 10px' }} />
                    <div className="sk w88" />
                    <div className="sk w65" />
                    <div className="t1-sec">Training</div>
                    <div className="sk w95" />
                    <div className="sk w80" />
                    <div className="sk w70" />
                    <div className="t1-sec">Passions</div>
                    <div className="sk w75" />
                    <div className="sk w55" />
                </div>
            </div>

            
        </div>
    );
}

function TemplateTwo() {
    return (
        <div className="t2" style={{ height: '100%' }}>
            <div className="t2-sidebar">
                <div className="t2-avatar">A</div>
                <div className="t2-name">Anshu Prasad</div>
                <div className="t2-role">Data Analyst</div>
                <div className="t2-sec">Contact</div>
                <div className="t2-contact-item">✉ anshu@email.com</div>
                <div className="t2-contact-item">☎ +91 98765 43210</div>
                <div className="t2-contact-item">📍 Bangalore, IN</div>
                <div className="t2-sec">Skills</div>
                <div className="t2-skill">Python</div>
                <div className="t2-dot-bar"><div className="t2-dot on" /><div className="t2-dot on" /><div className="t2-dot on" /><div className="t2-dot on" /><div className="t2-dot" /></div>
                <div className="t2-skill">SQL</div>
                <div className="t2-dot-bar"><div className="t2-dot on" /><div className="t2-dot on" /><div className="t2-dot on" /><div className="t2-dot on" /><div className="t2-dot" /></div>
                <div className="t2-skill">Power BI</div>
                <div className="t2-dot-bar"><div className="t2-dot on" /><div className="t2-dot on" /><div className="t2-dot on" /><div className="t2-dot" /><div className="t2-dot" /></div>
                <div className="t2-skill">TensorFlow</div>
                <div className="t2-dot-bar"><div className="t2-dot on" /><div className="t2-dot on" /><div className="t2-dot on" /><div className="t2-dot" /><div className="t2-dot" /></div>
                <div className="t2-skill">Pandas</div>
                <div className="t2-dot-bar"><div className="t2-dot on" /><div className="t2-dot on" /><div className="t2-dot on" /><div className="t2-dot on" /><div className="t2-dot on" /></div>
                <div className="t2-sec">Education</div>
                <div className="sk-dark w90" />
                <div className="sk-dark w75" />
                <div className="sk-dark w60" />
            </div>
            <div className="t2-main">
                <div className="t2-msec">Experience</div>
                <div className="t2-job">
                    <div className="t2-jt">Lead Data Analyst</div>
                    <div className="t2-jc">Google · 2021 – Present</div>
                    <div className="sk w95" />
                    <div className="sk w80" />
                    <div className="sk w70" />
                </div>
                <div className="t2-job">
                    <div className="t2-jt">Data Scientist</div>
                    <div className="t2-jc">Infosys · 2018 – 2021</div>
                    <div className="sk w88" />
                    <div className="sk w72" />
                </div>
                <div className="t2-job">
                    <div className="t2-jt">Analyst Intern</div>
                    <div className="t2-jc">Wipro · 2017 – 2018</div>
                    <div className="sk w75" />
                </div>
                <div className="t2-msec">Key Projects</div>
                <div className="t2-job">
                    <div className="t2-jt">Demand Forecasting Engine</div>
                    <div style={{ marginTop: 4 }}>
                        <span className="t2-tag">Python</span>
                        <span className="t2-tag">ML</span>
                        <span className="t2-tag">BigQuery</span>
                    </div>
                    <div className="sk w88" style={{ marginTop: 5 }} />
                    <div className="sk w70" />
                </div>
                <div className="t2-msec">Certifications</div>
                <div className="sk w80" />
                <div className="sk w65" />
            </div>

            
        </div>
    );
}

function TemplateThree() {
    return (
        <div className="t3" style={{ height: '100%' }}>
            <div className="t3-top-bar" />
            <div className="t3-head">
                <div className="t3-name">Anshu Prasad</div>
                <div className="t3-role">Senior Data Analyst · AI Enthusiast</div>
                <div className="t3-contact-row">
                    <span className="t3-ct">✉ anshu@email.com</span>
                    <span className="t3-ct">☎ +91 98765 43210</span>
                    <span className="t3-ct">📍 Bangalore, IN</span>
                    <span className="t3-ct">in/anshuprasad</span>
                </div>
            </div>
            <div className="t3-body">
                <div className="t3-sec">Experience</div>
                <div className="t3-job">
                    <div className="t3-dot-col"><div className="t3-circ" /><div className="t3-line-v" /></div>
                    <div className="t3-jcontent">
                        <div className="t3-jt">Lead Data Analyst</div>
                        <div className="t3-jc">Google · 2021 – Present</div>
                        <div className="sk w88" />
                        <div className="sk w75" />
                        <div className="t3-tags"><span className="t3-tag">Python</span><span className="t3-tag">BigQuery</span><span className="t3-tag">ML</span></div>
                    </div>
                </div>
                <div className="t3-job">
                    <div className="t3-dot-col"><div className="t3-circ" /><div className="t3-line-v" /></div>
                    <div className="t3-jcontent">
                        <div className="t3-jt">Data Scientist</div>
                        <div className="t3-jc">Infosys · 2018 – 2021</div>
                        <div className="sk w80" />
                        <div className="sk w65" />
                        <div className="t3-tags"><span className="t3-tag">TensorFlow</span><span className="t3-tag">Pandas</span></div>
                    </div>
                </div>
                <div className="t3-job">
                    <div className="t3-dot-col"><div className="t3-circ" /></div>
                    <div className="t3-jcontent">
                        <div className="t3-jt">Analyst Intern</div>
                        <div className="t3-jc">Wipro · 2017 – 2018</div>
                        <div className="sk w70" />
                    </div>
                </div>
                <div className="t3-sec">Skills</div>
                <div className="t3-skills-grid">
                    <div className="t3-skill-item"><div className="t3-sn">Python</div><div className="t3-sb"><div className="t3-sf" style={{ width: '92%' }} /></div></div>
                    <div className="t3-skill-item"><div className="t3-sn">SQL</div><div className="t3-sb"><div className="t3-sf" style={{ width: '87%' }} /></div></div>
                    <div className="t3-skill-item"><div className="t3-sn">Power BI</div><div className="t3-sb"><div className="t3-sf" style={{ width: '78%' }} /></div></div>
                    <div className="t3-skill-item"><div className="t3-sn">TensorFlow</div><div className="t3-sb"><div className="t3-sf" style={{ width: '71%' }} /></div></div>
                    <div className="t3-skill-item"><div className="t3-sn">Pandas</div><div className="t3-sb"><div className="t3-sf" style={{ width: '88%' }} /></div></div>
                    <div className="t3-skill-item"><div className="t3-sn">React</div><div className="t3-sb"><div className="t3-sf" style={{ width: '62%' }} /></div></div>
                </div>
                <div className="t3-sec">Education</div>
                <div className="sk w80" />
                <div className="sk w60" />
                <div className="t3-sec">Certifications</div>
                <div className="sk w75" />
                <div className="sk w55" />
            </div>

            
        </div>
    );
}

const templates = [TemplateOne, TemplateTwo, TemplateThree];

export default function HomePage() {
    const navigate = useNavigate();
    const [flipState, setFlipState] = useState({
        current: 0,
        isFlipped: false,
        faceA: 0,
        faceB: 1,
    });

    useEffect(() => {
        const id = setInterval(() => {
            setFlipState(prev => {
                const next = (prev.current + 1) % 3;
                const nextIsFlipped = !prev.isFlipped;
                const nextFaceA = prev.isFlipped ? next : prev.faceA;
                const nextFaceB = prev.isFlipped ? prev.faceB : next;
                return {
                    current: next,
                    isFlipped: nextIsFlipped,
                    faceA: nextFaceA,
                    faceB: nextFaceB,
                };
            });
        }, 3000);

        return () => clearInterval(id);
    }, []);

    const FaceA = templates[flipState.faceA];
    const FaceB = templates[flipState.faceB];

    const marqueeItems = [
        'ATS Resume Builder',
        'Real-Time ATS Score',
        'JD Keyword Matching',
        'Cover Letter Generator',
        'LaTeX Editor & Compiler',
        'AI Resume Analysis',
        'One-Click PDF Export',
        '3 Pro Templates',
    ];

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
                            Real-Time ATS Score
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
                    </div>

                    <div className="cta-group">
                        <button className="cta-main" type="button" onClick={() => navigate('/builder')}>
                            Build My Resume
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </button>
                        <button className="cta-outline" type="button" onClick={() => navigate('/builder')}>
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

                        <div className="flip-wrapper">
                            <div className={`flip-card${flipState.isFlipped ? ' flipping' : ''}`}>
                                <div className="card-face front"><FaceA /></div>
                                <div className="card-face back"><FaceB /></div>
                            </div>

                            <div className="template-dots">
                                {[0, 1, 2].map(i => (
                                    <div key={i} className={`tdot${flipState.current === i ? ' active' : ''}`} />
                                ))}
                            </div>
                        </div>

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
        </div>
    );
}


