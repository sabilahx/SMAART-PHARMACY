import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="flex w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
            {/* Sidebar Navigation */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-6 flex-shrink-0 z-10">
                <div className="flex flex-col gap-6">
                    {/* Brand Brand logo */}
                    <div className="flex items-center gap-3 px-1">
                        <span className="material-symbols-rounded text-emerald-400 text-3xl drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">bubble_chart</span>
                        <span className="font-semibold text-lg tracking-tight font-title text-slate-50">PharmIntel</span>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="flex flex-col gap-1">
                        <NavLink 
                            to="/medicines" 
                            end
                            className={({ isActive }) => 
                                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                                    isActive 
                                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' 
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                                }`
                            }
                        >
                            <span className="material-symbols-rounded text-lg">layers</span>
                            <span>Stock Ledger</span>
                        </NavLink>

                        <NavLink 
                            to="/medicines/add" 
                            className={({ isActive }) => 
                                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                                    isActive 
                                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' 
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                                }`
                            }
                        >
                            <span className="material-symbols-rounded text-lg">add_box</span>
                            <span>Add Medication</span>
                        </NavLink>
                    </nav>
                </div>

                {/* Footer and Role details */}
                <div className="border-t border-slate-800 pt-6 flex flex-col gap-4">
                    <div className="flex items-center gap-3 px-1">
                        <span className="material-symbols-rounded text-slate-500 text-3xl">account_circle</span>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-xs font-semibold text-slate-200 truncate">{user?.username}</span>
                            <span className="text-[10px] text-slate-400 truncate">{user?.pharmacy?.name}</span>
                            <span className="text-[9px] text-emerald-400 font-medium tracking-wide uppercase mt-0.5">{user?.role}</span>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-800 text-xs font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800 hover:border-slate-700 transition-all cursor-pointer"
                    >
                        <span className="material-symbols-rounded text-sm">logout</span>
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Workspace Frame */}
            <div className="flex-grow flex flex-col h-full overflow-hidden bg-slate-950">
                {/* Global Header */}
                <header className="h-20 bg-slate-900/40 border-b border-slate-800 flex items-center justify-between px-10 flex-shrink-0">
                    <div className="flex flex-col">
                        <h1 className="text-lg font-bold text-slate-50 font-title">Pharmacy Management System</h1>
                        <p className="text-xs text-slate-400 mt-0.5">Active Tenant: {user?.pharmacy?.name}</p>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-1.5 bg-emerald-950/30 border border-emerald-900/30 rounded-lg text-[10px] font-bold text-emerald-400 tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>SECURE LAYER ACTIVE</span>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-grow overflow-y-auto p-10">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
