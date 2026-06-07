import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CAT_COLORS = {
    Cardiovascular: '#f87171', 'Anti-infective': '#34d399', Endocrine: '#60a5fa',
    Emergency: '#f59e0b', Analgesic: '#a78bfa', Neurological: '#e879f9',
    Gastrointestinal: '#22d3ee', General: '#00c2cc',
};
const CAT_ICONS = {
    Cardiovascular: 'favorite', 'Anti-infective': 'coronavirus', Endocrine: 'opacity',
    Emergency: 'emergency', Analgesic: 'healing', Neurological: 'psychology',
    Gastrointestinal: 'bubble_chart', General: 'medication',
};

export default function Dashboard() {
    const navigate = useNavigate();
    const { activeBranch } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hoveredBar, setHoveredBar] = useState(null);

    const fetchDashboard = async () => {
        setLoading(true);
        setError(null);
        try {
            const url = activeBranch ? `/api/analytics/dashboard?branchId=${activeBranch.id}` : '/api/analytics/dashboard';
            const res = await fetch(url);
            if (!res.ok) {
                if (res.status === 401) {
                    navigate('/login');
                    return;
                }
                throw new Error('Failed to load dashboard metrics.');
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
            <div className="flex flex-col items-center justify-center py-44 gap-3" style={{ color: 'var(--text-muted)' }}>
                <span className="material-symbols-rounded animate-spin text-3xl" style={{ color: '#00c2cc' }}>sync</span>
                <span className="text-sm">Assembling intelligence metrics…</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4 max-w-md mx-auto text-center">
                <span className="material-symbols-rounded text-5xl text-red-400">error</span>
                <div>
                    <h3 className="text-lg font-bold text-white font-serif">Aggregation Fault</h3>
                    <p className="text-xs mt-1 text-slate-400">{error}</p>
                </div>
                <button onClick={fetchDashboard} className="px-5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all duration-200"
                    style={{ background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.15)', color: '#fca5a5' }}>
                    Retry Query
                </button>
            </div>
        );
    }

    const { metrics, expiryAlerts, lowStockAlerts, recentTransactions, categoryData, dailyMovements, dbAlerts, briefing } = data;

    // Calculate maximum movement volume for chart scaling
    const maxMovement = Math.max(
        ...dailyMovements.map(d => Math.max(d.stockIn, d.stockOut, 10)),
        100
    );

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto animate-fade-in relative z-10 pb-12">
            
            {/* ── Dashboard Hero Header ── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--text-muted)' }}>
                        Operational Intelligence
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-none" style={{ fontFamily: "'Lora', serif" }}>
                        Pharmacy <span className="text-sky-400">Overview</span>
                    </h2>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        Real-time ledger value, category spreads, and expiry indicators.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => navigate('/medicines/add')}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer text-slate-900"
                        style={{ background: 'linear-gradient(135deg, #00c2cc 0%, #0099a8 100%)' }}>
                        <span className="material-symbols-rounded text-sm">add</span>
                        <span>Add Med</span>
                    </button>
                    <button onClick={() => navigate('/inventory/transaction-new')}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer bg-white/[0.03] border border-white/[0.06] text-white/80 hover:text-white hover:bg-white/[0.06]">
                        <span className="material-symbols-rounded text-sm">swap_horiz</span>
                        <span>Post Movement</span>
                    </button>
                </div>
            </div>

            {/* ── Today's Briefing Widget ── */}
            {briefing && briefing.length > 0 && (
                <div className="relative rounded-xl p-4 overflow-hidden glass border border-[#00c2cc]/15 shadow-lg shadow-[#00c2cc]/5">
                    {/* Glowing highlight */}
                    <div className="absolute -left-16 -top-16 w-32 h-32 rounded-full bg-[#00c2cc]/10 pointer-events-none filter blur-xl" />
                    
                    <div className="flex items-start gap-3 relative z-10">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#00c2cc]/10 text-[#00c2cc]">
                            <span className="material-symbols-rounded text-sm">auto_awesome</span>
                        </div>
                        <div className="flex-1 flex flex-col gap-1.5">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-sky-400 leading-none">Today's Executive Briefing</h4>
                            <ul className="flex flex-col gap-1 text-[11px] text-slate-300 list-none font-medium">
                                {briefing.map((line, idx) => (
                                    <li key={idx} className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#00c2cc]" />
                                        <span>{line}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Operational KPIs Grid ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Total Valuation */}
                <div className="rounded-lg p-4 flex flex-col gap-2 relative overflow-hidden backdrop-blur-md"
                    style={{ background: 'rgba(15,20,32,0.3)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none rounded-full"
                        style={{ background: 'radial-gradient(circle, rgba(0, 194, 204, 0.03) 0%, transparent 70%)', filter: 'blur(15px)' }} />
                    <div className="w-8 h-8 rounded-md flex items-center justify-center bg-[#00c2cc]/[0.04] text-[#00c2cc]">
                        <span className="material-symbols-rounded text-base">payments</span>
                    </div>
                    <div className="flex flex-col mt-1">
                        <span className="text-2xl md:text-3xl font-extrabold text-white tracking-tight" style={{ fontFamily: "'Lora', serif" }}>
                            ₹{metrics.totalValuation.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.08em] mt-0.5" style={{ color: 'var(--text-secondary)' }}>Inventory Valuation</span>
                    </div>
                </div>

                {/* Inventory Health Score */}
                <div className="rounded-lg p-4 flex items-center justify-between relative overflow-hidden backdrop-blur-md"
                    style={{ background: 'rgba(15,20,32,0.3)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div className="flex flex-col">
                        <span className="text-2xl md:text-3xl font-extrabold text-white tracking-tight" style={{ fontFamily: "'Lora', serif" }}>
                            {metrics.healthScore || 0}%
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.08em] mt-0.5" style={{ color: 'var(--text-secondary)' }}>Branch Health Score</span>
                    </div>
                    {/* SVG Circle Gauge */}
                    <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,0.03)" strokeWidth="3" fill="transparent" />
                            <circle cx="24" cy="24" r="20" 
                                stroke={
                                    (metrics.healthScore || 0) >= 90 ? '#10b981' : 
                                    (metrics.healthScore || 0) >= 75 ? '#f59e0b' : '#ef4444'
                                } 
                                strokeWidth="3" fill="transparent"
                                strokeDasharray={2 * Math.PI * 20} 
                                strokeDashoffset={2 * Math.PI * 20 - ((metrics.healthScore || 0) / 100) * 2 * Math.PI * 20} 
                                strokeLinecap="round"
                                className="transition-all duration-500 ease-out" />
                        </svg>
                        <span className="absolute text-[10px] font-black text-white">{(metrics.healthScore || 0)}</span>
                    </div>
                </div>

                {/* Dead Stock Counter */}
                <div className="rounded-lg p-4 flex flex-col gap-2 relative overflow-hidden backdrop-blur-md"
                    style={{ background: 'rgba(15,20,32,0.3)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div className="w-8 h-8 rounded-md flex items-center justify-center bg-red-400/[0.04] text-red-400">
                        <span className="material-symbols-rounded text-base">event_busy</span>
                    </div>
                    <div className="flex flex-col mt-1">
                        <span className="text-2xl md:text-3xl font-extrabold text-red-400 tracking-tight" style={{ fontFamily: "'Lora', serif" }}>
                            ₹{(metrics.deadStockValue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </span>
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.08em] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                            <span>Dead Stock Counter</span>
                            {metrics.atRiskValue > 0 && (
                                <span className="text-[8px] text-amber-400 font-extrabold pl-1 select-none">
                                    (₹{metrics.atRiskValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })} risk)
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Catalog Channels */}
                <div className="rounded-lg p-4 flex flex-col gap-2 relative overflow-hidden backdrop-blur-md"
                    style={{ background: 'rgba(15,20,32,0.3)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none rounded-full"
                        style={{ background: 'radial-gradient(circle, rgba(96, 165, 250, 0.03) 0%, transparent 70%)', filter: 'blur(15px)' }} />
                    <div className="w-8 h-8 rounded-md flex items-center justify-center bg-blue-400/[0.04] text-blue-400">
                        <span className="material-symbols-rounded text-base">medication</span>
                    </div>
                    <div className="flex flex-col mt-1">
                        <span className="text-2xl md:text-3xl font-extrabold text-white tracking-tight" style={{ fontFamily: "'Lora', serif" }}>
                            {metrics.activeChannels}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.08em] mt-0.5" style={{ color: 'var(--text-secondary)' }}>Catalog Channels</span>
                    </div>
                </div>
            </div>

            {/* ── Analytics Visual Graphs ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                
                {/* Daily Stock Movements SVG Chart */}
                <div className="lg:col-span-8 rounded-lg p-5 flex flex-col gap-4 backdrop-blur-md"
                    style={{ background: 'rgba(15,20,32,0.3)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div className="flex justify-between items-center">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>Transaction Activity</span>
                            <h3 className="text-base font-bold text-white font-serif">Daily Stock Movements (Units)</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-sm bg-[#34d399]" />
                                <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Inbound</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-sm bg-[#60a5fa]" />
                                <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Outbound</span>
                            </div>
                        </div>
                    </div>

                    {/* SVG Chart Area */}
                    <div className="relative w-full h-56 pt-2">
                        <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                            {/* Horizontal grid lines */}
                            {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
                                const y = 10 + p * 150;
                                const labelVal = Math.round(maxMovement * (1 - p));
                                return (
                                    <g key={i}>
                                        <line x1="45" y1={y} x2="590" y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                                        <text x="5" y={y + 4} fill="var(--text-muted)" fontSize="9" className="font-mono">
                                            {labelVal.toLocaleString()}
                                        </text>
                                    </g>
                                );
                            })}

                            {/* Draw Bars */}
                            {dailyMovements.map((day, idx) => {
                                const w = 600 - 45;
                                const colWidth = w / 7;
                                const colX = 45 + idx * colWidth;
                                const centerX = colX + colWidth / 2;

                                const inHeight = (day.stockIn / maxMovement) * 150;
                                const outHeight = (day.stockOut / maxMovement) * 150;

                                const inY = 160 - inHeight;
                                const outY = 160 - outHeight;

                                const barWidth = 10;
                                const padding = 2;

                                return (
                                    <g key={day.date}>
                                        {/* Grid vertical label lines */}
                                        <line x1={centerX} y1="10" x2={centerX} y2="160" stroke="rgba(255,255,255,0.01)" strokeWidth="1" />

                                        {/* Inbound Bar */}
                                        <rect
                                            x={centerX - barWidth - padding}
                                            y={inY}
                                            width={barWidth}
                                            height={Math.max(inHeight, 1)}
                                            rx="2"
                                            fill="#34d399"
                                            opacity={hoveredBar === `${idx}-in` ? '1' : '0.75'}
                                            className="transition-all duration-200 cursor-pointer"
                                            onMouseEnter={() => setHoveredBar(`${idx}-in`)}
                                            onMouseLeave={() => setHoveredBar(null)}
                                        />

                                        {/* Outbound Bar */}
                                        <rect
                                            x={centerX + padding}
                                            y={outY}
                                            width={barWidth}
                                            height={Math.max(outHeight, 1)}
                                            rx="2"
                                            fill="#60a5fa"
                                            opacity={hoveredBar === `${idx}-out` ? '1' : '0.75'}
                                            className="transition-all duration-200 cursor-pointer"
                                            onMouseEnter={() => setHoveredBar(`${idx}-out`)}
                                            onMouseLeave={() => setHoveredBar(null)}
                                        />

                                        {/* X-axis date labels */}
                                        <text x={centerX} y="180" fill="var(--text-muted)" fontSize="9" textAnchor="middle" fontWeight="bold">
                                            {day.label}
                                        </text>

                                        {/* Hover Tooltips */}
                                        {hoveredBar === `${idx}-in` && (
                                            <g>
                                                <rect x={centerX - 45} y={inY - 25} width={90} height={20} rx="4" fill="rgba(8,10,16,0.9)" stroke="rgba(52,211,153,0.3)" strokeWidth="1" />
                                                <text x={centerX} y={inY - 12} fill="#34d399" fontSize="9" textAnchor="middle" fontWeight="bold">
                                                    +{day.stockIn.toLocaleString()} units
                                                </text>
                                            </g>
                                        )}
                                        {hoveredBar === `${idx}-out` && (
                                            <g>
                                                <rect x={centerX - 45} y={outY - 25} width={90} height={20} rx="4" fill="rgba(8,10,16,0.9)" stroke="rgba(96,165,250,0.3)" strokeWidth="1" />
                                                <text x={centerX} y={outY - 12} fill="#60a5fa" fontSize="9" textAnchor="middle" fontWeight="bold">
                                                    -{day.stockOut.toLocaleString()} units
                                                </text>
                                            </g>
                                        )}
                                    </g>
                                );
                            })}
                            
                            {/* X-axis line */}
                            <line x1="45" y1="160" x2="590" y2="160" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                        </svg>
                    </div>
                </div>

                {/* Category Valuation Spread */}
                <div className="lg:col-span-4 rounded-lg p-5 flex flex-col gap-4 backdrop-blur-md"
                    style={{ background: 'rgba(15,20,32,0.3)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>Portfolio Distribution</span>
                        <h3 className="text-base font-bold text-white font-serif">Valuation by Category</h3>
                    </div>

                    {/* Progress bars list */}
                    <div className="flex flex-col gap-4 flex-1 justify-center pt-2">
                        {categoryData.length === 0 ? (
                            <span className="text-xs text-center block" style={{ color: 'var(--text-muted)' }}>No catalog items registered.</span>
                        ) : (
                            categoryData
                                .sort((a, b) => b.valuation - a.valuation)
                                .slice(0, 5)
                                .map(cat => {
                                    const percent = metrics.totalValuation > 0 
                                        ? (cat.valuation / metrics.totalValuation) * 100 
                                        : 0;
                                    const color = CAT_COLORS[cat.category] || '#00c2cc';
                                    const icon = CAT_ICONS[cat.category] || 'medication';

                                    return (
                                        <div key={cat.category} className="flex flex-col gap-1.5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="material-symbols-rounded text-sm" style={{ color }}>{icon}</span>
                                                    <span className="text-xs font-semibold text-white">{cat.category}</span>
                                                </div>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-xs font-extrabold text-white">
                                                        ₹{cat.valuation.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                                    </span>
                                                    <span className="text-[8px] font-bold" style={{ color: 'var(--text-muted)' }}>
                                                        ({percent.toFixed(0)}%)
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="w-full h-1.5 rounded-full bg-white/[0.02] overflow-hidden">
                                                <div className="h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${percent}%`, background: color }} />
                                            </div>
                                        </div>
                                    );
                                })
                        )}
                    </div>
                </div>
            </div>

            {/* ── Operational Warnings & Audit lists ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* Expiry Alerts list widget */}
                <div className="rounded-lg p-5 flex flex-col gap-4 backdrop-blur-md h-[340px]"
                    style={{ background: 'rgba(15,20,32,0.3)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                        <div className="flex items-center gap-1.5">
                            <span className="material-symbols-rounded text-base text-amber-400">event_busy</span>
                            <span className="text-xs font-bold uppercase tracking-[0.08em] text-white">Expiry Warnings ({expiryAlerts.length})</span>
                        </div>
                        <button onClick={() => navigate('/expiry-dashboard')} className="text-[10px] font-bold hover:underline" style={{ color: '#00c2cc' }}>
                            View Expiries
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto scrollable flex flex-col gap-2">
                        {expiryAlerts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full gap-2" style={{ color: 'var(--text-muted)' }}>
                                <span className="material-symbols-rounded text-3xl">check_circle</span>
                                <span className="text-xs font-medium text-slate-400">All channels expiration healthy</span>
                            </div>
                        ) : (
                            expiryAlerts.map(med => {
                                const color = med.status === 'Expired' ? '#f87171' : '#f59e0b';
                                return (
                                    <div key={med._id} onClick={() => navigate(`/medicines/${med._id}`)}
                                        className="p-2.5 rounded-lg flex items-center justify-between border border-transparent hover:border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.02] cursor-pointer transition-all duration-200">
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-xs font-semibold text-white truncate">{med.name}</span>
                                            <span className="text-[9px] mt-0.5 text-slate-400">
                                                Val: ₹{(med.value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })} · Exp: {new Date(med.expiryDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex-shrink-0 pl-2">
                                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded"
                                                style={{ background: `${color}10`, color }}>
                                                {med.status}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Low Stock Alerts widget */}
                <div className="rounded-lg p-5 flex flex-col gap-4 backdrop-blur-md h-[340px]"
                    style={{ background: 'rgba(15,20,32,0.3)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                        <div className="flex items-center gap-1.5">
                            <span className="material-symbols-rounded text-base text-red-400">warning</span>
                            <span className="text-xs font-bold uppercase tracking-[0.08em] text-white">Low Stock Warning ({lowStockAlerts.length})</span>
                        </div>
                        <button onClick={() => navigate('/reorder-intelligence')} className="text-[10px] font-bold hover:underline" style={{ color: '#00c2cc' }}>
                            Restock Queue
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto scrollable flex flex-col gap-2">
                        {lowStockAlerts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full gap-2" style={{ color: 'var(--text-muted)' }}>
                                <span className="material-symbols-rounded text-3xl">check_circle</span>
                                <span className="text-xs font-medium text-slate-400">All channels stock optimal</span>
                            </div>
                        ) : (
                            lowStockAlerts.map(med => {
                                const isZero = med.stock === 0;
                                return (
                                    <div key={med._id} onClick={() => navigate(`/medicines/${med._id}`)}
                                        className="p-2.5 rounded-lg flex items-center justify-between border border-transparent hover:border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.02] cursor-pointer transition-all duration-200">
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-xs font-semibold text-white truncate">{med.name}</span>
                                            <span className="text-[9px] mt-0.5 text-slate-400">
                                                Stock: {med.stock} · Reorder point: {med.reorderPoint !== undefined ? med.reorderPoint : 20}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-end flex-shrink-0 text-right pl-2">
                                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded"
                                                style={{
                                                    background: isZero ? 'rgba(248,113,113,0.08)' : 'rgba(245,158,11,0.08)',
                                                    color: isZero ? '#f87171' : '#f59e0b'
                                                }}>
                                                {isZero ? 'Depleted' : 'Low Stock'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Critical Alerts Feed Widget */}
                <div className="rounded-lg p-5 flex flex-col gap-4 backdrop-blur-md h-[340px]"
                    style={{ background: 'rgba(15,20,32,0.3)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                        <div className="flex items-center gap-1.5">
                            <span className="material-symbols-rounded text-base text-cyan-400">notifications_active</span>
                            <span className="text-xs font-bold uppercase tracking-[0.08em] text-white">Critical Alerts Feed ({dbAlerts?.length || 0})</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto scrollable flex flex-col gap-2">
                        {!dbAlerts || dbAlerts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full gap-2 text-center px-4" style={{ color: 'var(--text-muted)' }}>
                                <span className="material-symbols-rounded text-3xl">task_alt</span>
                                <span className="text-xs font-medium text-slate-400">No active branch compliance or temperature alerts logged.</span>
                            </div>
                        ) : (
                            dbAlerts.map(alert => {
                                const alertColors = {
                                    critical: 'rgba(239, 68, 68, 0.15)',
                                    warning: 'rgba(245, 158, 11, 0.15)',
                                    info: 'rgba(59, 130, 246, 0.15)'
                                };
                                const alertBorders = {
                                    critical: 'rgba(239, 68, 68, 0.4)',
                                    warning: 'rgba(245, 158, 11, 0.4)',
                                    info: 'rgba(59, 130, 246, 0.4)'
                                };
                                const textColors = {
                                    critical: '#ef4444',
                                    warning: '#f59e0b',
                                    info: '#3b82f6'
                                };
                                const iconMap = {
                                    Expiry: 'event_busy',
                                    Stock: 'warning',
                                    Health: 'trending_down',
                                    General: 'info'
                                };

                                return (
                                    <div key={alert._id} 
                                        className="p-2.5 rounded-lg border flex flex-col gap-1.5 transition-all duration-200"
                                        style={{ 
                                            background: alertColors[alert.severity] || 'rgba(255,255,255,0.02)',
                                            borderColor: alertBorders[alert.severity] || 'rgba(255,255,255,0.05)'
                                        }}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <span className="material-symbols-rounded text-sm" style={{ color: textColors[alert.severity] }}>
                                                    {iconMap[alert.alertType] || 'info'}
                                                </span>
                                                <span className="text-xs font-bold text-white">{alert.title}</span>
                                            </div>
                                            <button 
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    try {
                                                        const res = await fetch(`/api/alerts/${alert._id}/read`, { method: 'PUT' });
                                                        if (res.ok) fetchDashboard();
                                                    } catch (err) {
                                                        console.error(err);
                                                    }
                                                }}
                                                className="text-[9px] font-black text-white/40 hover:text-white bg-white/5 hover:bg-white/10 px-1.5 py-0.5 rounded cursor-pointer transition-all"
                                            >
                                                Dismiss
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-slate-300 font-medium leading-normal">
                                            {alert.message}
                                        </p>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
