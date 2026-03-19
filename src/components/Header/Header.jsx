import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import './Header.css';

export default function Header() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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

    const navItems = [
        { label: 'Resume', path: '/builder', hasArrow: true },
        { label: 'Cover Letter', path: '/cover-letter', hasArrow: true },
        { label: 'LaTeX Editor', path: '/latex-editor' },
        { label: 'Networking', path: '/networking', hasArrow: true },
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
                        </div>
                    ) : (
                        <div className="desktop-auth-actions">
                            <button className="btn-signin" type="button" onClick={() => navigate('/auth')}>Sign in</button>
                            <button className="btn-start desktop-only" type="button" onClick={() => navigate('/builder')}>Get Started</button>
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
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            className="rf-sidebar-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeMenu}
                        />
                        <motion.div
                            className="rf-sidebar"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
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
                                                {item.label}
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                            </button>
                                        </li>
                                    ))}
                                </ul>

                                <div className="rf-sidebar-footer">
                                    {!user && (
                                        <button className="btn-start full-width" onClick={() => { navigate('/builder'); closeMenu(); }}>
                                            Get Started Free
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
}
