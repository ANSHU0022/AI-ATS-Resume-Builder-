import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import './Header.css';

export default function Header() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Fetch current session
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);
        };
        getSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
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

    return (
        <nav className="rf-nav">
            <button className="rf-logo" type="button" onClick={() => navigate('/')}>
                <span className="rf-logo-icon">R</span>
                <span className="rf-logo-text">Resume<em>Forge</em></span>
            </button>

            <ul className="rf-nav-links">
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div className="rf-user-greeting">
                            <span style={{ fontSize: '16px' }}>👋</span>
                            <span style={{ fontWeight: 600 }}>Hi, {getFirstName()}</span>
                        </div>
                        <button className="btn-signin" type="button" onClick={handleLogout}>Log out</button>
                    </div>
                ) : (
                    <>
                        <button className="btn-signin" type="button" onClick={() => navigate('/auth')}>Sign in</button>
                        <button className="btn-start" type="button" onClick={() => navigate('/builder')}>Get Started</button>
                    </>
                )}
            </div>
        </nav>
    );
}
