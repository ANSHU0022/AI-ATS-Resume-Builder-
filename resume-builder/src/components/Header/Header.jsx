import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import './Header.css';

export default function Header() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const MotionDiv = motion.div;

    const goToFeedback = () => {
        if (window.location.pathname !== '/') {
            navigate('/', { state: { scrollToFeedback: true } });
            setIsMenuOpen(false);
            return;
        }

        const feedbackSection = document.getElementById('feedback');
        if (feedbackSection) {
            feedbackSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        setIsMenuOpen(false);
    };

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);
        };
        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        // Clear application cache immediately
        localStorage.removeItem("resume-data-cache");
        setIsMenuOpen(false);
        navigate('/');
    };

    const getFirstName = () => {
        if (!user) return '';
        const name = user.user_metadata?.full_name || user.email?.split('@')[0] || '';
        return name.split(' ')[0];
    };

    const NAV_ICONS = {
        Resume: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
            </svg>
        ),
        'JD Match': (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 5a2 2 0 0 1 2-2h8l4 4v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5z"/>
                <polyline points="13 3 13 8 18 8"/>
                <circle cx="17.5" cy="17.5" r="3.5"/>
                <line x1="20" y1="20" x2="22" y2="22"/>
            </svg>
        ),
        'Cover Letter': (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
            </svg>
        ),
        'LaTeX Editor': (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6"/>
                <polyline points="8 6 2 12 8 18"/>
            </svg>
        ),
        Networking: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
        ),
        'Job Portals': (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                <line x1="12" y1="12" x2="12" y2="16"/>
                <line x1="10" y1="14" x2="14" y2="14"/>
            </svg>
        ),
    };

    const navItems = [
        { label: 'Resume', path: '/ats-resume-builder' },
        { label: 'JD Match', path: '/jd-match' },
        { label: 'Cover Letter', path: '/cover-letter' },
        { label: 'LaTeX Editor', path: '/latex-editor' },
        { label: 'Networking', path: '/network-outreach' },
        { label: 'Job Portals', path: '/job-portals' },
    ];

    const closeMenu = () => setIsMenuOpen(false);

    return (
        <nav className="rf-nav">
            <div className="rf-nav-container">
                <button className="rf-logo" type="button" onClick={() => navigate('/')}>
                    <img src="/high-resolution-color-logo.png" alt="ATSForge Logo" className="rf-logo-img" />
                </button>

                {/* Desktop Nav */}
                <ul className="rf-nav-links desktop-only">
                    {navItems.map(item => (
                        <li key={item.label}>
                            <button className="rf-nav-link" type="button" onClick={() => navigate(item.path)}>
                                {item.label}
                                {item.hasArrow && <span className="arr">▾</span>}
                            </button>
                        </li>
                    ))}
                </ul>

                <div className="rf-nav-actions">
                    {user ? (
                        <div className="desktop-user-actions" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div className="rf-user-greeting">
                                <span style={{ fontSize: '16px' }}>👋</span>
                                <span style={{ fontWeight: 600 }}>Hi, {getFirstName()}</span>
                            </div>
                            <button className="btn-signin" type="button" onClick={handleLogout}>Log out</button>
                            <button className="btn-feedback-icon desktop-only" type="button" onClick={goToFeedback} aria-label="Open feedback">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                            </button>
                        </div>
                    ) : (
                        <div className="desktop-auth-actions">
                            <button className="btn-signin" type="button" onClick={() => navigate('/auth')}>Sign in</button>
                            <button className="btn-start desktop-only" type="button" onClick={() => navigate('/ats-resume-builder')}>Get Started</button>
                            <button className="btn-feedback-icon desktop-only" type="button" onClick={goToFeedback} aria-label="Open feedback">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        className="rf-menu-toggle"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <div className={`hamburger ${isMenuOpen ? 'open' : ''}`}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Mobile Sidebar */}
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {isMenuOpen && (
                        <>
                            <MotionDiv
                                className="rf-sidebar-overlay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={closeMenu}
                            />
                            <MotionDiv
                                className="rf-sidebar"
                                initial={{ opacity: 0, x: 24, scale: 0.98 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 24, scale: 0.98 }}
                                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                                style={{ position: 'fixed', top: '12px', right: '10px', bottom: '12px', zIndex: 11010 }}
                            >
                                <div className="rf-sidebar-header">
                                    <button className="rf-logo" type="button" onClick={() => { navigate('/'); closeMenu(); }}>
                                        <img src="/high-resolution-color-logo.png" alt="ATSForge Logo" className="rf-logo-img" />
                                    </button>
                                    <button className="rf-close-btn" onClick={closeMenu}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                </div>

                                <div className="rf-sidebar-content">
                                    <ul className="rf-sidebar-links">
                                        {navItems.map(item => (
                                            <li key={item.label}>
                                                <button
                                                    className="rf-sidebar-link"
                                                    type="button"
                                                    onClick={() => { navigate(item.path); closeMenu(); }}
                                                >
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <span className="rf-sidebar-icon">{NAV_ICONS[item.label]}</span>
                                                        {item.label}
                                                    </span>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                                </button>
                                            </li>
                                        ))}

                                        <li>
                                            <button
                                                className="rf-sidebar-link"
                                                type="button"
                                                onClick={goToFeedback}
                                            >
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <span className="rf-sidebar-icon">
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                                        </svg>
                                                    </span>
                                                    Feedback
                                                </span>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                            </button>
                                        </li>
                                    </ul>
                                </div>

                                <div className="rf-sidebar-footer">
                                    {user ? (
                                        <>
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: '10px',
                                                background: 'rgba(124,92,191,0.08)', border: '1px solid rgba(124,92,191,0.18)',
                                                borderRadius: '12px', padding: '10px 14px', marginBottom: '12px'
                                            }}>
                                                <div style={{
                                                    width: 36, height: 36, borderRadius: '50%',
                                                    background: 'linear-gradient(135deg,#a78bfa,#7c5cbf)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: 16, fontWeight: 700, color: '#fff', flexShrink: 0
                                                }}>
                                                    {getFirstName()[0]?.toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e', fontFamily: "'Sora',sans-serif" }}>Hi, {getFirstName()} 👋</div>
                                                    <div style={{ fontSize: 11, color: '#7c5cbf', fontFamily: "'Sora',sans-serif", marginTop: 1 }}>{user.email}</div>
                                                </div>
                                            </div>
                                            <button
                                                style={{
                                                    width: '100%', padding: '11px', borderRadius: '12px',
                                                    border: '1.5px solid rgba(124,92,191,0.25)',
                                                    background: 'rgba(255,255,255,0.8)', color: '#444',
                                                    fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 600,
                                                    cursor: 'pointer', transition: 'all 0.2s'
                                                }}
                                                onClick={handleLogout}
                                            >
                                                Log out
                                            </button>
                                        </>
                                    ) : (
                                        <button className="btn-start full-width" onClick={() => { navigate('/ats-resume-builder'); closeMenu(); }}>
                                            Get Started Free
                                        </button>
                                    )}
                                </div>
                            </MotionDiv>
                        </>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </nav>
    );
}
