import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
    {
        to: '/dashboard',
        icon: 'dashboard',
        label: 'Analytics Dashboard',
        sublabel: 'Operational metrics',
    },
    {
        to: '/expiry-dashboard',
        icon: 'hourglass_empty',
        label: 'Expiry Intelligence',
        sublabel: 'Risk & dead stock',
    },
    {
        to: '/medicines',
        end: true,
        icon: 'layers',
        label: 'Medicine Ledger',
        sublabel: 'Stock catalog',
    },
    {
        to: '/medicines/add',
        icon: 'add_circle',
        label: 'Add Medicine',
        sublabel: 'New catalog entry',
    },
    {
        to: '/inventory/history',
        icon: 'swap_vert',
        label: 'Stock Movements',
        sublabel: 'Audit trail',
    },
    {
        to: '/inventory/transaction-new',
        icon: 'edit_note',
        label: 'New Transaction',
        sublabel: 'Record movement',
    },
];

const PAGE_LABELS = {
    '/dashboard': { title: 'Analytics Dashboard', sub: 'Pharmacy metrics and intelligence' },
    '/expiry-dashboard': { title: 'Expiry Intelligence', sub: 'Risk analysis and stock actions' },
    '/medicines': { title: 'Medicine Ledger', sub: 'Manage your pharmacy catalog' },
    '/medicines/add': { title: 'Add Medicine', sub: 'Create a new catalog entry' },
    '/inventory/history': { title: 'Stock Movements', sub: 'Complete audit trail' },
    '/inventory/transaction-new': { title: 'New Transaction', sub: 'Record a stock movement' },
};

function getPageMeta(pathname) {
    if (pathname.startsWith('/medicines/edit/')) return { title: 'Edit Medicine', sub: 'Update catalog record' };
    if (pathname.startsWith('/medicines/') && pathname !== '/medicines/add') return { title: 'Medicine Details', sub: 'Full record view' };
    if (pathname.startsWith('/inventory/transaction/')) return { title: 'Transaction Receipt', sub: 'Movement audit log' };
    return PAGE_LABELS[pathname] || { title: 'SMAART Pharmacy', sub: 'Intelligence Platform' };
}

