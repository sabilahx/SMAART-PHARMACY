import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Pill, Activity, ShieldCheck, 
    CheckCircle2, Lock, User, Eye, EyeOff,
    TrendingUp, Database
} from 'lucide-react';

export default function Login() {
    const { login, isAuthenticated, error: authError, user } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [focused, setFocused] = useState(null);
    const [successRole, setSuccessRole] = useState('');

    useEffect(() => {
        if (isAuthenticated && user) {
            navigate(user.role === 'Pharmacist' ? '/medicines' : '/dashboard');
        }
    }, [isAuthenticated, user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');
        
        if (!username || !password) {
            setLocalError('Please fill in both fields.');
            return;
        }

        setIsSubmitting(true);

        const startTime = Date.now();
        const result = await login(username, password);
        const elapsed = Date.now() - startTime;
        const delay = Math.max(800 - elapsed, 0); // Artificial delay for smooth animation
        await new Promise(resolve => setTimeout(resolve, delay));

        if (result.success) {
            localStorage.setItem('justLoggedIn', 'true');
            const targetRole = result.user?.role || 'Pharmacist';
            setSuccessRole(targetRole);
            
            setTimeout(() => {
                navigate(targetRole === 'Pharmacist' ? '/medicines' : '/dashboard');
            }, 1000);
        } else {
            setIsSubmitting(false);
            setLocalError(result.message || 'Authentication failed. Please check your credentials.');
        }
    };

    const displayError = localError || authError;

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.8, staggerChildren: 0.1 } }
    };
    
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    return (
        <div className="min-h-screen w-full flex bg-canvas font-sans overflow-hidden">
            
            {/* ════════════════════════════════════════
                LEFT PANEL — Brand Story (Hero Section)
                ════════════════════════════════════════ */}
            <div className="hidden lg:flex w-1/2 bg-primary-gradient relative overflow-hidden flex-col justify-between p-12 xl:p-20 text-white shadow-2xl z-10 border-r border-navy-muted/20">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CgkJPHBhdGggZD0iTTAgMGg0MHY0MEgwVjB6bTIwIDIwYzAgMTEuMDQ2IDguOTU0IDIwIDIwIDIwVjIwSDIweiIgZmlsbD0iI2ZmZmZmZiIgZmlsbC1vcGFjaXR5PSIwLjAyIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz4KPC9zdmc+')] opacity-30" />
                    
                    {/* Floating Orbs */}
                    <motion.div 
                        animate={{ y: [0, -30, 0], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-brand-cyan rounded-full mix-blend-screen filter blur-[120px] opacity-30" 
                    />
                    <motion.div 
                        animate={{ y: [0, 30, 0], x: [0, 20, 0], opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-brand-dark rounded-full mix-blend-multiply filter blur-[100px] opacity-40" 
                    />

                    {/* Floating Icons */}
                    <motion.div 
                        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-[20%] right-[15%] text-white/10"
                    >
                        <Pill size={120} strokeWidth={1} />
                    </motion.div>
                    
                    <motion.div 
                        animate={{ y: [0, 25, 0], rotate: [0, -15, 0] }}
                        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                        className="absolute bottom-[30%] left-[10%] text-white/10"
                    >
                        <Activity size={150} strokeWidth={1} />
                    </motion.div>
                </div>

                {/* Top: Logo */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 flex items-center gap-4"
                >
                    <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-glow">
                        <Pill className="text-brand-cyan" size={24} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight font-outfit leading-none">SMAART</h2>
                        <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-brand-cyan mt-1 leading-none">Pharmacy</p>
                    </div>
                </motion.div>

                {/* Middle: Content */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative z-10 max-w-xl my-auto"
                >
                    <motion.h1 variants={itemVariants} className="text-5xl xl:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6 font-manrope">
                        Smarter Pharmacies.<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-emerald">Better Patient Care.</span>
                    </motion.h1>
                    <motion.p variants={itemVariants} className="text-lg text-white/80 mb-10 font-medium leading-relaxed max-w-md">
                        Real-time inventory intelligence, expiry monitoring, billing, analytics, and AI-powered operations—all in one premium platform.
                    </motion.p>

                    <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8">
                        {[
                            { text: "Multi-Branch Inventory", icon: <Database size={20} /> },
                            { text: "Expiry Intelligence", icon: <Activity size={20} /> },
                            { text: "Live Analytics", icon: <TrendingUp size={20} /> },
                            { text: "Compliance Ready", icon: <ShieldCheck size={20} /> },
                        ].map((feature, idx) => (
                            <motion.div key={idx} variants={itemVariants} className="flex items-center gap-3 text-white/95">
                                <div className="text-emerald">{feature.icon}</div>
                                <span className="font-semibold text-sm tracking-wide">{feature.text}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Bottom: Floating Status Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="relative z-10 w-full max-w-sm mt-auto"
                >
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-premium animate-float">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-2.5 w-2.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald"></span>
                                </span>
                                <span className="text-xs font-bold text-white tracking-widest uppercase">System Health: 99.9%</span>
                            </div>
                            <span className="text-[10px] font-semibold text-white/60">Updated 5s ago</span>
                        </div>
                        <div className="flex items-center gap-4 bg-navy/40 rounded-xl p-3 border border-white/10">
                            <CheckCircle2 className="text-emerald" size={24} />
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-white">All systems operational</span>
                                <span className="text-xs font-medium text-white/60">Inventory synced across branches</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* ════════════════════════════════════════
                RIGHT PANEL — Authentication Form
                ════════════════════════════════════════ */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-canvas">
                {/* Subtle Background Pattern for Right Side */}
                <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-50"></div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-[440px] relative z-10"
                >
                    <div className="bg-white/90 backdrop-blur-2xl rounded-3xl p-8 sm:p-12 shadow-premium border border-white transition-all duration-300">
                        
                        {/* Mobile Logo */}
                        <div className="lg:hidden flex justify-center mb-10">
                             <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-navy flex items-center justify-center shadow-lg">
                                    <Pill className="text-brand-cyan" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold tracking-tight font-outfit text-navy leading-none">SMAART</h2>
                                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand mt-1 leading-none">Pharmacy</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-10 text-center lg:text-left">
                            <h2 className="text-3xl font-extrabold text-navy font-manrope tracking-tight mb-3">Welcome Back</h2>
                            <p className="text-sm text-navy-muted font-medium">Sign in to continue to your workspace.</p>
                        </div>

                        <AnimatePresence>
                            {displayError && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0, y: -10 }}
                                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 shadow-sm"
                                >
                                    <ShieldCheck size={18} className="flex-shrink-0" />
                                    <span>{displayError}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Username Field */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-navy-muted ml-1">Username</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User size={18} className={`transition-colors duration-200 ${focused === 'username' ? 'text-brand' : 'text-slate-400'}`} />
                                    </div>
                                    <input
                                        type="text"
                                        autoComplete="username"
                                        placeholder="Enter your username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        onFocus={() => setFocused('username')}
                                        onBlur={() => setFocused(null)}
                                        className="w-full pl-11 pr-4 py-4 bg-canvas hover:bg-slate-50 focus:bg-white border-2 border-transparent focus:border-brand-dim rounded-2xl text-sm font-semibold text-navy transition-all duration-300 outline-none shadow-sm focus:shadow-glow placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-navy-muted ml-1">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock size={18} className={`transition-colors duration-200 ${focused === 'password' ? 'text-brand' : 'text-slate-400'}`} />
                                    </div>
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setFocused('password')}
                                        onBlur={() => setFocused(null)}
                                        className="w-full pl-11 pr-12 py-4 bg-canvas hover:bg-slate-50 focus:bg-white border-2 border-transparent focus:border-brand-dim rounded-2xl text-sm font-semibold text-navy transition-all duration-300 outline-none shadow-sm focus:shadow-glow placeholder:text-slate-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(!showPass)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-navy transition-colors duration-200 focus:outline-none"
                                    >
                                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Success Overlay / Message */}
                            <AnimatePresence>
                                {successRole && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-center text-sm font-bold text-brand bg-brand-dim py-3 rounded-xl border border-brand/20"
                                    >
                                        Authentication successful. Loading workspace...
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Submit Button */}
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isSubmitting || !!successRole}
                                className="w-full mt-8 py-4 bg-primary-gradient text-white rounded-2xl text-base font-extrabold shadow-premium hover:shadow-premium-hover transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed animate-breathe hover:animate-none"
                            >
                                {isSubmitting ? (
                                    <motion.div 
                                        animate={{ rotate: 360 }} 
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    >
                                        <Activity size={20} />
                                    </motion.div>
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <motion.span 
                                            className="inline-block"
                                            animate={{ x: [0, 4, 0] }}
                                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                        >
                                            →
                                        </motion.span>
                                    </>
                                )}
                            </motion.button>
                        </form>

                        {/* Security Note */}
                        <div className="mt-10 flex justify-center items-center gap-2 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                            <Lock size={12} />
                            <span>Session secured with encrypted authentication</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center text-xs font-semibold text-slate-400/80">
                        © {new Date().getFullYear()} SMAART Healthcare Systems Pvt. Ltd.
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
