import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Pharmacies() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Data states
    const [pharmacies, setPharmacies] = useState([]);
    const [managers, setManagers] = useState([]);
    const [kpis, setKpis] = useState({
        totalPharmacies: 0,
        activeBranches: 0,
        inactiveBranches: 0,
        totalStaff: 0,
        totalInventoryValue: 0,
        averageBranchHealthScore: 100
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('All'); // 'All', 'Active', 'Inactive'
    const [sortBy, setSortBy] = useState('Name'); // 'Name', 'Highest Health', 'Lowest Health', 'Recently Added'
    const [expandedBranchId, setExpandedBranchId] = useState(null);

    const toggleExpand = (id) => {
        setExpandedBranchId(prev => prev === id ? null : id);
    };

    // No modal states needed for create/edit anymore
    const [selectedPharmacy, setSelectedPharmacy] = useState(null);

    // Form inputs
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [coordinator, setCoordinator] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [gstin, setGstin] = useState('');
    const [drugLicence, setDrugLicence] = useState('');
    const [email, setEmail] = useState('');
    const [openingHours, setOpeningHours] = useState('9:00 AM - 10:00 PM');
    const [status, setStatus] = useState('Active');
    const [assignedManager, setAssignedManager] = useState('');
    const [branchCode, setBranchCode] = useState('');
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/pharmacies');
            if (!res.ok) {
                if (res.status === 403) {
                    throw new Error('Access Denied: Only system administrators can view this page.');
                }
                throw new Error('Failed to load pharmacy data.');
            }
            const data = await res.json();
            setPharmacies(data.pharmacies || []);
            setKpis(data.kpis || {
                totalPharmacies: 0,
                activeBranches: 0,
                inactiveBranches: 0,
                totalStaff: 0,
                totalInventoryValue: 0,
                averageBranchHealthScore: 100
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchManagers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            if (res.ok) {
                const data = await res.json();
                const managerUsers = (data.users || []).filter(u => u.role === 'Manager' && u.status === 'Active');
                setManagers(managerUsers);
            }
        } catch (err) {
            console.error('Failed to load manager list:', err);
        }
    };

    useEffect(() => {
        if (user) {
            if (user.role !== 'Admin') {
                // Non-admins are redirected directly to their assigned branch details page
                navigate(`/pharmacies/${user?.pharmacy?.id || ''}`);
            } else {
                fetchData();
                fetchManagers();
            }
        }
    }, [user, navigate]);

    // Handle Archive Action
    const handleArchive = async (id, pharmacyName) => {
        if (!window.confirm(`Are you sure you want to archive "${pharmacyName}"?`)) {
            return;
        }
        try {
            const res = await fetch(`/api/admin/pharmacies/${id}/archive`, {
                method: 'PUT'
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to archive pharmacy branch.');
            }
            fetchData();
        } catch (err) {
            alert(err.message);
        }
    };

    // Filtered & Sorted pharmacies list
    let processedPharmacies = pharmacies.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.coordinator && p.coordinator.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (p.address && p.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (p.gstin && p.gstin.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (p.branchCode && p.branchCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (p.drugLicence && p.drugLicence.toLowerCase().includes(searchQuery.toLowerCase()));
        
        if (filter === 'Active') return matchesSearch && p.status === 'Active';
        if (filter === 'Inactive') return matchesSearch && p.status === 'Inactive';
        return matchesSearch;
    });

    if (sortBy === 'Highest Health') {
        processedPharmacies.sort((a, b) => (b.healthScore || 100) - (a.healthScore || 100));
    } else if (sortBy === 'Lowest Health') {
        processedPharmacies.sort((a, b) => (a.healthScore || 100) - (b.healthScore || 100));
    } else if (sortBy === 'Recently Added') {
        processedPharmacies.sort((a, b) => new Date(b.joinedDate || 0) - new Date(a.joinedDate || 0));
    } else {
        processedPharmacies.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-44 gap-3 text-[var(--text-secondary)]">
                <span className="material-symbols-rounded animate-spin text-3xl text-cyan-400">sync</span>
                <span className="text-sm">Fetching pharmacy registers…</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4 max-w-md mx-auto text-center">
                <span className="material-symbols-rounded text-5xl text-red-400">gavel</span>
                <div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] font-serif">Access Violation</h3>
                    <p className="text-xs mt-1 text-[var(--text-secondary)]">{error}</p>
                </div>
                <button onClick={() => navigate('/dashboard')} className="px-5 py-2 rounded-xl text-xs font-bold bg-[var(--bg-secondary)] border border-[var(--card-border)] text-[var(--text-primary)] cursor-pointer">
                    Return to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto animate-fade-in pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                        System Administration
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-[var(--text-primary)] leading-none font-serif">
                        Pharmacy <span className="text-cyan-400">Branches</span>
                    </h2>
                    <p className="text-xs text-[var(--text-secondary)]">
                        Create, inspect, modify, and manage the active pharmacy branch nodes in your network.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/pharmacies/add')}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer text-slate-950 hover:bg-cyan-300 animate-pulse-slow"
                    style={{
                        background: 'linear-gradient(135deg, #00B4D8 0%, #0099a8 100%)',
                        boxShadow: '0 4px 24px rgba(0,194,204,0.2)'
                    }}
                >
                    <span className="material-symbols-rounded text-sm">add</span>
                    Create Branch
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                {/* Total branches */}
                <div className="rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden bg-[var(--card-bg)] backdrop-blur-md shadow-card border border-[var(--card-border)]">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-cyan-500/10 text-cyan-400">
                        <span className="material-symbols-rounded text-xl">domain</span>
                    </div>
                    <div className="flex flex-col mt-2">
                        <span className="text-2xl font-bold text-[var(--text-primary)] tracking-tight font-sans">{kpis.totalPharmacies}</span>
                        <span className="text-xs font-semibold uppercase tracking-wide mt-1 text-[var(--text-muted)]">Total Branches</span>
                    </div>
                </div>

                {/* Active branches */}
                <div className="rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden bg-[var(--card-bg)] backdrop-blur-md shadow-card border border-[var(--card-border)]">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-400">
                        <span className="material-symbols-rounded text-xl">check_circle</span>
                    </div>
                    <div className="flex flex-col mt-2">
                        <span className="text-2xl font-bold text-emerald-400 tracking-tight font-sans">{kpis.activeBranches}</span>
                        <span className="text-xs font-semibold uppercase tracking-wide mt-1 text-[var(--text-muted)]">Active</span>
                    </div>
                </div>

                {/* Inactive branches */}
                <div className="rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden bg-[var(--card-bg)] backdrop-blur-md shadow-card border border-[var(--card-border)]">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500/10 text-amber-500">
                        <span className="material-symbols-rounded text-xl">pause_circle</span>
                    </div>
                    <div className="flex flex-col mt-2">
                        <span className="text-2xl font-bold text-amber-500 tracking-tight font-sans">{kpis.inactiveBranches}</span>
                        <span className="text-xs font-semibold uppercase tracking-wide mt-1 text-[var(--text-muted)]">Inactive</span>
                    </div>
                </div>

                {/* Total staff */}
                <div className="rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden bg-[var(--card-bg)] backdrop-blur-md shadow-card border border-[var(--card-border)]">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-violet-500/10 text-violet-400">
                        <span className="material-symbols-rounded text-xl">badge</span>
                    </div>
                    <div className="flex flex-col mt-2">
                        <span className="text-2xl font-bold text-violet-400 tracking-tight font-sans">{kpis.totalStaff}</span>
                        <span className="text-xs font-semibold uppercase tracking-wide mt-1 text-[var(--text-muted)]">Total Staff</span>
                    </div>
                </div>

                {/* Total Inventory Value */}
                <div className="rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden bg-[var(--card-bg)] backdrop-blur-md shadow-card border border-[var(--card-border)]">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-cyan-500/10 text-cyan-400">
                        <span className="material-symbols-rounded text-xl">payments</span>
                    </div>
                    <div className="flex flex-col mt-2">
                        <span className="text-2xl font-bold text-[var(--text-primary)] tracking-tight font-sans">
                            ₹{kpis.totalInventoryValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wide mt-1 text-[var(--text-muted)]">Total Inventory</span>
                    </div>
                </div>

                {/* Average Health Score */}
                <div className="rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden bg-[var(--card-bg)] backdrop-blur-md shadow-card border border-[var(--card-border)]">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-400">
                        <span className="material-symbols-rounded text-xl">health_and_safety</span>
                    </div>
                    <div className="flex flex-col mt-2">
                        <span className="text-2xl font-bold text-emerald-400 tracking-tight font-sans">
                            {kpis.averageBranchHealthScore || 100}%
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wide mt-1 text-[var(--text-muted)]">Avg Health Score</span>
                    </div>
                </div>
            </div>

            {/* Search and Table Container */}
            <div className="rounded-3xl overflow-hidden bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--card-border)] shadow-elevated flex flex-col mt-4">
                {/* Search & Filters */}
                <div className="p-5 border-b border-[var(--card-border)] bg-[var(--bg-secondary)] flex flex-col xl:flex-row gap-4 w-full justify-between items-start xl:items-center">
                    <div className="flex items-center gap-3 w-full flex-1 relative">
                        <span className="material-symbols-rounded absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-[var(--brand)] pointer-events-none">search</span>
                        <input
                            type="text"
                            placeholder="Search by name, coordinator, GSTIN, code..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-12 py-3 rounded-lg text-sm outline-none transition-all duration-200 bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] focus:border-[var(--brand)] shadow-sm"
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer p-1"
                                title="Clear search"
                            >
                                <span className="material-symbols-rounded text-sm">close</span>
                            </button>
                        )}
                    </div>
                    
                    {/* Select Dropdown Filters */}
                    <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto shrink-0">
                        <div className="flex flex-1 sm:flex-none flex-col sm:flex-row sm:items-center gap-2">
                            <span className="text-xs uppercase font-black text-[var(--text-secondary)]">Status</span>
                            <select
                                value={filter}
                                onChange={e => setFilter(e.target.value)}
                                className="w-full sm:w-auto bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none cursor-pointer focus:border-cyan-400 shadow-sm"
                            >
                                <option value="All">All Statuses</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                        <div className="flex flex-1 sm:flex-none flex-col sm:flex-row sm:items-center gap-2">
                            <span className="text-xs uppercase font-black text-[var(--text-secondary)]">Sort By</span>
                            <select
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}
                                className="w-full sm:w-auto bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none cursor-pointer focus:border-cyan-400 shadow-sm"
                            >
                                <option value="Name">Branch Name</option>
                                <option value="Highest Health">Highest Health</option>
                                <option value="Lowest Health">Lowest Health</option>
                                <option value="Recently Added">Recently Added</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Branch Health Profiles Grid */}
                {processedPharmacies.length === 0 ? (
                    <div className="p-16 text-center text-[var(--text-secondary)] font-semibold">
                        No pharmacy branches found matching filters.
                    </div>
                ) : (
                    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-[var(--bg-secondary)]">
                        {processedPharmacies.map(p => {
                            const statusColor = p.status === 'Active' 
                                ? 'text-emerald-400 bg-emerald-500/10' 
                                : p.status === 'Inactive' 
                                ? 'text-amber-400 bg-amber-500/10' 
                                : 'text-[var(--text-secondary)] bg-[var(--bg-secondary)]0/10';

                            const healthColorText = (p.healthScore || 100) >= 90 
                                ? 'text-emerald-400' 
                                : (p.healthScore || 100) >= 75 
                                ? 'text-amber-400' 
                                : 'text-red-400';

                            // SVG Circle Calculations for gauge
                            const radius = 24;
                            const circumference = 2 * Math.PI * radius;
                            const strokeDashoffset = circumference - ((p.healthScore || 100) / 100) * circumference;

                            return (
                                <div key={p._id} className="rounded-xl border border-[var(--card-border)] bg-[var(--bg-secondary)] hover:border-cyan-500/30 transition-all duration-200 p-4 flex flex-col gap-3 shadow-lg">
                                    
                                    {/* Card Top: Clean Header with essential info and actions */}
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-[#00CFEA] flex-shrink-0">
                                                <span className="material-symbols-rounded text-lg">local_pharmacy</span>
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h4 className="text-[var(--text-primary)] font-serif italic text-base font-bold truncate">{p.name}</h4>
                                                    <span className="text-xs bg-[var(--bg-secondary)] border border-[var(--card-border)] text-[var(--text-secondary)] px-1.5 py-0.5 rounded font-mono font-semibold">
                                                        {p.branchCode || 'BR-001'}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${statusColor}`}>
                                                        {p.status}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-[var(--text-secondary)] truncate">
                                                    {p.coordinator ? `Coordinator: ${p.coordinator}` : 'Coordinator: Unassigned'}
                                                    {p.assignedManager?.fullName ? ` · Mgr: ${p.assignedManager.fullName}` : ''}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Buttons & Expand Toggle */}
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                            <button
                                                onClick={() => navigate(`/pharmacies/${p._id}`)}
                                                className="p-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--card-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-cyan-500/40 cursor-pointer transition-colors"
                                                title="View Branch Profile"
                                            >
                                                <span className="material-symbols-rounded text-sm">visibility</span>
                                            </button>
                                            <button
                                                onClick={() => navigate(`/pharmacies/edit/${p._id}`)}
                                                className="p-1.5 rounded-lg bg-[#00B4D8]/10 border border-[#00B4D8]/20 text-[#00B4D8] hover:bg-[#00B4D8]/20 cursor-pointer transition-colors"
                                                title="Edit Branch"
                                            >
                                                <span className="material-symbols-rounded text-sm">edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleArchive(p._id, p.name)}
                                                className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 cursor-pointer transition-colors"
                                                title="Archive Branch"
                                            >
                                                <span className="material-symbols-rounded text-sm">archive</span>
                                            </button>
                                            <button
                                                onClick={() => toggleExpand(p._id)}
                                                className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
                                                    expandedBranchId === p._id
                                                        ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 rotate-180'
                                                        : 'bg-[var(--bg-secondary)] border-[var(--card-border)] text-[var(--text-secondary)] hover:text-cyan-400'
                                                }`}
                                                title={expandedBranchId === p._id ? 'Collapse Details' : 'Expand Full Branch Details'}
                                            >
                                                <span className="material-symbols-rounded text-sm">keyboard_arrow_down</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Compact Summary Metrics Bar */}
                                    <div className="grid grid-cols-4 gap-2 bg-[var(--card-bg)]/40 border border-[var(--card-border)] rounded-lg p-2.5 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-xs text-[var(--text-secondary)] font-medium">Health</span>
                                            <span className={`text-sm font-bold font-mono ${healthColorText}`}>
                                                {p.healthScore || 100}%
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-center border-l border-[var(--card-border)]">
                                            <span className="text-xs text-[var(--text-secondary)] font-medium">Low Stock</span>
                                            <span className="text-sm font-bold font-mono text-amber-400">{p.lowStockCount || 0}</span>
                                        </div>
                                        <div className="flex flex-col items-center border-l border-[var(--card-border)]">
                                            <span className="text-xs text-[var(--text-secondary)] font-medium">Alerts</span>
                                            <span className={`text-sm font-bold font-mono ${(p.activeAlerts || 0) > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                                                {p.activeAlerts || 0}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-center border-l border-[var(--card-border)]">
                                            <span className="text-xs text-[var(--text-secondary)] font-medium">Staff</span>
                                            <span className="text-sm font-bold font-mono text-cyan-400">{p.staffCount || 0}</span>
                                        </div>
                                    </div>

                                    {/* Expandable Section: Full branch diagnostic, gauges, address, compliance and attention */}
                                    {expandedBranchId === p._id && (
                                        <div className="flex flex-col gap-3 pt-2 border-t border-[var(--card-border)] animate-fadeIn">
                                            {/* Address & Compliance Details */}
                                            <div className="bg-[var(--card-bg)]/25 rounded-lg p-2.5 text-xs text-[var(--text-secondary)] space-y-1">
                                                <div className="flex items-center gap-1.5 text-slate-300">
                                                    <span className="material-symbols-rounded text-xs text-cyan-400">pin_drop</span>
                                                    <span className="truncate">{p.address || 'No street address logged'}</span>
                                                </div>
                                                {(p.gstin || p.drugLicence) && (
                                                    <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                                                        {p.gstin && <span>GST: {p.gstin}</span>}
                                                        {p.drugLicence && <span>DL: {p.drugLicence}</span>}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Gauge and Counters Detailed Grid */}
                                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-[var(--card-bg)]/20 rounded-lg p-3 border border-[var(--card-border)]">
                                                {/* Circular Health Gauge */}
                                                <div className="sm:col-span-4 flex flex-col items-center gap-1 justify-center border-r border-[var(--card-border)] pr-2">
                                                    <div className="relative flex items-center justify-center w-14 h-14">
                                                        <svg className="w-full h-full transform -rotate-90">
                                                            <circle cx="28" cy="28" r="22" className="stroke-white/5" strokeWidth="4" fill="transparent" />
                                                            <circle cx="28" cy="28" r="22" 
                                                                    className={`stroke-current ${healthColorText}`} 
                                                                    strokeWidth="4" 
                                                                    fill="transparent"
                                                                    strokeDasharray={2 * Math.PI * 22}
                                                                    strokeDashoffset={2 * Math.PI * 22 - ((p.healthScore || 100) / 100) * (2 * Math.PI * 22)}
                                                                    strokeLinecap="round"
                                                            />
                                                        </svg>
                                                        <span className="absolute text-xs font-bold text-[var(--text-primary)] font-mono">{(p.healthScore || 100)}%</span>
                                                    </div>
                                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Branch Health</span>
                                                </div>

                                                {/* Detailed Counters */}
                                                <div className="sm:col-span-8 grid grid-cols-2 gap-2 pl-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-500/10 text-red-400">
                                                            <span className="material-symbols-rounded text-sm">warning</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] uppercase font-semibold text-[var(--text-secondary)]">Active Alerts</span>
                                                            <span className="text-xs font-bold text-[var(--text-primary)] font-mono">{p.activeAlerts || 0}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-500/10 text-amber-400">
                                                            <span className="material-symbols-rounded text-sm">inventory_2</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] uppercase font-semibold text-[var(--text-secondary)]">Low Stock</span>
                                                            <span className="text-xs font-bold text-[var(--text-primary)] font-mono">{p.lowStockCount || 0}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-rose-500/10 text-rose-400">
                                                            <span className="material-symbols-rounded text-sm">event_busy</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] uppercase font-semibold text-[var(--text-secondary)]">Expiry Risks</span>
                                                            <span className="text-xs font-bold text-[var(--text-primary)] font-mono">{p.expiryRisks || 0}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-500/10 text-slate-400">
                                                            <span className="material-symbols-rounded text-sm">money_off</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] uppercase font-semibold text-[var(--text-secondary)]">Dead Stock</span>
                                                            <span className="text-xs font-bold text-slate-300 font-mono">
                                                                ₹{(p.deadStockRisk || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* What Needs Attention Detailed section */}
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                                                    <span className="material-symbols-rounded text-xs text-cyan-400">crisis_alert</span>
                                                    <span>Operational Status</span>
                                                </div>
                                                
                                                <div className="flex flex-col gap-1.5">
                                                    {!p.attentionNeeded || p.attentionNeeded.length === 0 ? (
                                                        <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-xs">
                                                            <span className="material-symbols-rounded text-sm">check_circle</span>
                                                            <span>Branch operating at optimal parameters. No issues requiring attention.</span>
                                                        </div>
                                                    ) : (
                                                        p.attentionNeeded.map((item, idx) => (
                                                            <div key={idx} className="p-2 rounded-lg bg-[var(--card-bg)]/40 border border-[var(--card-border)] border-l-2 border-l-amber-500/70 flex items-center justify-between gap-2 text-xs">
                                                                <div className="flex flex-col min-w-0">
                                                                    <div className="flex items-center gap-1 text-[var(--text-primary)] font-semibold text-xs">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                                                        <span>{item.problem}</span>
                                                                    </div>
                                                                    <p className="text-[var(--text-secondary)] text-[11px] truncate">{item.impact}</p>
                                                                </div>
                                                                <button
                                                                    onClick={() => navigate(item.route)}
                                                                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold cursor-pointer transition-all whitespace-nowrap self-center"
                                                                >
                                                                    <span>Resolve</span>
                                                                    <span className="material-symbols-rounded text-xs">arrow_forward</span>
                                                                </button>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* Card Footer inside expanded view */}
                                            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] border-t border-[var(--card-border)] pt-2 mt-1">
                                                <span>Joined: {p.joinedDate ? new Date(p.joinedDate).toLocaleDateString('en-GB') : 'N/A'}</span>
                                                <span>Staff Scoped: {p.staffCount || 0} active</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

        </div>
    );
}
