import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
    Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
    PieChart, Pie, Cell
} from 'recharts';
import HealthScoreDrawer from '../components/HealthScoreDrawer';

export default function Dashboard() {
    const navigate = useNavigate();
    const { activeBranch, user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isHealthDrawerOpen, setIsHealthDrawerOpen] = useState(false);
    const [activeWatchlistTab, setActiveWatchlistTab] = useState('lowStock'); // 'lowStock' | 'expiring' | 'alerts'

    const fetchDashboard = async () => {
        setLoading(true);
        setError(null);
        try {
            const branchParam = (activeBranch && activeBranch.id && activeBranch.id !== 'all') 
                ? `?branchId=${activeBranch.id}` 
                : (user?.role === 'Admin' ? '?branchId=all' : '');
            const url = `/api/analytics/dashboard${branchParam}`;
            const res = await fetch(url);
            if (!res.ok) {
                if (res.status === 401) {
                    navigate('/login');
                    return;
                }
                const errJson = await res.json().catch(() => ({}));
                throw new Error(errJson.message || 'Failed to load dashboard metrics.');
            }
            setData(await res.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, [activeBranch]);

    if (loading) {
        return (
            <div className="flex flex-col gap-6 p-4 sm:p-6 animate-pulse">
                {/* Header Skeleton */}
                <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-2">
                        <div className="h-8 w-72 rounded-lg bg-[var(--card-border)]"></div>
                        <div className="h-5 w-96 rounded-md bg-[var(--card-border)]/60"></div>
                    </div>
                    <div className="h-10 w-48 rounded-xl bg-[var(--card-border)]"></div>
                </div>

                {/* 4 Cards Skeleton */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 rounded-2xl bg-[var(--card-border)]/50"></div>
                    ))}
                </div>

                {/* 2 Charts Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-7 h-80 rounded-2xl bg-[var(--card-border)]/40"></div>
                    <div className="lg:col-span-5 h-80 rounded-2xl bg-[var(--card-border)]/40"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px] p-6">
                <div className="text-red-400 font-medium bg-red-500/10 px-8 py-6 rounded-2xl border border-red-500/25 max-w-lg text-center flex flex-col items-center gap-3 shadow-xl">
                    <span className="material-symbols-rounded text-4xl text-red-400">error_outline</span>
                    <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">Unable to Load Metrics</h3>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)]">{error}</p>
                    <button 
                        onClick={fetchDashboard}
                        className="mt-2 px-5 py-2 bg-red-500/20 hover:bg-red-500/30 text-xs sm:text-sm font-bold text-red-300 rounded-xl transition-all cursor-pointer border border-red-500/30"
                    >
                        Retry Loading
                    </button>
                </div>
            </div>
        );
    }

    // Extract real data mapping
    const { 
        metrics = {}, 
        recentTransactions = [], 
        dailyMovements = [], 
        categoryData = [],
        lowStockAlerts = [],
        expiryAlerts = [],
        dbAlerts = [],
        briefing = []
    } = data || {};

    // Cohesive pharmacy intelligence palette
    const CATEGORY_COLORS = ['#00CFEA', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#64748B'];

    const todayDateStr = new Date().toLocaleDateString('en-GB', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });

    const healthScore = metrics.healthScore !== undefined ? metrics.healthScore : 100;
    const healthStatusColor = healthScore >= 90 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                              healthScore >= 70 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                              'text-red-400 bg-red-500/10 border-red-500/20';

    const branchDisplayName = (!activeBranch || activeBranch.id === 'all') 
        ? 'Overview Analytics (All Branches)' 
        : activeBranch.name;

    return (
        <div className="flex flex-col gap-6 p-3 sm:p-5 lg:p-7 bg-transparent min-h-screen font-sans text-[var(--text-primary)]">
            
            {/* ── TOP SECTION: WELCOME & EXECUTIVE HEADER ── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-3 border-b border-[var(--card-border)]">
                <div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-2xl sm:text-3xl font-playfair italic font-medium tracking-tight text-[var(--text-primary)]">
                            Welcome back, <span className="text-[var(--brand)] font-bold not-italic">{user?.fullName || user?.username || 'Administrator'}</span>
                        </h1>
                        <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[var(--brand-dim)] text-[var(--brand)] border border-[var(--brand)]/30 font-sans not-italic">
                            {user?.role || 'Pharmacist'}
                        </span>
                    </div>
                    <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1.5 font-medium leading-normal">
                        {briefing?.[0] ? briefing[0] : `Real-time intelligence and inventory operations for ${branchDisplayName}.`}
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap self-stretch md:self-auto justify-end">
                    {/* Interactive Health Score Pill */}
                    <button
                        onClick={() => setIsHealthDrawerOpen(true)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-bold cursor-pointer transition-all hover:scale-[1.02] shadow-sm ${healthStatusColor}`}
                        title="Click to view full health score breakdown"
                    >
                        <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: 'currentColor' }} />
                        <span>Health: {healthScore}%</span>
                        <span className="material-symbols-rounded text-base opacity-70">info</span>
                    </button>

                    {/* Current Date Chip */}
                    <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-xs sm:text-sm font-semibold text-[var(--text-secondary)] shadow-sm">
                        <span className="material-symbols-rounded text-lg text-[var(--brand)]">calendar_today</span>
                        <span>{todayDateStr}</span>
                    </div>
                </div>
            </div>

            {/* ── TOP SECTION: 4 KEY PHARMACY OVERVIEW METRICS ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                
                {/* 1. Active Medicines */}
                <div 
                    onClick={() => navigate('/medicines')}
                    className="premium-card p-5 rounded-2xl flex flex-col justify-between cursor-pointer group hover:border-blue-500/40 hover:shadow-lg transition-all"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Active Medicines</span>
                        <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center transition-transform group-hover:scale-110">
                            <span className="material-symbols-rounded text-xl">medication</span>
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
                            {metrics.activeChannels !== undefined ? metrics.activeChannels : 0}
                        </div>
                        <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)] mt-2 pt-2 border-t border-[var(--card-border)]/60">
                            <span className="truncate">₹{(metrics.totalValuation || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })} Valuation</span>
                            <span className="text-blue-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                                View <span className="material-symbols-rounded text-sm">chevron_right</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. Low Stock Items */}
                <div 
                    onClick={() => navigate('/reorder-intelligence')}
                    className="premium-card p-5 rounded-2xl flex flex-col justify-between cursor-pointer group hover:border-amber-500/40 hover:shadow-lg transition-all"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Low Stock Items</span>
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center transition-transform group-hover:scale-110">
                            <span className="material-symbols-rounded text-xl">warning</span>
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
                            {metrics.lowStock !== undefined ? metrics.lowStock : 0}
                        </div>
                        <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)] mt-2 pt-2 border-t border-[var(--card-border)]/60">
                            <span className={metrics.lowStock > 0 ? "text-amber-400 font-bold" : "text-[var(--text-secondary)]"}>
                                {metrics.lowStock > 0 ? 'Under safety limit' : 'Adequate stock'}
                            </span>
                            <span className="text-amber-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                                Reorder <span className="material-symbols-rounded text-sm">chevron_right</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3. Out of Stock */}
                <div 
                    onClick={() => navigate('/medicines')}
                    className="premium-card p-5 rounded-2xl flex flex-col justify-between cursor-pointer group hover:border-red-500/40 hover:shadow-lg transition-all"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Out of Stock</span>
                        <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center transition-transform group-hover:scale-110">
                            <span className="material-symbols-rounded text-xl">error</span>
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
                            {metrics.outOfStock !== undefined ? metrics.outOfStock : 0}
                        </div>
                        <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)] mt-2 pt-2 border-t border-[var(--card-border)]/60">
                            <span className={metrics.outOfStock > 0 ? "text-red-400 font-bold" : "text-[var(--text-secondary)]"}>
                                {metrics.outOfStock > 0 ? 'Immediate shortage' : 'Zero deficits'}
                            </span>
                            <span className="text-red-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                                Review <span className="material-symbols-rounded text-sm">chevron_right</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* 4. Expiring Soon */}
                <div 
                    onClick={() => navigate('/expiry-dashboard')}
                    className="premium-card p-5 rounded-2xl flex flex-col justify-between cursor-pointer group hover:border-purple-500/40 hover:shadow-lg transition-all"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Expiring Soon</span>
                        <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center transition-transform group-hover:scale-110">
                            <span className="material-symbols-rounded text-xl">hourglass_empty</span>
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
                            {metrics.nearExpiry !== undefined ? metrics.nearExpiry : 0}
                        </div>
                        <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)] mt-2 pt-2 border-t border-[var(--card-border)]/60">
                            <span className="truncate text-purple-400 font-bold">Within 30 days</span>
                            <span className="text-purple-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                                Action <span className="material-symbols-rounded text-sm">chevron_right</span>
                            </span>
                        </div>
                    </div>
                </div>

            </div>

            {/* ── MIDDLE SECTION: ANALYTICS VISUALIZATIONS ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 1. Daily Stock Movements Chart (7 Columns) */}
                <div className="lg:col-span-7 premium-card p-6 rounded-2xl flex flex-col justify-between">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
                        <div>
                            <h3 className="font-playfair italic font-bold text-lg sm:text-xl text-[var(--text-primary)]">Daily Stock Movements</h3>
                            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5 font-normal">Stock In vs. Stock Out (Last 7 Days)</p>
                        </div>
                        
                        {/* Clean Legend Indicator */}
                        <div className="flex items-center gap-5 text-xs sm:text-sm font-medium">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                <span className="text-[var(--text-secondary)]">Stock In</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                                <span className="text-[var(--text-secondary)]">Stock Out</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[250px] w-full mt-auto">
                        {dailyMovements && dailyMovements.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dailyMovements} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="stockInGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                                        </linearGradient>
                                        <linearGradient id="stockOutGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--card-border)" />
                                    <XAxis 
                                        dataKey="label" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 12, fill: 'var(--text-secondary)', fontWeight: 600 }} 
                                        dy={8} 
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 12, fill: 'var(--text-secondary)', fontWeight: 600 }} 
                                    />
                                    <RechartsTooltip 
                                        contentStyle={{ 
                                            backgroundColor: 'var(--card-bg)', 
                                            borderRadius: '12px', 
                                            border: '1px solid var(--card-border)', 
                                            boxShadow: '0 8px 24px rgba(0,0,0,0.5)', 
                                            fontSize: '13px', 
                                            fontWeight: '700', 
                                            color: 'var(--text-primary)' 
                                        }} 
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="stockIn" 
                                        name="Stock In" 
                                        stroke="#10b981" 
                                        strokeWidth={2.5} 
                                        fillOpacity={1} 
                                        fill="url(#stockInGrad)" 
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="stockOut" 
                                        name="Stock Out" 
                                        stroke="#f59e0b" 
                                        strokeWidth={2.5} 
                                        fillOpacity={1} 
                                        fill="url(#stockOutGrad)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-[var(--text-secondary)] text-sm font-semibold bg-[var(--bg-secondary)] rounded-xl border border-dashed border-[var(--card-border)]">
                                No stock movement records available for the last 7 days.
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Medicines by Category Donut (5 Columns) */}
                <div className="lg:col-span-5 premium-card p-6 rounded-2xl flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-3">
                        <div>
                            <h3 className="font-playfair italic font-bold text-lg sm:text-xl text-[var(--text-primary)]">Medicines by Category</h3>
                            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5 font-normal">Distribution across inventory classes</p>
                        </div>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-[var(--card-border)]/50 text-[var(--text-secondary)]">
                            {categoryData.length} classes
                        </span>
                    </div>

                    {categoryData && categoryData.length > 0 ? (
                        <div className="flex flex-col sm:flex-row items-center gap-4 h-[250px]">
                            {/* Donut Chart */}
                            <div className="w-full sm:w-1/2 h-[170px] sm:h-full relative flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={52}
                                            outerRadius={78}
                                            paddingAngle={4}
                                            dataKey="count"
                                            stroke="none"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip 
                                            contentStyle={{ 
                                                backgroundColor: 'var(--card-bg)', 
                                                borderRadius: '12px', 
                                                border: '1px solid var(--card-border)', 
                                                fontSize: '13px', 
                                                fontWeight: '700' 
                                            }} 
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-xs text-[var(--text-secondary)] font-bold uppercase">Total SKUs</span>
                                    <span className="text-xl font-extrabold text-[var(--text-primary)]">
                                        {categoryData.reduce((acc, curr) => acc + (curr.count || 0), 0)}
                                    </span>
                                </div>
                            </div>

                            {/* Category Legends List */}
                            <div className="w-full sm:w-1/2 flex flex-col gap-2 max-h-[220px] overflow-y-auto scrollable pr-1">
                                {categoryData.map((item, idx) => (
                                    <div 
                                        key={idx} 
                                        className="flex items-center justify-between text-xs sm:text-sm px-2.5 py-1.5 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors border border-transparent hover:border-[var(--card-border)]"
                                    >
                                        <div className="flex items-center gap-2.5 truncate pr-2">
                                            <span 
                                                className="w-3 h-3 rounded-full flex-shrink-0" 
                                                style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }} 
                                            />
                                            <span className="text-[var(--text-secondary)] font-semibold truncate">
                                                {item.category || 'General'}
                                            </span>
                                        </div>
                                        <span className="font-extrabold text-[var(--text-primary)] flex-shrink-0">
                                            {item.count}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-[250px] text-[var(--text-secondary)] text-sm font-semibold bg-[var(--bg-secondary)] rounded-xl border border-dashed border-[var(--card-border)]">
                            No category classifications found.
                        </div>
                    )}
                </div>

            </div>

            {/* ── LOWER SECTION: OPERATIONAL INSIGHTS & REAL-TIME LEDGERS ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 1. Recent Stock Movements Table (7 Columns) */}
                <div className="lg:col-span-7 premium-card p-6 rounded-2xl flex flex-col">
                    <div className="flex justify-between items-center pb-3 border-b border-[var(--card-border)]">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-[var(--brand-dim)] text-[var(--brand)] flex items-center justify-center">
                                <span className="material-symbols-rounded text-lg">swap_horiz</span>
                            </div>
                            <div>
                                <h3 className="font-playfair italic font-bold text-lg sm:text-xl text-[var(--text-primary)]">Recent Stock Movements</h3>
                                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-normal">Live dispensing and replenishment transactions</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => navigate('/inventory/history')}
                            className="text-xs sm:text-sm font-bold text-[var(--brand)] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                            Complete Audit <span className="material-symbols-rounded text-base">arrow_forward</span>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto mt-3.5 flex flex-col gap-2.5 max-h-[340px] scrollable pr-1">
                        {recentTransactions && recentTransactions.length > 0 ? (
                            recentTransactions.slice(0, 6).map((tx, idx) => {
                                const isStockIn = tx.transactionType === 'Stock In';
                                const medicineName = tx.medicineId?.name || 'Catalog Medicine';
                                const operatorName = tx.userId?.username || 'Pharmacist';

                                return (
                                    <div 
                                        key={idx}
                                        className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--card-border)] hover:border-[var(--brand)]/40 transition-all text-xs sm:text-sm overflow-hidden"
                                    >
                                        <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold ${
                                                isStockIn 
                                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                            }`}>
                                                <span className="material-symbols-rounded text-lg">
                                                    {isStockIn ? 'arrow_downward' : 'arrow_upward'}
                                                </span>
                                            </div>
                                            <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                                                <span className="font-semibold text-[var(--text-primary)] truncate text-sm sm:text-base block">
                                                    {medicineName}
                                                </span>
                                                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] font-normal mt-0.5 truncate">
                                                    <span className="font-medium text-[var(--brand)] flex-shrink-0">{tx.transactionType}</span>
                                                    <span>•</span>
                                                    <span className="truncate">by {operatorName}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end flex-shrink-0 whitespace-nowrap ml-auto gap-0.5">
                                            <span className={`font-bold text-sm sm:text-base ${
                                                isStockIn ? 'text-emerald-400' : 'text-amber-400'
                                            }`}>
                                                {isStockIn ? '+' : '-'}{Math.abs(tx.quantityChanged || 0)} units
                                            </span>
                                            <span className="text-[11px] text-[var(--text-secondary)] font-normal">
                                                {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex items-center justify-center h-48 text-[var(--text-secondary)] text-sm font-semibold bg-[var(--bg-secondary)] rounded-xl border border-dashed border-[var(--card-border)]">
                                No stock transaction records available.
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Priority Watchlist & Action Cards (5 Columns) */}
                <div className="lg:col-span-5 premium-card p-6 rounded-2xl flex flex-col">
                    {/* Tab Navigation */}
                    <div className="flex items-center justify-between pb-3 border-b border-[var(--card-border)] gap-2">
                        <div className="flex items-center gap-1.5 bg-[var(--bg-secondary)] p-1.5 rounded-xl border border-[var(--card-border)] text-xs sm:text-sm">
                            <button
                                onClick={() => setActiveWatchlistTab('lowStock')}
                                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                                    activeWatchlistTab === 'lowStock'
                                        ? 'bg-[var(--card-bg)] text-[var(--brand)] shadow-sm'
                                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                }`}
                            >
                                Low Stock ({lowStockAlerts.length})
                            </button>
                            <button
                                onClick={() => setActiveWatchlistTab('expiring')}
                                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                                    activeWatchlistTab === 'expiring'
                                        ? 'bg-[var(--card-bg)] text-purple-400 shadow-sm'
                                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                }`}
                            >
                                Expiring ({expiryAlerts.length})
                            </button>
                            {dbAlerts.length > 0 && (
                                <button
                                    onClick={() => setActiveWatchlistTab('alerts')}
                                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                                        activeWatchlistTab === 'alerts'
                                            ? 'bg-[var(--card-bg)] text-red-400 shadow-sm'
                                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                    }`}
                                >
                                    Alerts ({dbAlerts.length})
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto mt-3.5 flex flex-col gap-2.5 max-h-[340px] scrollable pr-1">
                        
                        {/* TAB 1: Low Stock Items */}
                        {activeWatchlistTab === 'lowStock' && (
                            lowStockAlerts.length > 0 ? (
                                lowStockAlerts.slice(0, 5).map((med, idx) => (
                                    <div 
                                        key={idx}
                                        className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--card-border)] hover:border-amber-500/40 transition-all text-xs sm:text-sm overflow-hidden"
                                    >
                                        <div className="flex-1 min-w-0 flex flex-col pr-1 overflow-hidden">
                                            <span className="font-semibold text-[var(--text-primary)] truncate text-sm sm:text-base block">
                                                {med.name}
                                            </span>
                                            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-medium mt-1 truncate">
                                                <span className="uppercase truncate max-w-[110px] sm:max-w-[140px] text-[11px] font-semibold">
                                                    {med.category || 'General'}
                                                </span>
                                                <span className="opacity-40">•</span>
                                                <span className="text-amber-400 font-semibold whitespace-nowrap text-[11px] flex-shrink-0">
                                                    Min: {med.reorderPoint || 20}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 flex-shrink-0 whitespace-nowrap ml-auto">
                                            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold text-xs whitespace-nowrap flex-shrink-0">
                                                {med.stock} left
                                            </span>
                                            <button 
                                                onClick={() => navigate('/reorder-intelligence')}
                                                className="px-3 py-1.5 rounded-lg bg-[var(--brand)]/10 hover:bg-[var(--brand)] text-[var(--brand)] hover:text-[var(--bg-primary)] font-semibold text-xs border border-[var(--brand)]/20 transition-all cursor-pointer whitespace-nowrap flex-shrink-0"
                                            >
                                                Order
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex items-center justify-center h-48 text-[var(--text-secondary)] text-sm font-semibold bg-[var(--bg-secondary)] rounded-xl border border-dashed border-[var(--card-border)]">
                                    All medicines meet safety stock requirements.
                                </div>
                            )
                        )}

                        {/* TAB 2: Expiring Soon */}
                        {activeWatchlistTab === 'expiring' && (
                            expiryAlerts.length > 0 ? (
                                expiryAlerts.slice(0, 5).map((med, idx) => (
                                    <div 
                                        key={idx}
                                        className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--card-border)] hover:border-purple-500/40 transition-all text-xs sm:text-sm overflow-hidden"
                                    >
                                        <div className="flex-1 min-w-0 flex flex-col pr-1 overflow-hidden">
                                            <span className="font-semibold text-[var(--text-primary)] truncate text-sm sm:text-base block">
                                                {med.name}
                                            </span>
                                            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-medium mt-1 truncate">
                                                <span className="text-[11px] whitespace-nowrap">Stock: {med.stock}</span>
                                                <span className="opacity-40">•</span>
                                                <span className="text-purple-400 font-semibold text-[11px] truncate whitespace-nowrap">
                                                    EXP: {med.expiryDate ? new Date(med.expiryDate).toLocaleDateString() : 'Near'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 flex-shrink-0 whitespace-nowrap ml-auto">
                                            <button 
                                                onClick={() => navigate('/expiry-dashboard')}
                                                className="px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500 text-purple-400 hover:text-white font-semibold text-xs border border-purple-500/20 transition-all cursor-pointer whitespace-nowrap flex-shrink-0"
                                            >
                                                Review
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex items-center justify-center h-48 text-[var(--text-secondary)] text-sm font-semibold bg-[var(--bg-secondary)] rounded-xl border border-dashed border-[var(--card-border)]">
                                    No medicines expiring within the next 30 days.
                                </div>
                            )
                        )}

                        {/* TAB 3: System Alerts */}
                        {activeWatchlistTab === 'alerts' && (
                            dbAlerts.length > 0 ? (
                                dbAlerts.slice(0, 5).map((alert, idx) => (
                                    <div 
                                        key={idx}
                                        className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--card-border)] text-xs sm:text-sm"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-[var(--text-primary)] text-sm">{alert.title}</span>
                                            <span className={`text-xs uppercase px-2 py-0.5 rounded-md font-extrabold ${
                                                alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                                            }`}>
                                                {alert.severity}
                                            </span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">{alert.message}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="flex items-center justify-center h-48 text-[var(--text-secondary)] text-sm font-semibold bg-[var(--bg-secondary)] rounded-xl border border-dashed border-[var(--card-border)]">
                                    No active system warnings.
                                </div>
                            )
                        )}

                    </div>
                </div>

            </div>

            {/* ── INTERACTIVE HEALTH SCORE DRAWER ── */}
            <HealthScoreDrawer 
                isOpen={isHealthDrawerOpen} 
                onClose={() => setIsHealthDrawerOpen(false)} 
                branchId={activeBranch?.id !== 'all' ? activeBranch?.id : undefined} 
            />

        </div>
    );
}
