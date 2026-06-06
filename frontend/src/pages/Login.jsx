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

    // Redirect to home if already logged in
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/medicines');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');
        if (!username || !password) {
            setLocalError('Please fill in both fields');
            return;
        }

        setIsSubmitting(true);
        const result = await login(username, password);
        setIsSubmitting(false);

        if (result.success) {
            navigate('/medicines');
        } else {
            setLocalError(result.message || 'Login failed. Please try again.');
        }
    };

    return (
        <div className="flex min-h-screen w-screen items-center justify-center bg-slate-950 px-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl relative overflow-hidden">
                {/* Visual Glow */}
                <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 rounded-xl bg-emerald-950/50 border border-emerald-500/20 flex items-center justify-center mb-3 text-emerald-400">
                        <span className="material-symbols-rounded text-2xl drop-shadow-[0_0_6px_rgba(52,211,153,0.3)]">bubble_chart</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-100 font-title tracking-tight">Pharmacy Intelligence</h2>
                    <p className="text-xs text-slate-400 mt-1">Sign in to access your pharmacy store ledger</p>
                </div>

                {/* Error Banner */}
                {(localError || authError) && (
                    <div className="mb-6 flex items-start gap-3 p-3 bg-red-950/40 border border-red-900/30 rounded-lg text-xs text-red-400">
                        <span className="material-symbols-rounded text-sm mt-0.5">report</span>
                        <span>{localError || authError}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-300">Username</label>
                        <div className="relative">
                            <span className="material-symbols-rounded absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">person</span>
                            <input 
                                type="text"
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                                placeholder="Enter username..."
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-300">Password</label>
                        <div className="relative">
                            <span className="material-symbols-rounded absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">lock</span>
                            <input 
                                type="password"
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                                placeholder="Enter password..."
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2.5 bg-emerald-500 text-slate-950 font-semibold text-sm rounded-lg hover:bg-emerald-400 active:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2 cursor-pointer flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <span className="material-symbols-rounded animate-spin text-sm">sync</span>
                                <span>Authenticating...</span>
                            </>
                        ) : (
                            <span>Login to Platform</span>
                        )}
                    </button>
                </form>

                {/* Info Note */}
                <div className="mt-8 border-t border-slate-800 pt-6 text-center">
                    <span className="text-[10px] text-slate-500 leading-relaxed block">
                        Authentication is session-based. Make sure cookies are enabled in your browser parameters.
                    </span>
                </div>
            </div>
        </div>
    );
}
