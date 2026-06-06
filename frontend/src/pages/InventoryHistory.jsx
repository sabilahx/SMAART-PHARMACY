import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function InventoryHistory() {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('All'); // 'All', 'Stock In', 'Stock Out', 'Adjustment', 'Expired', 'Archived'

    const fetchHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            let url = '/api/inventory/history';
            if (typeFilter !== 'All') {
                url += `?transactionType=${typeFilter}`;
            }
            const res = await fetch(url);
            if (!res.ok) {
                if (res.status === 401) {
                    navigate('/login');
                    return;
                }
                throw new Error('Failed to load stock movements history ledger.');
            }
            const data = await res.json();
            setTransactions(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [typeFilter]);

    // Client-side search filtering
    const filteredTransactions = transactions.filter(t => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;
        
        const medName = t.medicineId?.name.toLowerCase() || '';
        const medNdc = t.medicineId?.ndc || '';
        const clerk = t.userId?.username.toLowerCase() || '';
        const note = t.notes?.toLowerCase() || '';
        const batch = t.batchNumber?.toLowerCase() || '';
        const supplier = t.supplier?.toLowerCase() || '';
        const reason = t.reason?.toLowerCase() || '';

        return medName.includes(query) || 
               medNdc.includes(query) || 
               clerk.includes(query) || 
               note.includes(query) ||
               batch.includes(query) ||
               supplier.includes(query) ||
               reason.includes(query);
    });

    const getTypeStyles = (type) => {
        switch (type) {
            case 'Stock In': return 'text-teal-600 bg-teal-50 border-teal-100/50';
            case 'Stock Out': return 'text-sky-600 bg-sky-50 border-sky-100/50';
            case 'Adjustment': return 'text-purple-600 bg-purple-50 border-purple-100/50';
            case 'Expired': return 'text-amber-600 bg-amber-50 border-amber-100/50';
            case 'Archived':
            default:
                return 'text-slate-400 bg-slate-100 border-slate-200/50';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'Stock In': return 'add_circle';
            case 'Stock Out': return 'remove_circle';
            case 'Adjustment': return 'published_with_changes';
            case 'Expired': return 'report';
            case 'Archived':
            default:
                return 'archive';
        }
    };

    return (
        <div className="flex flex-col gap-8 max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col">
                    <h2 className="text-xl font-bold text-slate-800 font-title">Stock Movements</h2>
                    <p className="text-xs text-slate-400 mt-1">Audit log of every stock transaction, adjustment, and status shift.</p>
                </div>
                <button 
                    onClick={() => navigate('/inventory/transaction-new')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white font-bold text-xs rounded-xl hover:bg-teal-500 active:bg-teal-700 transition-all cursor-pointer shadow-md shadow-teal-500/10"
                >
                    <span className="material-symbols-rounded text-sm">swap_horiz</span>
                    <span>New Transaction</span>
                </button>
            </div>

            {/* Filter & Search Panel */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                    <span className="material-symbols-rounded absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                    <input 
                        type="text" 
                        placeholder="Search medicine, user, batch, supplier..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all shadow-inner shadow-slate-100"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Type Filter Buttons */}
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 w-full md:w-auto overflow-x-auto shadow-inner">
                    {['All', 'Stock In', 'Stock Out', 'Adjustment', 'Expired', 'Archived'].map(filter => (
                        <button
                            key={filter}
                            onClick={() => setTypeFilter(filter)}
                            className={`flex-grow md:flex-grow-0 px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                                typeFilter === filter 
                                    ? 'bg-white text-teal-700 shadow-sm border border-slate-200/40' 
                                        : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Movements History List Table */}
            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20 text-slate-400 font-medium gap-3">
                        <span className="material-symbols-rounded animate-spin text-2xl text-teal-500">sync</span>
                        <span className="text-xs">Loading transaction trail logs...</span>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center p-20 text-red-500 font-medium gap-3 bg-white">
                        <span className="material-symbols-rounded text-2xl text-red-400">error</span>
                        <span className="text-xs">{error}</span>
                        <button onClick={fetchHistory} className="mt-4 px-4 py-2 bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs hover:bg-slate-200 cursor-pointer">Retry</button>
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 text-slate-400 gap-3">
                        <span className="material-symbols-rounded text-4xl text-slate-350">history</span>
                        <div className="text-center">
                            <span className="text-xs font-bold text-slate-700 block">No Transactions Recorded</span>
                            <span className="text-[10px] text-slate-400 mt-1 block">Post a new transaction or clear filters to refresh.</span>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-150 text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/75">
                                    <th className="py-4 px-6">Timestamp</th>
                                    <th className="py-4 px-4">Medication</th>
                                    <th className="py-4 px-4">Transaction Type</th>
                                    <th className="py-4 px-4">Movement Qty</th>
                                    <th className="py-4 px-4">Authorized User</th>
                                    <th className="py-4 px-4">Reason / Notes</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {filteredTransactions.map(t => {
                                    return (
                                        <tr key={t._id} className="hover:bg-slate-50/50 transition-all">
                                            {/* Date */}
                                            <td className="py-4 px-6 text-slate-500 font-medium">
                                                {new Date(t.createdAt).toLocaleString()}
                                            </td>

                                            {/* Medicine */}
                                            <td className="py-4 px-4">
                                                {t.medicineId ? (
                                                    <div className="flex flex-col">
                                                        <span 
                                                            onClick={() => navigate(`/medicines/${t.medicineId._id}`)}
                                                            className="font-bold text-slate-800 hover:text-teal-600 hover:underline cursor-pointer transition-all"
                                                        >
                                                            {t.medicineId.name}
                                                        </span>
                                                        <span className="text-[9px] text-slate-400 font-mono mt-0.5">NDC: {t.medicineId.ndc}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 italic">Deleted Medication</span>
                                                )}
                                            </td>

                                            {/* Type Badge */}
                                            <td className="py-4 px-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold border ${getTypeStyles(t.transactionType)} shadow-sm`}>
                                                    <span className="material-symbols-rounded text-xs">{getTypeIcon(t.transactionType)}</span>
                                                    <span>{t.transactionType}</span>
                                                </span>
                                            </td>

                                            {/* Qty changed */}
                                            <td className="py-4 px-4 font-extrabold">
                                                <span className={t.quantityChanged > 0 ? 'text-teal-600' : t.quantityChanged < 0 ? 'text-red-500' : 'text-slate-400'}>
                                                    {t.quantityChanged > 0 ? `+${t.quantityChanged.toLocaleString()}` : t.quantityChanged.toLocaleString()}
                                                </span>
                                            </td>

                                            {/* User */}
                                            <td className="py-4 px-4 text-slate-600 font-bold">
                                                {t.userId?.username || 'Seed'}
                                            </td>

                                            {/* Reason / Notes */}
                                            <td className="py-4 px-4 text-slate-500 max-w-xs truncate" title={t.notes}>
                                                <div className="flex flex-col">
                                                    {t.reason && <span className="font-semibold text-slate-700 text-[10px]">{t.reason}</span>}
                                                    <span className="text-[9px] text-slate-400">{t.notes}</span>
                                                </div>
                                            </td>

                                            {/* Detail Trigger */}
                                            <td className="py-4 px-6 text-right">
                                                <button
                                                    onClick={() => navigate(`/inventory/transaction/${t._id}`)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-700 text-[10px] font-bold transition-all cursor-pointer"
                                                >
                                                    <span className="material-symbols-rounded text-xs">receipt_long</span>
                                                    <span>Receipt</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