export default function Layout() {
    const { user, logout, activeBranch, switchBranch } = useAuth();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const pageMeta = getPageMeta(pathname);

    // ── Branches & Alerts Polling State ──
    const [branches, setBranches] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchAlertCount = async () => {
        try {
            const res = await fetch('/api/alerts');
            if (res.ok) {
                const alerts = await res.json();
                setUnreadCount(alerts.length);
            }
        } catch (err) {
            console.error('Error fetching alerts count:', err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchAlertCount();
            const interval = setInterval(fetchAlertCount, 30000);
            return () => clearInterval(interval);
        }
    }, [user, activeBranch]);

    useEffect(() => {
        if (user?.role === 'Admin') {
            const fetchBranches = async () => {
                try {
                    const res = await fetch('/api/analytics/admin/branches');
                    if (res.ok) {
                        const data = await res.json();
                        setBranches(data);
                    }
                } catch (err) {
                    console.error('Error fetching branches list:', err);
                }
            };
            fetchBranches();
        }
    }, [user]);

    // ── RBAC Navigation Setup ──
    const navItems = [
        {
            to: '/dashboard',
            icon: 'dashboard',
            label: 'Analytics Dashboard',
            sublabel: 'Operational metrics',
        }
    ];

    if (user?.role === 'Admin') {
        navItems.push(
            {
                to: '/branch-comparison',
                icon: 'compare_arrows',
                label: 'Branch Comparison',
                sublabel: 'Compare locations',
            },
            {
                to: '/medicines',
                end: true,
                icon: 'layers',
                label: 'Medicine Ledger',
                sublabel: 'Stock catalog',
            },
            {
                to: '/inventory/history',
                icon: 'swap_vert',
                label: 'Stock Movements',
                sublabel: 'Audit trail',
            },
            {
                to: '/reorder-intelligence',
                icon: 'shopping_cart',
                label: 'Reorder Center',
                sublabel: 'Auto replenish',
            }
        );
    } else if (user?.role === 'Manager') {
        navItems.push(
            {
                to: '/expiry-dashboard',
                icon: 'hourglass_empty',
                label: 'Expiry Intelligence',
                sublabel: 'Risk & dead stock',
            },
            {
                to: '/medicines',
                end: true,
                icon: 'layers',
                label: 'Medicine Ledger',
                sublabel: 'Stock catalog',
            },
            {
                to: '/inventory/history',
                icon: 'swap_vert',
                label: 'Stock Movements',
                sublabel: 'Audit trail',
            },
            {
                to: '/reorder-intelligence',
                icon: 'shopping_cart',
                label: 'Reorder Center',
                sublabel: 'Auto replenish',
            }
        );
    } else if (user?.role === 'Pharmacist') {
        navItems.push(
            {
                to: '/medicines',
                end: true,
                icon: 'layers',
                label: 'Medicine Ledger',
                sublabel: 'Stock catalog',
            },
            {
                to: '/medicines/add',
                icon: 'add_circle',
                label: 'Add Medicine',
                sublabel: 'New catalog entry',
            },
            {
                to: '/inventory/transaction-new',
                icon: 'edit_note',
                label: 'New Transaction',
                sublabel: 'Record movement',
            },
            {
                to: '/inventory/history',
                icon: 'swap_vert',
                label: 'Stock Movements',
                sublabel: 'Audit trail',
            }
        );
    }

    // ── Spotlight Command Center State ──
    const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
    const [spotlightQuery, setSpotlightQuery] = useState('');
    const [spotlightMeds, setSpotlightMeds] = useState([]);
    const [isSpotlightLoading, setIsSpotlightLoading] = useState(false);
    const [spotlightSelectedIndex, setSpotlightSelectedIndex] = useState(0);

    const quickActions = [
        { id: 'add-med', title: 'Add Medicine', subtitle: 'Create a new catalog entry', icon: 'add_circle', path: '/medicines/add' },
        { id: 'new-tx', title: 'New Transaction', subtitle: 'Record stock movement', icon: 'edit_note', path: '/inventory/transaction-new' },
        { id: 'exp-intel', title: 'Expiry Intelligence', subtitle: 'Risk & dead stock analysis', icon: 'hourglass_empty', path: '/expiry-dashboard' },
        { id: 'dashboard', title: 'Analytics Dashboard', subtitle: 'Operational metrics dashboard', icon: 'dashboard', path: '/dashboard' },
        { id: 'ledger', title: 'Medicine Ledger', subtitle: 'Manage stock catalog', icon: 'layers', path: '/medicines' },
        { id: 'history', title: 'Stock Movements Audit', subtitle: 'Audit log trail', icon: 'swap_vert', path: '/inventory/history' },
    ];

    const filteredActions = quickActions.filter(a =>
        a.title.toLowerCase().includes(spotlightQuery.toLowerCase()) ||
        a.subtitle.toLowerCase().includes(spotlightQuery.toLowerCase())
    );

    const filteredMeds = spotlightMeds.filter(m =>
        m.name.toLowerCase().includes(spotlightQuery.toLowerCase()) ||
        m.ndc.toLowerCase().includes(spotlightQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(spotlightQuery.toLowerCase()) ||
        (m.supplier && m.supplier.toLowerCase().includes(spotlightQuery.toLowerCase()))
    );

    const spotlightItems = [
        ...filteredActions,
        ...filteredMeds.map(m => ({
            id: m._id,
            title: m.name,
            subtitle: `${m.category} • NDC: ${m.ndc} • Stock: ${m.stock} units`,
            icon: 'medication',
            path: `/medicines/${m._id}`
        }))
    ];

    // Fetch medicines when spotlight opens
    useEffect(() => {
        if (isSpotlightOpen) {
            const fetchMeds = async () => {
                setIsSpotlightLoading(true);
                try {
                    const res = await fetch('/api/medicines');
                    if (res.ok) {
                        const data = await res.json();
                        setSpotlightMeds(data);
                    }
                } catch (err) {
                    console.error('Error fetching medicines for spotlight:', err);
                } finally {
                    setIsSpotlightLoading(false);
                }
            };
            fetchMeds();
            setSpotlightSelectedIndex(0);
            setSpotlightQuery('');
        }
    }, [isSpotlightOpen]);

    // Handle K / Ctrl+K / Cmd+K global listeners
    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            const active = document.activeElement;
            const isInput = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
            
            if (
                ((e.key === 'k' || e.key === 'K') && !isInput && !e.ctrlKey && !e.metaKey) ||
                ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey))
            ) {
                e.preventDefault();
                setIsSpotlightOpen(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, []);

    // Handle spotlight modal arrows & navigation keys
    useEffect(() => {
        if (!isSpotlightOpen || spotlightItems.length === 0) return;

        const handleModalKeys = (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSpotlightSelectedIndex(prev => (prev + 1) % spotlightItems.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSpotlightSelectedIndex(prev => (prev - 1 + spotlightItems.length) % spotlightItems.length);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                setIsSpotlightOpen(false);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const selectedItem = spotlightItems[spotlightSelectedIndex];
                if (selectedItem) {
                    navigate(selectedItem.path);
                    setIsSpotlightOpen(false);
                }
            }
        };

        window.addEventListener('keydown', handleModalKeys);
        return () => window.removeEventListener('keydown', handleModalKeys);
    }, [isSpotlightOpen, spotlightItems, spotlightSelectedIndex, navigate]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="flex w-screen h-screen overflow-hidden" style={{ background: 'var(--canvas)' }}>
            {/* ── Sidebar ── */}
            <aside
                className={`flex-shrink-0 flex flex-col h-full transition-all duration-300 ease-in-out relative z-20 ${
                    collapsed ? 'w-[60px]' : 'w-[160px]'
                }`}
                style={{
                    background: 'rgba(8, 10, 16, 0.4)',
                }}
            >
                {/* Sidebar brand glow accent */}
                <div
                    className="absolute top-0 left-0 right-0 h-48 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse at 50% -20%, rgba(0,194,204,0.08) 0%, transparent 70%)' }}
                />

                {/* Logo */}
                <div className={`flex items-center gap-2.5 px-4 pt-4 pb-4 relative ${collapsed ? 'justify-center' : ''}`}>
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #00c2cc 0%, #0077a8 100%)', boxShadow: '0 0 16px rgba(0,194,204,0.2)' }}
                    >
                        <span className="material-symbols-rounded text-[#0a0d14] text-base font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                            medication
                        </span>
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-base font-black tracking-tight leading-none text-white font-serif" style={{ fontFamily: "'Lora', serif" }}>SMAART</span>
                            <span className="text-[8px] font-bold tracking-[0.18em] mt-0.5" style={{ color: 'var(--brand)', textShadow: '0 0 10px rgba(0,194,204,0.2)' }}>PHARMACY</span>
                        </div>
                    )}
                </div>

                {/* Nav Items */}
                <nav className="flex-1 flex flex-col gap-0.5 px-2 overflow-y-auto scrollable">
                    {!collapsed && (
                        <span className="text-[8px] font-bold uppercase tracking-[0.12em] px-2.5 pb-1.5" style={{ color: 'var(--text-muted)' }}>
                            Navigation
                        </span>
                    )}

                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            title={collapsed ? item.label : undefined}
                            className={({ isActive }) =>
                                `group flex items-center gap-2.5 rounded-lg transition-all duration-200 relative ${
                                    collapsed ? 'justify-center px-0 py-2.5' : 'px-2.5 py-1.5'
                                } ${
                                    isActive
                                        ? 'text-[#00e1f0]'
                                        : 'hover:text-[var(--text-primary)]'
                                }`
                            }
                            style={({ isActive }) => ({
                                background: isActive ? 'rgba(0, 194, 204, 0.08)' : 'transparent',
                                color: isActive ? '#00e1f0' : 'var(--text-secondary)',
                            })}
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <div
                                            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                                            style={{ background: '#00c2cc', boxShadow: '0 0 8px rgba(0,194,204,0.8)' }}
                                        />
                                    )}
                                    <div className="relative flex-shrink-0">
                                        <span
                                            className="material-symbols-rounded flex-shrink-0 transition-all"
                                            style={{
                                                fontSize: '18px',
                                                fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                                            }}
                                        >
                                            {item.icon}
                                        </span>
                                        {collapsed && item.to === '/dashboard' && unreadCount > 0 && (
                                            <div className="absolute -top-1.5 -right-1.5 w-2 h-2 rounded-full bg-red-500 border border-[#0a0d14] animate-pulse" />
                                        )}
                                    </div>
                                    {!collapsed && (
                                        <div className="flex-1 flex items-center justify-between min-w-0 pr-1">
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-xs font-semibold truncate leading-tight">{item.label}</span>
                                                <span className="text-[9px] truncate leading-tight opacity-60">{item.sublabel}</span>
                                            </div>
                                            {item.to === '/dashboard' && unreadCount > 0 && (
                                                <span className="flex-shrink-0 ml-1.5 w-4 h-4 rounded-full bg-red-500 text-[9px] font-black text-white flex items-center justify-center animate-pulse">
                                                    {unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom collapse toggle */}
                <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    {/* User card */}
                    {!collapsed && (
                        <div className="rounded-xl p-3 mb-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="flex items-center gap-2.5">
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                                    style={{ background: 'linear-gradient(135deg, #00c2cc20, #007db830)', color: '#00c2cc', border: '1px solid rgba(0,194,204,0.2)' }}
                                >
                                    {user?.username?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user?.username}</span>
                                    <span className="text-[10px] truncate capitalize" style={{ color: '#00c2cc' }}>{user?.role}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl transition-all duration-200 text-xs font-medium cursor-pointer"
                            style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                        >
                            <span className="material-symbols-rounded text-base">
                                {collapsed ? 'chevron_right' : 'chevron_left'}
                            </span>
                            {!collapsed && <span>Collapse</span>}
                        </button>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl transition-all duration-200 text-xs font-medium cursor-pointer"
                            style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248, 113, 113, 0.06)'; e.currentTarget.style.borderColor = 'rgba(248, 113, 113, 0.15)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}
                        >
                            <span className="material-symbols-rounded text-base">logout</span>
                            {!collapsed && <span>Sign Out</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* ── Main Area ── */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative" style={{ background: 'var(--canvas)' }}>

                {/* ── Top Header Bar ── */}
                <header
                    className="flex-shrink-0 flex items-center justify-between px-6 h-16 relative z-30 border-b border-white/[0.05]"
                    style={{ 
                        background: 'rgba(10, 15, 29, 0.45)', 
                        backdropFilter: 'blur(12px)', 
                        WebkitBackdropFilter: 'blur(12px)' 
                    }}
                >
                    <div className="flex flex-col">
                        <h1 className="text-lg font-bold tracking-tight text-white" style={{ fontFamily: "'Lora', serif" }}>{pageMeta.title}</h1>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{pageMeta.sub}</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Live status pill */}
                        <div
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300"
                            style={{ 
                                background: 'rgba(0,194,204,0.08)', 
                                border: '1px solid rgba(0,194,204,0.22)', 
                                color: '#00c2cc',
                                boxShadow: '0 0 10px rgba(0,194,204,0.05)'
                            }}
                        >
                            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#00c2cc', boxShadow: '0 0 8px rgba(0,194,204,0.8)' }} />
                            <span>Live</span>
                        </div>

                        {/* Pharmacy name pill or Branch Switcher for Admin */}
                        {user?.role === 'Admin' && branches.length > 0 ? (
                            <div
                                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300"
                                style={{ 
                                    background: 'rgba(15,20,32,0.85)', 
                                    border: '1px solid rgba(0,194,204,0.25)', 
                                    color: 'var(--text-secondary)',
                                    boxShadow: '0 0 10px rgba(0,194,204,0.05)'
                                }}
                            >
                                <span className="material-symbols-rounded text-sm" style={{ color: 'var(--brand)' }}>storefront</span>
                                <select
                                    value={activeBranch?.id || ''}
                                    onChange={(e) => {
                                        const selected = branches.find(b => b.pharmacyId === e.target.value);
                                        if (selected) {
                                            switchBranch(selected.pharmacyId, selected.name);
                                        }
                                    }}
                                    className="bg-transparent border-none outline-none text-white font-medium cursor-pointer py-1 pr-1 text-xs"
                                >
                                    {branches.map(b => (
                                        <option key={b.pharmacyId} value={b.pharmacyId} className="bg-[#0f1420] text-white">
                                            {b.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300"
                                style={{ 
                                    background: 'rgba(255,255,255,0.03)', 
                                    border: '1px solid rgba(255,255,255,0.07)', 
                                    color: 'var(--text-secondary)',
                                    boxShadow: '0 0 10px rgba(255,255,255,0.02)'
                                }}
                            >
                                <span className="material-symbols-rounded text-sm" style={{ color: 'var(--brand)' }}>storefront</span>
                                <span>{activeBranch?.name || user?.pharmacy?.name || 'Pharmacy'}</span>
                            </div>
                        )}
                    </div>
                </header>

                {/* ── Page Content ── */}
                <main className="flex-1 overflow-y-auto scrollable p-6 animate-fade-in relative z-10">
                    <Outlet />
                </main>
            </div>

            {/* ── Spotlight Command Center Modal ── */}
            {isSpotlightOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4"
                    style={{ background: 'rgba(10, 15, 29, 0.7)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
                    onClick={() => setIsSpotlightOpen(false)}
                >
                    <div 
                        className="w-full max-w-xl rounded-2xl overflow-hidden glass-elevated border border-white/[0.08] shadow-2xl animate-slide-up relative z-10"
                        style={{ background: 'rgba(20, 25, 41, 0.9)' }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Search bar inside modal */}
                        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.06] relative">
                            <span className="material-symbols-rounded text-[#00e5ff] text-xl">search</span>
                            <input
                                type="text"
                                className="flex-1 bg-transparent border-0 outline-none text-sm text-white placeholder-white/40 font-medium"
                                placeholder="Search medicines, NDC, categories, or actions..."
                                value={spotlightQuery}
                                onChange={e => {
                                    setSpotlightQuery(e.target.value);
                                    setSpotlightSelectedIndex(0);
                                }}
                                autoFocus
                            />
                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono tracking-wider font-semibold text-white/50">
                                ESC
                            </div>
                        </div>

                        {/* List of items */}
                        <div className="max-h-[350px] overflow-y-auto scrollable py-2">
                            {isSpotlightLoading ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-2 text-white/40">
                                    <span className="w-5 h-5 border-2 border-[#00e5ff] border-t-transparent rounded-full animate-spin" />
                                    <span className="text-xs">Fetching catalog items...</span>
                                </div>
                            ) : spotlightItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-white/40 gap-2">
                                    <span className="material-symbols-rounded text-3xl">search_off</span>
                                    <span className="text-xs">No matching entries found</span>
                                </div>
                            ) : (
                                <div>
                                    {/* Quick Actions Header if there are actions */}
                                    {spotlightItems.some(i => i.id && quickActions.some(qa => qa.id === i.id)) && (
                                        <div className="text-[10px] font-bold uppercase tracking-wider px-4 py-1 text-white/30">
                                            Quick Actions
                                        </div>
                                    )}
                                    {spotlightItems.map((item, index) => {
                                        const isSelected = index === spotlightSelectedIndex;
                                        const isMed = !quickActions.some(qa => qa.id === item.id);
                                        
                                        // Show section header for Medicine if it's the first medicine in the list
                                        const isFirstMed = isMed && (index === 0 || !spotlightMeds.some(m => m._id === spotlightItems[index - 1].id));

                                        return (
                                            <React.Fragment key={item.id}>
                                                {isFirstMed && (
                                                    <div className="text-[10px] font-bold uppercase tracking-wider px-4 py-1 mt-2 text-white/30">
                                                        Medicines
                                                    </div>
                                                )}
                                                <div
                                                    className="flex items-center justify-between px-4 py-2.5 mx-2 my-0.5 rounded-xl cursor-pointer transition-all duration-150"
                                                    style={{
                                                        background: isSelected ? 'rgba(0, 229, 255, 0.08)' : 'transparent',
                                                        border: isSelected ? '1px solid rgba(0, 229, 255, 0.15)' : '1px solid transparent',
                                                    }}
                                                    onClick={() => {
                                                        navigate(item.path);
                                                        setIsSpotlightOpen(false);
                                                    }}
                                                    onMouseEnter={() => setSpotlightSelectedIndex(index)}
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div 
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                                            style={{ 
                                                                background: isSelected ? 'rgba(0, 229, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                                                                border: isSelected ? '1px solid rgba(0, 229, 255, 0.25)' : '1px solid rgba(255, 255, 255, 0.05)',
                                                                color: isSelected ? '#00e5ff' : 'var(--text-secondary)'
                                                            }}
                                                        >
                                                            <span className="material-symbols-rounded text-base font-bold">
                                                                {item.icon}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span 
                                                                className="text-xs font-bold leading-none truncate"
                                                                style={{ color: isSelected ? '#00e5ff' : 'var(--text-primary)' }}
                                                            >
                                                                {item.title}
                                                            </span>
                                                            <span className="text-[10px] leading-tight truncate text-white/50 mt-1">
                                                                {item.subtitle}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {isSelected && (
                                                        <span className="material-symbols-rounded text-xs text-[#00e5ff] animate-pulse">
                                                            keyboard_return
                                                        </span>
                                                    )}
                                                </div>
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer / Shortcut Help */}
                        <div className="flex items-center justify-between px-4 py-2 bg-black/20 border-t border-white/[0.04] text-[10px] text-white/40">
                            <div className="flex items-center gap-1.5">
                                <span>Navigate:</span>
                                <span className="px-1 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono">↑↓</span>
                                <span>Select:</span>
                                <span className="px-1 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono">⏎ Enter</span>
                            </div>
                            <div>
                                <span>Close:</span>
                                <span className="px-1 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono">ESC</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Spotlight Toggle Button */}
            <button
                onClick={() => setIsSpotlightOpen(true)}
                className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full flex items-center justify-center glass border border-[#00c2cc]/20 shadow-lg shadow-[#00c2cc]/10 hover:border-[#00e5ff]/50 hover:shadow-[#00e5ff]/20 transition-all duration-300 group cursor-pointer"
                style={{
                    background: 'rgba(15, 20, 32, 0.85)',
                    backdropFilter: 'blur(8px)'
                }}
                title="Command Center (Ctrl+K / K)"
            >
                {/* Outer pulsing shadow glow ring */}
                <span className="absolute inset-0 rounded-full bg-[#00e5ff]/5 scale-100 group-hover:scale-120 group-hover:bg-[#00e5ff]/10 transition-all duration-500 animate-pulse" />
                <span className="material-symbols-rounded text-[#00e5ff] text-lg font-bold group-hover:scale-110 transition-all duration-300">
                    terminal
                </span>
            </button>
        </div>
    );
}
