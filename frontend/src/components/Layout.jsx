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
        <div className="flex w-screen h-screen overflow-hidden bg-slate-50 text-slate-800 font-sans">
            {/* Sidebar Navigation */}
            <aside className="w-64 bg-white border-r border-slate-200/85 flex flex-col justify-between p-6 flex-shrink-0 z-10 shadow-sm">
                <div className="flex flex-col gap-6">
                    {/* Brand logo */}
                    <div className="flex items-center gap-3 px-1">
                        <span className="material-symbols-rounded text-teal-600 text-3xl drop-shadow-[0_0_6px_rgba(13,148,136,0.15)]">bubble_chart</span>
                        <span className="font-bold text-lg tracking-tight font-title text-slate-800">PharmIntel</span>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="flex flex-col gap-1.5">
                        <NavLink 
                            to="/medicines" 
                            end
                            className={({ isActive }) => 
                                `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all border ${
                                    isActive 
                                        ? 'bg-teal-50 text-teal-700 border-teal-100/50 shadow-sm shadow-teal-500/5' 
                                        : 'text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-50'
                                }`
                            }
                        >
                            <span className="material-symbols-rounded text-lg">layers</span>
                            <span>Stock Ledger</span>
                        </NavLink>

                        <NavLink 
                            to="/medicines/add" 
                            className={({ isActive }) => 
                                `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all border ${
                                    isActive 
                                        ? 'bg-teal-50 text-teal-700 border-teal-100/50 shadow-sm shadow-teal-500/5' 
                                        : 'text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-50'
                                }`
                            }
                        >
                            <span className="material-symbols-rounded text-lg">add_box</span>
                            <span>Add Medication</span>
                        </NavLink>

                        <NavLink 
                            to="/inventory/history" 
                            className={({ isActive }) => 
                                `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all border ${
                                    isActive 
                                        ? 'bg-teal-50 text-teal-700 border-teal-100/50 shadow-sm shadow-teal-500/5' 
                                        : 'text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-50'
                                }`
                            }
                        >
                            <span className="material-symbols-rounded text-lg">history</span>
                            <span>Stock Movements</span>
                        </NavLink>
                    </nav>
                </div>

                {/* Footer and Role details */}
                <div className="border-t border-slate-100 pt-6 flex flex-col gap-4">
                    <div className="flex items-center gap-3 px-1">
                        <span className="material-symbols-rounded text-slate-400 text-3xl">account_circle</span>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-xs font-bold text-slate-700 truncate">{user?.username}</span>
                            <span className="text-[10px] text-slate-400 truncate">{user?.pharmacy?.name}</span>
                            <span className="text-[9px] text-teal-600 font-bold tracking-wide uppercase mt-0.5">{user?.role}</span>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-sm shadow-slate-100"
                    >
                        <span className="material-symbols-rounded text-sm">logout</span>
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Workspace Frame */}
            <div className="flex-grow flex flex-col h-full overflow-hidden bg-slate-50">
                {/* Global Header */}
                <header className="h-20 bg-white border-b border-slate-200/80 flex items-center justify-between px-10 flex-shrink-0 shadow-sm shadow-slate-100">
                    <div className="flex flex-col">
                        <h1 className="text-base font-bold text-slate-800 font-title">Pharmacy Management System</h1>
                        <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Active Store: {user?.pharmacy?.name}</p>
                    </div>
                    <div className="flex items-center gap-2.5 px-3 py-1.5 bg-teal-50/70 border border-teal-100/50 rounded-lg text-[9px] font-bold text-teal-700 tracking-wider shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                        <span>SECURE VAULT ACTIVE</span>
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
