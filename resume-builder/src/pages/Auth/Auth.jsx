import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import './Auth.css';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();

    const handleAuth = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);

        try {
            if (isForgotPassword) {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: window.location.origin,
                });
                if (error) throw error;
                setErrorMsg('Success! Check your email for a password reset link.');
            } else if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                navigate('/');
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        }
                    }
                });
                if (error) throw error;
                setIsLogin(true);
                setPassword('');
                setErrorMsg('Success! Your account has been created. Please log in.');
            }
        } catch (error) {
            setErrorMsg(error.message || 'An error occurred during authentication.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-title">
                        Resume<em style={{ color: '#6b4db0', fontStyle: 'normal' }}>Forge</em>
                    </h1>
                    <p className="auth-subtitle">
                        {isForgotPassword ? 'Enter your email to reset your password.' : isLogin ? 'Welcome back! Please enter your details.' : 'Create an account to save your progress.'}
                    </p>
                </div>

                {errorMsg && (
                    <div className="auth-error" style={{ color: errorMsg.startsWith('Success') ? '#15803d' : '#dc2626', background: errorMsg.startsWith('Success') ? '#f0fdf4' : '#fef2f2', borderColor: errorMsg.startsWith('Success') ? '#86efac' : '#fecaca' }}>
                        {errorMsg}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleAuth}>
                    {!isLogin && !isForgotPassword && (
                        <div className="auth-input-group">
                            <label className="auth-label">Full Name</label>
                            <input
                                type="text"
                                className="auth-input"
                                placeholder="Enter your full name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required={!isLogin}
                            />
                        </div>
                    )}

                    <div className="auth-input-group">
                        <label className="auth-label">Email</label>
                        <input
                            type="email"
                            className="auth-input"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {!isForgotPassword && (
                        <div className="auth-input-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label className="auth-label">Password</label>
                                {isLogin && (
                                    <button
                                        type="button"
                                        className="auth-forgot-btn"
                                        onClick={() => { setIsForgotPassword(true); setErrorMsg(''); }}
                                    >
                                        Forgot password?
                                    </button>
                                )}
                            </div>
                            <div className="auth-password-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="auth-input"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required={!isForgotPassword}
                                />
                                <button
                                    type="button"
                                    className="auth-password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" /></svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="auth-btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Working...' : isForgotPassword ? 'Send Reset Link' : isLogin ? 'Sign In' : 'Sign Up'}
                    </button>
                </form>

                <div className="auth-toggle">
                    {isForgotPassword ? (
                        <button
                            type="button"
                            className="auth-toggle-btn"
                            onClick={() => { setIsForgotPassword(false); setErrorMsg(''); }}
                        >
                            Back to log in
                        </button>
                    ) : (
                        <>
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <button
                                type="button"
                                className="auth-toggle-btn"
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setErrorMsg('');
                                }}
                            >
                                {isLogin ? 'Sign up' : 'Log in'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
