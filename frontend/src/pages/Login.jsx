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
        <div className="flex min-h-screen w-screen items-center justify-center bg-gradient-to-tr from-teal-50/50 via-slate-50 to-slate-50 px-4">
            <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl relative overflow-hidden">
                {/* Visual Glow */}
                <div className="absolute -top-12 -right-12 w-36 h-36 bg-teal-500/5 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100/50 flex items-center justify-center mb-4 text-teal-600 shadow-sm shadow-teal-500/5">
                        <span className="material-symbols-rounded text-2xl drop-shadow-[0_0_4px_rgba(13,148,136,0.1)]">bubble_chart</span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-800 font-title tracking-tight">Pharmacy Intelligence</h2>
                    <p className="text-xs text-slate-400 mt-1">Sign in to access your pharmacy store ledger</p>
                </div>

                {/* Error Banner */}
                {(localError || authError) && (
                    <div className="mb-6 flex items-start gap-3 p-3.5 bg-red-50 border border-red-150/40 rounded-xl text-xs text-red-600">
                        <span className="material-symbols-rounded text-sm mt-0.5">report</span>
                        <span>{localError || authError}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600 ml-1">Username</label>
                        <div className="relative">
                            <span className="material-symbols-rounded absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">person</span>
                            <input 
                                type="text"
                                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:bg-white transition-all shadow-inner shadow-slate-100"
                                placeholder="Enter username..."
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600 ml-1">Password</label>
                        <div className="relative">
                            <span className="material-symbols-rounded absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">lock</span>
                            <input 
                                type="password"
                                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:bg-white transition-all shadow-inner shadow-slate-100"
                                placeholder="Enter password..."
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-teal-600 text-white font-bold text-xs rounded-xl hover:bg-teal-500 active:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-teal-500/10 hover:shadow-teal-500/20 transition-all mt-2 cursor-pointer flex items-center justify-center gap-2"
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
                <div className="mt-8 border-t border-slate-100 pt-6 text-center">
                    <span className="text-[10px] text-slate-400 leading-relaxed block">
                        Authentication is session-based. Make sure cookies are enabled in your browser parameters.
                    </span>
                </div>
            </div>
        </div>
    );
}
