import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const { login, isAuthenticated, error: authError } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [focused, setFocused] = useState(null);

    useEffect(() => {
        if (isAuthenticated) navigate('/medicines');
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');
        if (!username || !password) {
            setLocalError('Please fill in both fields.');
            return;
        }
        setIsSubmitting(true);
        const result = await login(username, password);
        setIsSubmitting(false);
        if (result.success) {
            navigate('/medicines');
        } else {
            setLocalError(result.message || 'Authentication failed. Please check your credentials.');
        }
    };

    const displayError = localError || authError;

    return (
        <div
            className="min-h-screen w-screen flex items-center justify-center px-4 relative overflow-hidden"
            style={{ background: 'var(--canvas)' }}
        >
            {/* Background glows */}
            <div
                className="absolute pointer-events-none"
                style={{
                    width: '600px', height: '600px',
                    top: '-200px', left: '50%', transform: 'translateX(-50%)',
                    background: 'radial-gradient(circle, rgba(0,194,204,0.06) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                }}
            />
            <div
                className="absolute pointer-events-none"
                style={{
                    width: '400px', height: '400px',
                    bottom: '-100px', right: '-100px',
                    background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                }}
            />

            {/* Card */}
            <div
                className="w-full max-w-[400px] rounded-3xl p-8 relative animate-slide-up"
                style={{
                    background: 'rgba(15, 20, 32, 0.95)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(24px)',
                }}
            >
                {/* Top brand accent line */}
                <div
                    className="absolute top-0 left-8 right-8 h-[1px] rounded-full"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(0,194,204,0.6), transparent)' }}
                />

                {/* Logo + brand */}
                <div className="flex flex-col items-center mb-10">
                    <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                        style={{
                            background: 'linear-gradient(135deg, rgba(0,194,204,0.2) 0%, rgba(0,119,168,0.15) 100%)',
                            border: '1px solid rgba(0,194,204,0.3)',
                            boxShadow: '0 0 24px rgba(0,194,204,0.15)',
                        }}
                    >
                        <span
                            className="material-symbols-rounded text-2xl"
                            style={{ color: '#00c2cc', fontVariationSettings: "'FILL' 1" }}
                        >
                            medication
                        </span>
                    </div>

                    <h1 className="text-xl font-bold mb-1.5" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                        Welcome back
                    </h1>
                    <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
                        Sign in to SMAART Pharmacy Platform
                    </p>
                </div>

                {/* Error state */}
                {displayError && (
                    <div
                        className="flex items-center gap-3 p-3.5 rounded-xl mb-6 text-sm animate-fade-in"
                        style={{
                            background: 'rgba(248, 113, 113, 0.08)',
                            border: '1px solid rgba(248, 113, 113, 0.2)',
                            color: '#fca5a5',
                        }}
                    >
                        <span className="material-symbols-rounded text-base flex-shrink-0" style={{ color: '#f87171' }}>error</span>
                        <span className="text-xs font-medium">{displayError}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Username */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                            Username
                        </label>
                        <div className="relative">
                            <span
                                className="material-symbols-rounded absolute left-3.5 top-1/2 -translate-y-1/2 text-base pointer-events-none transition-colors duration-200"
                                style={{ color: focused === 'username' ? '#00c2cc' : 'var(--text-muted)' }}
                            >
                                person
                            </span>
                            <input
                                id="login-username"
                                type="text"
                                autoComplete="username"
                                placeholder="Enter your username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                onFocus={() => setFocused('username')}
                                onBlur={() => setFocused(null)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 outline-none"
                                style={{
                                    background: focused === 'username' ? 'rgba(0,194,204,0.05)' : 'rgba(255,255,255,0.04)',
                                    border: focused === 'username' ? '1px solid rgba(0,194,204,0.4)' : '1px solid rgba(255,255,255,0.08)',
                                    color: 'var(--text-primary)',
                                    caretColor: '#00c2cc',
                                }}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                            Password
                        </label>
                        <div className="relative">
                            <span
                                className="material-symbols-rounded absolute left-3.5 top-1/2 -translate-y-1/2 text-base pointer-events-none transition-colors duration-200"
                                style={{ color: focused === 'password' ? '#00c2cc' : 'var(--text-muted)' }}
                            >
                                lock
                            </span>
                            <input
                                id="login-password"
                                type={showPass ? 'text' : 'password'}
                                autoComplete="current-password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                onFocus={() => setFocused('password')}
                                onBlur={() => setFocused(null)}
                                className="w-full pl-10 pr-12 py-3 rounded-xl text-sm font-medium transition-all duration-200 outline-none"
                                style={{
                                    background: focused === 'password' ? 'rgba(0,194,204,0.05)' : 'rgba(255,255,255,0.04)',
                                    border: focused === 'password' ? '1px solid rgba(0,194,204,0.4)' : '1px solid rgba(255,255,255,0.08)',
                                    color: 'var(--text-primary)',
                                    caretColor: '#00c2cc',
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer transition-colors duration-200"
                                style={{ color: 'var(--text-muted)' }}
                                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                            >
                                <span className="material-symbols-rounded text-base">
                                    {showPass ? 'visibility_off' : 'visibility'}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        id="login-submit"
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-2 w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            background: isSubmitting
                                ? 'rgba(0,194,204,0.5)'
                                : 'linear-gradient(135deg, #00c2cc 0%, #0099a8 100%)',
                            color: '#0a0d14',
                            boxShadow: isSubmitting ? 'none' : '0 4px 24px rgba(0,194,204,0.3)',
                        }}
                        onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.boxShadow = '0 4px 32px rgba(0,194,204,0.45)'; }}
                        onMouseLeave={e => { if (!isSubmitting) e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,194,204,0.3)'; }}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="material-symbols-rounded animate-spin text-base">sync</span>
                                <span>Authenticating…</span>
                            </>
                        ) : (
                            <>
                                <span>Sign In</span>
                                <span className="material-symbols-rounded text-base">arrow_forward</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Footer note */}
                <p className="mt-8 text-center text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    Session-based authentication · Cookies required
                </p>
            </div>
        </div>
    );
}
