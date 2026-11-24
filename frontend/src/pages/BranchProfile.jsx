import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function BranchProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Data states
    const [data, setData] = useState(null);
    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'staff', 'audit', 'alerts'

    const fetchBranchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch branch details & performance
            const res = await fetch(`/api/branches/${id}`);
            if (!res.ok) {
                if (res.status === 403) {
                    throw new Error('Access Denied: You do not have permissions to view this branch.');
                }
                throw new Error('Failed to load branch details.');
            }
            const details = await res.json();
            setData(details);

            // Fetch branch audits (Admin or Manager only)
            if (user && user.role !== 'Pharmacist') {
                const auditRes = await fetch(`/api/branches/${id}/audit-trail`);
                if (auditRes.ok) {
                    setAudits(await auditRes.json());
                }
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchBranchData();
        }
    }, [id, user]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-44 gap-3 text-[var(--text-secondary)]">
                <span className="material-symbols-rounded animate-spin text-3xl text-cyan-400">sync</span>
                <span className="text-sm">Retrieving branch profiling index…</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4 max-w-md mx-auto text-center animate-fade-in">
                <span className="material-symbols-rounded text-5xl text-red-400">gavel</span>
                <div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] font-serif">Security Restriction</h3>
                    <p className="text-xs mt-1 text-[var(--text-secondary)]">{error}</p>
                </div>
                <button onClick={() => navigate('/dashboard')} className="px-5 py-2 rounded-xl text-xs font-bold bg-[var(--bg-secondary)] border border-[var(--card-border)] text-[var(--text-primary)] cursor-pointer">
                    Return to Dashboard
                </button>
            </div>
        );
    }

    if (!data) return null;

    const { pharmacy, performance, staff, inventory } = data;

    const healthColor = performance.healthScore >= 90 
        ? 'text-emerald-400 bg-emerald-500/10' 
        : performance.healthScore >= 75 
        ? 'text-amber-400 bg-amber-500/10' 
        : 'text-red-400 bg-red-500/10';

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto animate-fade-in pb-12">
            
            {/* Header / Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-[var(--card-bg)] shadow-elevated border border-[var(--card-border)] relative overflow-hidden backdrop-blur-xl">
                <div className="flex flex-col gap-1.5 z-10">
                    <div className="flex items-center gap-2.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                            Pharmacy Node Overview
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-black uppercase ${pharmacy.status === 'Active' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
                            {pharmacy.status}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-3xl font-black text-[var(--text-primary)] font-serif tracking-tight">{pharmacy.name}</h2>
                        <span className="text-xs px-2 py-1 bg-[var(--bg-secondary)] border border-[var(--card-border)] text-[var(--text-secondary)] rounded-lg font-mono">
                            {pharmacy.branchCode || 'BR-XXX'}
                        </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] max-w-xl">{pharmacy.address || 'No address logged'}</p>
                </div>

                <div className="flex items-center gap-4 z-10 flex-wrap">
                    {/* Health Score Gauge */}
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--card-border)]">
                        <span className="material-symbols-rounded text-[var(--text-secondary)] text-lg">health_and_safety</span>
                        <div className="flex flex-col">
                            <span className={`text-xl font-bold font-mono leading-none ${healthColor}`}>
                                {performance.healthScore}%
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mt-1">Health Score</span>
                        </div>
                    </div>

                    {/* Valuation Card */}
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--card-border)]">
                        <span className="material-symbols-rounded text-cyan-400 text-lg">payments</span>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold font-mono text-[var(--text-primary)] leading-none">
                                ₹{performance.inventoryValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mt-1">Valuation</span>
                        </div>
                    </div>
                    
                    {user?.role === 'Admin' && (
                        <button 
                            onClick={() => navigate('/pharmacies')}
                            className="flex items-center justify-center p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--card-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-bg)]/10 cursor-pointer"
                            title="Back to Branches"
                        >
                            <span className="material-symbols-rounded text-sm">arrow_back</span>
                        </button>
                    )}
                </div>
            </div>

            {/* ── Branch Status Summary ── */}
            {(() => {
                const isHealthy = performance.healthScore >= 90;
                const isWarning = performance.healthScore >= 75 && performance.healthScore < 90;
                
                let statusLabel = 'Healthy';
                let statusColor = 'text-emerald-400';
                let statusBg = 'border-emerald-500/25 bg-emerald-500/[0.02]';
                
                if (performance.healthScore < 75) {
                    statusLabel = 'Critical Attention Required';
                    statusColor = 'text-red-400';
                    statusBg = 'border-red-500/25 bg-red-500/[0.02]';
                } else if (isWarning) {
                    statusLabel = 'Needs Action';
                    statusColor = 'text-amber-400';
                    statusBg = 'border-amber-500/25 bg-amber-500/[0.02]';
                }

                return (
                    <div className={`rounded-3xl p-6 border backdrop-blur-md flex flex-col md:flex-row justify-between gap-5 relative overflow-hidden shadow-elevated ${statusBg}`}>
                        <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none rounded-full" style={{ background: `radial-gradient(circle, ${isHealthy ? 'rgba(52,211,153,0.1)' : isWarning ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)'} 0%, transparent 70%)`, filter: 'blur(15px)' }} />
                        <div className="flex flex-col gap-3.5 z-10 flex-1">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-rounded text-[var(--text-secondary)] text-sm">analytics</span>
                                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Operations Decision Support</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-[var(--text-secondary)]">Branch Status</span>
                                <h3 className={`text-xl font-bold flex items-center gap-2 ${statusColor}`}>
                                    <span className="w-2.5 h-2.5 rounded-full inline-block animate-pulse" style={{ background: 'currentColor' }} />
                                    <span>{statusLabel}</span>
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">Current Issues</span>
                                    <div className="flex flex-wrap gap-2">
                                        {performance.lowStockCount > 0 && (
                                            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-lg text-amber-500 text-xs font-bold">
                                                <span className="material-symbols-rounded text-sm">inventory_2</span>
                                                {performance.lowStockCount} Low Stock
                                            </div>
                                        )}
                                        {performance.expiredStockCount > 0 && (
                                            <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 px-2.5 py-1.5 rounded-lg text-red-500 text-xs font-bold">
                                                <span className="material-symbols-rounded text-sm">event_busy</span>
                                                {performance.expiredStockCount} Expired
                                            </div>
                                        )}
                                        {performance.lowStockCount === 0 && performance.expiredStockCount === 0 && (
                                            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg text-emerald-500 text-xs font-bold">
                                                <span className="material-symbols-rounded text-sm">check_circle</span>
                                                Optimal Stock
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">Priority Actions</span>
                                    <div className="flex flex-wrap gap-2">
                                        {performance.expiredStockCount > 0 && (
                                            <div className="flex items-center gap-1.5 bg-[#00B4D8]/10 border border-[#00B4D8]/20 px-2.5 py-1.5 rounded-lg text-[#00B4D8] text-xs font-bold">
                                                <span className="material-symbols-rounded text-sm">assignment_turned_in</span>
                                                Clear Expiries
                                            </div>
                                        )}
                                        {performance.lowStockCount > 0 && (
                                            <div className="flex items-center gap-1.5 bg-[#00B4D8]/10 border border-[#00B4D8]/20 px-2.5 py-1.5 rounded-lg text-[#00B4D8] text-xs font-bold">
                                                <span className="material-symbols-rounded text-sm">shopping_cart</span>
                                                Reorder Stock
                                            </div>
                                        )}
                                        {performance.lowStockCount === 0 && performance.expiredStockCount === 0 && (
                                            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg text-emerald-500 text-xs font-bold">
                                                <span className="material-symbols-rounded text-sm">trending_up</span>
                                                Monitor Sales
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col justify-end items-start md:items-end gap-2 border-t md:border-t-0 md:border-l border-[var(--card-border)] pt-4 md:pt-0 md:pl-5 flex-shrink-0 min-w-[200px] z-10">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">Business Impact</span>
                            <div className="flex flex-col md:items-end">
                                <span className="text-xl font-extrabold text-[var(--text-primary)] font-serif" style={{ fontFamily: "'Lora', serif" }}>
                                    ₹{performance.deadStockValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                </span>
                                <span className="text-xs text-red-400 font-bold uppercase mt-1">Dead Stock Value at Risk</span>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 w-full mt-5">
                                <button 
                                    onClick={() => navigate('/expiry-dashboard')}
                                    className="flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer bg-[var(--bg-secondary)] hover:bg-[var(--card-bg)]/50 text-[var(--text-primary)] border border-[var(--card-border)] text-center whitespace-nowrap shadow-sm hover:shadow"
                                >
                                    Review Expiry
                                </button>
                                <button 
                                    onClick={() => navigate('/reorder-intelligence')}
                                    className="flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer text-slate-900 text-center whitespace-nowrap shadow-sm hover:shadow"
                                    style={{ background: 'linear-gradient(135deg, #00e5ff 0%, #0099a8 100%)' }}
                                >
                                    Reorder Stock
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Basic Details Card */}
                <div className="rounded-2xl p-6 flex flex-col gap-5 premium-card shadow-sm">
                    <div className="flex items-center gap-2 pb-3 border-b border-[var(--card-border)]">
                        <span className="material-symbols-rounded text-cyan-400 text-base">info</span>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">Branch Identity</h3>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--card-border)]">
                            <span className="material-symbols-rounded text-[var(--text-secondary)] text-xl p-2 rounded-lg bg-[var(--card-bg)] shadow-sm">storefront</span>
                            <div className="flex flex-col">
                                <span className="text-sm font-black text-[var(--text-primary)] font-serif">{pharmacy.name}</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-0.5">Code: {pharmacy.branchCode}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--card-border)]">
                                <span className="material-symbols-rounded text-[var(--text-muted)] text-[14px]">call</span>
                                <span className="text-xs font-semibold text-[var(--text-primary)] mt-1">{pharmacy.contactPhone || 'N/A'}</span>
                                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Phone</span>
                            </div>
                            <div className="flex flex-col gap-1 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--card-border)]">
                                <span className="material-symbols-rounded text-[var(--text-muted)] text-[14px]">mail</span>
                                <span className="text-xs font-semibold text-[var(--text-primary)] mt-1 truncate" title={pharmacy.email}>{pharmacy.email || 'N/A'}</span>
                                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Email</span>
                            </div>
                            <div className="flex flex-col gap-1 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--card-border)]">
                                <span className="material-symbols-rounded text-[var(--text-muted)] text-[14px]">shield_person</span>
                                <span className="text-xs font-semibold text-[var(--text-primary)] mt-1 truncate" title={pharmacy.assignedManager?.fullName}>{pharmacy.assignedManager?.fullName || 'Unassigned'}</span>
                                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Manager</span>
                            </div>
                            <div className="flex flex-col gap-1 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--card-border)]">
                                <span className="material-symbols-rounded text-[var(--text-muted)] text-[14px]">schedule</span>
                                <span className="text-xs font-semibold text-[var(--text-primary)] mt-1">{pharmacy.openingHours}</span>
                                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Hours</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Performance Metrics Card */}
                <div className="rounded-2xl p-6 flex flex-col gap-5 premium-card shadow-sm">
                    <div className="flex items-center gap-2 pb-3 border-b border-[var(--card-border)]">
                        <span className="material-symbols-rounded text-emerald-400 text-base">monitoring</span>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">Inventory Health</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2 flex items-center justify-between p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--card-border)] relative overflow-hidden group">
                            <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-[#00e5ff]/10 to-transparent pointer-events-none group-hover:from-[#00e5ff]/20 transition-all" />
                            <div className="flex flex-col gap-0.5 z-10">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Total Valuation</span>
                                <span className="text-xl font-black text-cyan-400 font-mono">₹{performance.inventoryValue.toLocaleString('en-IN')}</span>
                            </div>
                            <span className="material-symbols-rounded text-cyan-400/20 text-4xl absolute -right-2 -bottom-2 z-0 group-hover:scale-110 transition-transform">account_balance_wallet</span>
                        </div>
                        
                        <div className="flex flex-col gap-1 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--card-border)]">
                            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Catalog Size</span>
                            <div className="flex items-end justify-between mt-1">
                                <span className="text-lg font-black text-[var(--text-primary)] font-mono">{performance.totalMedicines}</span>
                                <span className="material-symbols-rounded text-[var(--text-muted)] text-sm mb-1">category</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 p-3 rounded-xl bg-[var(--bg-secondary)] border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.05)]">
                            <span className="text-[10px] uppercase font-bold text-red-400/80">Dead Stock</span>
                            <div className="flex items-end justify-between mt-1">
                                <span className="text-lg font-black text-red-400 font-mono truncate" title={`₹${performance.deadStockValue}`}>₹{performance.deadStockValue > 9999 ? (performance.deadStockValue/1000).toFixed(1)+'k' : performance.deadStockValue}</span>
                                <span className="material-symbols-rounded text-red-400/50 text-sm mb-1">trending_down</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 p-3 rounded-xl bg-[var(--bg-secondary)] border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
                            <span className="text-[10px] uppercase font-bold text-amber-500/80">Low Stock Items</span>
                            <div className="flex items-end justify-between mt-1">
                                <span className="text-lg font-black text-amber-500 font-mono">{performance.lowStockCount}</span>
                                <span className="material-symbols-rounded text-amber-500/50 text-sm mb-1">warning</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 p-3 rounded-xl bg-[var(--bg-secondary)] border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.05)]">
                            <span className="text-[10px] uppercase font-bold text-red-400/80">Expired Items</span>
                            <div className="flex items-end justify-between mt-1">
                                <span className="text-lg font-black text-red-400 font-mono">{performance.expiredStockCount}</span>
                                <span className="material-symbols-rounded text-red-400/50 text-sm mb-1">hourglass_disabled</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Staff Information Card */}
                <div className="rounded-2xl p-6 flex flex-col gap-5 premium-card shadow-sm">
                    <div className="flex items-center gap-2 pb-3 border-b border-[var(--card-border)]">
                        <span className="material-symbols-rounded text-violet-400 text-base">groups</span>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">Workforce</h3>
                    </div>
                    <div className="flex gap-3 mb-1">
                        <div className="flex-1 flex flex-col items-center justify-center p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--card-border)]">
                            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] text-center">Active</span>
                            <span className="text-xl font-black text-emerald-400 font-mono mt-1">{staff.activeUsers}</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--card-border)]">
                            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] text-center">Total Staff</span>
                            <span className="text-xl font-black text-[var(--text-primary)] font-mono mt-1">{staff.users.length}</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--card-border)]">
                            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] text-center">Managers</span>
                            <span className="text-xl font-black text-violet-400 font-mono mt-1">{staff.totalManagers}</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 flex-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)]">Active Roster Sample</span>
                        <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[140px] pr-1 scrollable">
                            {staff.users.slice(0, 4).map(u => (
                                <div key={u._id} className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--card-border)] group hover:border-cyan-400/30 transition-colors">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold bg-[var(--card-bg)] text-[var(--text-secondary)] border border-[var(--card-border)] flex-shrink-0">
                                            {u.fullName ? u.fullName.charAt(0) : u.username.charAt(0)}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-xs font-bold text-[var(--text-primary)] truncate">{u.fullName || u.username}</span>
                                            <span className="text-[10px] text-[var(--text-muted)] truncate">{u.role}</span>
                                        </div>
                                    </div>
                                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${u.status === 'Active' ? 'bg-emerald-400' : 'bg-[var(--text-muted)]'}`} />
                                </div>
                            ))}
                            {staff.users.length > 4 && (
                                <div className="text-[10px] font-bold text-center text-cyan-400 py-1 cursor-pointer hover:underline" onClick={() => setActiveTab('staff')}>
                                    View {staff.users.length - 4} more staff
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs for Details Tables */}
            <div className="flex flex-col gap-4">
                <div className="flex border-b border-[var(--card-border)] gap-2.5 overflow-x-auto scrollable">
                    <button
                        onClick={() => setActiveTab('inventory')}
                        className={`flex items-center gap-2 pb-3 px-1 text-xs font-bold border-b-2 cursor-pointer transition-all ${activeTab === 'inventory' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                    >
                        <span className="material-symbols-rounded text-sm">inventory_2</span>
                        Inventory Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('staff')}
                        className={`flex items-center gap-2 pb-3 px-1 text-xs font-bold border-b-2 cursor-pointer transition-all ${activeTab === 'staff' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                    >
                        <span className="material-symbols-rounded text-sm">badge</span>
                        Staff Directory
                    </button>
                    {user?.role !== 'Pharmacist' && (
                        <button
                            onClick={() => setActiveTab('audit')}
                            className={`flex items-center gap-2 pb-3 px-1 text-xs font-bold border-b-2 cursor-pointer transition-all ${activeTab === 'audit' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                        >
                            <span className="material-symbols-rounded text-sm">history</span>
                            Branch Audit Trail
                        </button>
                    )}
                    <button
                        onClick={() => setActiveTab('alerts')}
                        className={`flex items-center gap-2 pb-3 px-1 text-xs font-bold border-b-2 cursor-pointer transition-all ${activeTab === 'alerts' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                    >
                        <span className="material-symbols-rounded text-sm">notifications</span>
                        Branch Alerts
                        {inventory.alerts.length > 0 && (
                            <span className="ml-1.5 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center justify-center font-bold shadow-md shadow-red-500/20">
                                {inventory.alerts.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Tab Contents */}
                {activeTab === 'inventory' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Medicines */}
                        <div className="rounded-2xl overflow-hidden bg-[var(--card-bg)] backdrop-blur-md shadow-card border border-[var(--card-border)] flex flex-col">
                            <div className="p-5 bg-[var(--bg-secondary)] border-b border-[var(--card-border)] flex items-center justify-between">
                                <span className="text-xs font-black uppercase text-[var(--text-primary)] tracking-wider flex items-center gap-1.5">
                                    <span className="material-symbols-rounded text-sm text-cyan-400">workspace_premium</span>
                                    Top Medicines by Valuation
                                </span>
                            </div>
                            <div className="overflow-x-auto scrollable">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-[var(--bg-secondary)] text-xs uppercase font-bold text-[var(--text-secondary)] border-b border-[var(--card-border)]">
                                            <th className="p-3 pl-4">Medicine</th>
                                            <th className="p-3">NDC Code</th>
                                            <th className="p-3 text-center">Stock</th>
                                            <th className="p-3 text-right">Valuation</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.02] text-[var(--text-secondary)] font-semibold">
                                        {inventory.topMedicines.length === 0 ? (
                                            <tr><td colSpan="4" className="p-6 text-center text-[var(--text-secondary)]">No medicine inventory records found.</td></tr>
                                        ) : (
                                            inventory.topMedicines.map(m => (
                                                <tr key={m._id} className="hover:bg-zinc-800/30">
                                                    <td className="p-3 pl-4 text-[var(--text-primary)] font-serif">{m.name}</td>
                                                    <td className="p-3 font-mono text-xs text-[var(--text-secondary)]">{m.ndc}</td>
                                                    <td className="p-3 text-center font-mono">{m.stock}</td>
                                                    <td className="p-3 text-right font-mono text-cyan-400">₹{m.valuation.toLocaleString('en-IN')}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Recent Transactions */}
                        <div className="rounded-2xl overflow-hidden bg-[var(--card-bg)] backdrop-blur-md shadow-card border border-[var(--card-border)] flex flex-col">
                            <div className="p-5 bg-[var(--bg-secondary)] border-b border-[var(--card-border)] flex items-center justify-between">
                                <span className="text-xs font-black uppercase text-[var(--text-primary)] tracking-wider flex items-center gap-1.5">
                                    <span className="material-symbols-rounded text-sm text-cyan-400">timeline</span>
                                    Recent Branch Transactions
                                </span>
                            </div>
                            <div className="overflow-x-auto scrollable">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-[var(--bg-secondary)] text-xs uppercase font-bold text-[var(--text-secondary)] border-b border-[var(--card-border)]">
                                            <th className="p-3 pl-4">Date & User</th>
                                            <th className="p-3">Medicine</th>
                                            <th className="p-3 text-center">Type</th>
                                            <th className="p-3 text-center">Quantity</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.02] text-[var(--text-secondary)] font-semibold">
                                        {inventory.recentTransactions.length === 0 ? (
                                            <tr><td colSpan="4" className="p-6 text-center text-[var(--text-secondary)]">No stock movements registered.</td></tr>
                                        ) : (
                                            inventory.recentTransactions.map(t => (
                                                <tr key={t._id} className="hover:bg-zinc-800/30">
                                                    <td className="p-3 pl-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs text-[var(--text-secondary)] font-mono">{new Date(t.createdAt).toLocaleDateString('en-GB')}</span>
                                                            <span className="text-xs text-[var(--text-secondary)] mt-0.5 font-sans">@{t.userId?.username}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-[var(--text-primary)] font-serif">{t.medicineId?.name || 'Unknown'}</td>
                                                    <td className="p-3 text-center">
                                                        {(() => {
                                                            const displayType = t.transactionType === 'Stock In' ? 'Receive Stock' : t.transactionType === 'Stock Out' ? 'Dispense Stock' : t.transactionType;
                                                            const colorClass = displayType === 'Receive Stock' ? 'text-emerald-400 bg-emerald-500/10' : displayType === 'Dispense Stock' ? 'text-cyan-400 bg-cyan-500/10' : 'text-amber-400 bg-amber-500/10';
                                                            return (
                                                                <span className={`px-2 py-0.5 rounded text-xs font-black uppercase ${colorClass}`}>
                                                                    {displayType}
                                                                </span>
                                                            );
                                                        })()}
                                                    </td>
                                                    <td className="p-3 text-center font-mono">{t.quantityChanged}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Low Stock Alerts */}
                        <div className="rounded-2xl overflow-hidden bg-[var(--card-bg)] backdrop-blur-md shadow-card border border-[var(--card-border)] flex flex-col">
                            <div className="p-5 bg-[var(--bg-secondary)] border-b border-[var(--card-border)]">
                                <span className="text-xs font-black uppercase text-[var(--text-primary)] tracking-wider flex items-center gap-1.5">
                                    <span className="material-symbols-rounded text-sm text-amber-400">warning</span>
                                    Low Stock Alerts (Reorder Center)
                                </span>
                            </div>
                            <div className="overflow-x-auto scrollable">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-[var(--bg-secondary)] text-xs uppercase font-bold text-[var(--text-secondary)] border-b border-[var(--card-border)]">
                                            <th className="p-3 pl-4">Medicine</th>
                                            <th className="p-3">NDC Code</th>
                                            <th className="p-3 text-center">Current Stock</th>
                                            <th className="p-3 text-center">Threshold</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.02] text-[var(--text-secondary)] font-semibold">
                                        {inventory.reorderAlerts.length === 0 ? (
                                            <tr><td colSpan="4" className="p-6 text-center text-emerald-400 bg-emerald-500/[0.02]">All stock levels healthy.</td></tr>
                                        ) : (
                                            inventory.reorderAlerts.map(r => (
                                                <tr key={r._id} className="hover:bg-zinc-800/30">
                                                    <td className="p-3 pl-4 text-[var(--text-primary)] font-serif">{r.name}</td>
                                                    <td className="p-3 font-mono text-xs text-[var(--text-secondary)]">{r.ndc}</td>
                                                    <td className="p-3 text-center text-amber-400 font-mono font-bold">{r.stock}</td>
                                                    <td className="p-3 text-center font-mono text-[var(--text-secondary)]">{r.reorderPoint}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Expiry Risk Alerts */}
                        <div className="rounded-2xl overflow-hidden bg-[var(--card-bg)] backdrop-blur-md shadow-card border border-[var(--card-border)] flex flex-col">
                            <div className="p-5 bg-[var(--bg-secondary)] border-b border-[var(--card-border)]">
                                <span className="text-xs font-black uppercase text-[var(--text-primary)] tracking-wider flex items-center gap-1.5">
                                    <span className="material-symbols-rounded text-sm text-red-400">hourglass_disabled</span>
                                    Expiry & Dead Stock Alerts
                                </span>
                            </div>
                            <div className="overflow-x-auto scrollable">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="bg-[var(--bg-secondary)] text-xs uppercase font-bold text-[var(--text-secondary)] border-b border-[var(--card-border)]">
                                            <th className="p-3 pl-4">Medicine</th>
                                            <th className="p-3">Expiry Date</th>
                                            <th className="p-3 text-center">Risk status</th>
                                            <th className="p-3 text-center">Quantity</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.02] text-[var(--text-secondary)] font-semibold">
                                        {inventory.expiryAlerts.length === 0 ? (
                                            <tr><td colSpan="4" className="p-6 text-center text-emerald-400 bg-emerald-500/[0.02]">No expiry risk items detected.</td></tr>
                                        ) : (
                                            inventory.expiryAlerts.map(e => (
                                                <tr key={e._id} className="hover:bg-zinc-800/30">
                                                    <td className="p-3 pl-4 text-[var(--text-primary)] font-serif">{e.name}</td>
                                                    <td className="p-3 font-mono text-xs text-[var(--text-secondary)]">
                                                        {new Date(e.expiryDate).toLocaleDateString('en-GB')}
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-black uppercase ${e.status === 'Expired' ? 'text-red-400 bg-red-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
                                                            {e.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-center font-mono">{e.stock}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'staff' && (
                    <div className="rounded-3xl overflow-hidden bg-[var(--card-bg)] backdrop-blur-md shadow-elevated border border-[var(--card-border)] flex flex-col">
                        <div className="p-5 bg-[var(--bg-secondary)] border-b border-[var(--card-border)]">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">Staff Member Directory</h3>
                        </div>
                        <div className="overflow-x-auto scrollable">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-[var(--bg-secondary)] text-xs uppercase font-bold text-[var(--text-secondary)] border-b border-[var(--card-border)]">
                                        <th className="p-4 pl-6">Full Name / Username</th>
                                        <th className="p-4">Contact Detail</th>
                                        <th className="p-4">Shift Type</th>
                                        <th className="p-4 text-center">Account Status</th>
                                        <th className="p-4">Joined Date</th>
                                        <th className="p-4">Registration Detail</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.02] text-[var(--text-secondary)] font-semibold">
                                    {staff.users.length === 0 ? (
                                        <tr><td colSpan="6" className="p-10 text-center text-[var(--text-secondary)]">No staff members currently assigned to this branch.</td></tr>
                                    ) : (
                                        staff.users.map(u => (
                                            <tr key={u._id} className="hover:bg-zinc-800/30">
                                                <td className="p-4 pl-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-[var(--text-primary)] font-bold">{u.fullName || 'No Name'}</span>
                                                        <span className="text-xs text-cyan-400 mt-0.5">@{u.username} ({u.role})</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col">
                                                        <span>{u.phone || 'No phone'}</span>
                                                        <span className="text-xs text-[var(--text-secondary)] mt-0.5">{u.email || 'No email'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 font-medium text-[var(--text-secondary)]">{u.shiftType}</td>
                                                <td className="p-4 text-center">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-black uppercase ${u.status === 'Active' ? 'text-emerald-400 bg-emerald-500/10' : 'text-[var(--text-secondary)] bg-[var(--bg-secondary)]'}`}>
                                                        {u.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-mono text-[var(--text-secondary)]">{u.joinedDate ? new Date(u.joinedDate).toLocaleDateString('en-GB') : 'N/A'}</td>
                                                <td className="p-4 text-xs text-[var(--text-secondary)] font-mono">
                                                    {u.registrationNumber ? `${u.qualification} • Reg: ${u.registrationNumber}` : 'N/A'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'audit' && user?.role !== 'Pharmacist' && (
                    <div className="rounded-3xl overflow-hidden bg-[var(--card-bg)] backdrop-blur-md shadow-elevated border border-[var(--card-border)] flex flex-col">
                        <div className="p-5 bg-[var(--bg-secondary)] border-b border-[var(--card-border)]">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">Branch Activity Audit Logs</h3>
                        </div>
                        <div className="overflow-x-auto scrollable">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-[var(--bg-secondary)] text-xs uppercase font-bold text-[var(--text-secondary)] border-b border-[var(--card-border)]">
                                        <th className="p-4 pl-6 w-[160px]">Timestamp</th>
                                        <th className="p-4 w-[120px]">Operator</th>
                                        <th className="p-4 w-[150px]">Action Trigger</th>
                                        <th className="p-4">Previous State</th>
                                        <th className="p-4">New State</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.02] text-[var(--text-secondary)] font-semibold">
                                    {audits.length === 0 ? (
                                        <tr><td colSpan="5" className="p-10 text-center text-[var(--text-secondary)] font-medium">No branch modifications logged in audit registry.</td></tr>
                                    ) : (
                                        audits.map(a => (
                                            <tr key={a._id} className="hover:bg-zinc-800/30 text-xs">
                                                <td className="p-4 pl-6 font-mono text-[var(--text-secondary)]">
                                                    {new Date(a.timestamp).toLocaleString('en-GB')}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-[var(--text-primary)]">@{a.username}</span>
                                                        <span className="text-xs text-[var(--text-secondary)] font-bold uppercase">{a.userId?.role || 'User'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-black uppercase ${a.action === 'Branch Creation' ? 'text-emerald-400 bg-emerald-500/10' : a.action === 'Manager Assignment' ? 'text-cyan-400 bg-cyan-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
                                                        {a.action}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-mono text-[var(--text-secondary)] max-w-[200px] truncate" title={JSON.stringify(a.previousValue)}>
                                                    {a.previousValue ? JSON.stringify(a.previousValue) : 'Empty'}
                                                </td>
                                                <td className="p-4 font-mono text-emerald-400 max-w-[200px] truncate" title={JSON.stringify(a.newValue)}>
                                                    {a.newValue ? JSON.stringify(a.newValue) : 'Empty'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'alerts' && (
                    <div className="rounded-3xl overflow-hidden bg-[var(--card-bg)] backdrop-blur-md shadow-elevated border border-[var(--card-border)] flex flex-col">
                        <div className="p-5 bg-[var(--bg-secondary)] border-b border-[var(--card-border)]">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">Active Branch Alerts</h3>
                        </div>
                        <div className="flex flex-col gap-3 p-4">
                            {inventory.alerts.length === 0 ? (
                                <div className="p-8 text-center text-emerald-400 bg-emerald-500/5 rounded-xl border border-emerald-500/10 font-bold text-xs flex items-center justify-center gap-2">
                                    <span className="material-symbols-rounded">check_circle</span>
                                    No active compliance warnings or health issues for this branch.
                                </div>
                            ) : (
                                inventory.alerts.map(a => {
                                    const alertColors = a.severity === 'critical' 
                                        ? 'bg-red-500/10 border-red-500/20 text-red-300' 
                                        : 'bg-amber-500/10 border-amber-500/20 text-amber-300';
                                    const alertIcon = a.severity === 'critical' ? 'dangerous' : 'warning';
                                    return (
                                        <div key={a._id} className={`p-4 rounded-xl border flex gap-3.5 items-start ${alertColors} animate-fade-in`}>
                                            <span className="material-symbols-rounded text-lg mt-0.5">{alertIcon}</span>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-bold text-xs">{a.title}</span>
                                                <span className="text-xs leading-relaxed opacity-80 mt-1">{a.message}</span>
                                                <span className="text-xs opacity-65 font-mono mt-1">Logged on: {new Date(a.createdAt).toLocaleString('en-GB')}</span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
