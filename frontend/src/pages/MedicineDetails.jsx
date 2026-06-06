import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function MedicineDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [medicine, setMedicine] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch medicine details
            const detailRes = await fetch(`/api/medicines/${id}`);
            if (!detailRes.ok) {
                if (detailRes.status === 401) {
                    navigate('/login');
                    return;
                }
                throw new Error('Failed to retrieve medication details.');
            }
            const detailData = await detailRes.json();
            setMedicine(detailData);

            // Fetch audit logs
            const logsRes = await fetch(`/api/medicines/${id}/logs`);
            if (logsRes.ok) {
                const logsData = await logsRes.json();
                setLogs(logsData);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const getStatusColor = (status) => {
        if (status === 'Active') return 'text-teal-600 bg-teal-50 border-teal-150/40';
        if (status === 'Inactive') return 'text-amber-600 bg-amber-50 border-amber-150/40';
        return 'text-slate-400 bg-slate-100 border-slate-200/50';
    };

    const getChangeTypeIcon = (changeType) => {
        switch (changeType) {
            case 'Create': return 'add_circle';
            case 'StockUpdate': return 'inventory_2';
            case 'StatusChange': return 'published_with_changes';
            case 'PriceUpdate': return 'payments';
            case 'InfoUpdate':
            default: return 'info';
        }
    };

    const getChangeTypeColor = (changeType) => {
        switch (changeType) {
            case 'Create': return 'text-teal-600 bg-teal-50 border-teal-100/50';
            case 'StockUpdate': return 'text-sky-600 bg-sky-50 border-sky-100/50';
            case 'StatusChange': return 'text-amber-600 bg-amber-50 border-amber-100/50';
            case 'PriceUpdate': return 'text-purple-600 bg-purple-50 border-purple-100/50';
            case 'InfoUpdate':
            default: return 'text-slate-500 bg-slate-50 border-slate-150/40';
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-slate-400 font-medium gap-3">
                <span className="material-symbols-rounded animate-spin text-2xl text-teal-500">sync</span>
                <span className="text-xs">Loading medication details...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-red-500 font-medium gap-3 max-w-md mx-auto">
                <span className="material-symbols-rounded text-2xl text-red-400">error</span>
                <span className="text-xs text-center">{error}</span>
                <button onClick={() => navigate('/medicines')} className="mt-4 px-4 py-2 bg-slate-150 text-slate-600 border border-slate-250 rounded-xl text-xs hover:bg-slate-200 cursor-pointer">
                    Back to Ledger
                </button>
            </div>
        );
    }

    const assetValue = (medicine.stock * medicine.price).toFixed(2);

    return (
        <div className="max-w-5xl mx-auto flex flex-col gap-8">
            {/* Navigation Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-wider">
                        <span className="hover:text-slate-600 cursor-pointer" onClick={() => navigate('/medicines')}>Stock Ledger</span>
                        <span className="material-symbols-rounded text-sm">chevron_right</span>
                        <span className="text-slate-600">{medicine.name}</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 font-title mt-1">{medicine.name}</h2>
                    <p className="text-xs text-slate-400">View detailed metrics and chronological audit logs.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate('/medicines')}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-sm shadow-slate-100"
                    >
                        <span className="material-symbols-rounded text-sm">arrow_back</span>
                        <span>Back to Ledger</span>
                    </button>
                    <button 
                        onClick={() => navigate(`/medicines/edit/${medicine._id}`)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white font-bold text-xs rounded-xl hover:bg-teal-500 active:bg-teal-700 transition-all cursor-pointer shadow-md shadow-teal-500/10"
                    >
                        <span className="material-symbols-rounded text-sm">edit</span>
                        <span>Edit Details</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left side: Information Cards */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Primary stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Stock</span>
                            <span className="text-xl font-extrabold text-slate-800 mt-2">{medicine.stock.toLocaleString()}</span>
                            <span className="text-[9px] text-slate-400 mt-1">units on hand</span>
                        </div>
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unit Cost</span>
                            <span className="text-xl font-extrabold text-slate-800 mt-2">${medicine.price.toFixed(2)}</span>
                            <span className="text-[9px] text-slate-400 mt-1">USD acquisition cost</span>
                        </div>
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Value</span>
                            <span className="text-xl font-extrabold text-teal-600 mt-2">${parseFloat(assetValue).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            <span className="text-[9px] text-slate-400 mt-1">estimated asset valuation</span>
                        </div>
                    </div>

                    {/* Metadata details */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-sm">
                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-3">Medication Record Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 text-xs">
                            <div className="flex flex-col gap-1">
                                <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Medication Name</span>
                                <span className="text-slate-800 font-bold text-sm">{medicine.name}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">NDC Code</span>
                                <span className="text-slate-600 font-mono text-xs">{medicine.ndc}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Category / Class</span>
                                <span className="text-slate-700 font-semibold">{medicine.category}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Supplier</span>
                                <span className="text-slate-700 font-semibold">{medicine.supplier || 'N/A'}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Status</span>
                                <div>
                                    <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold border ${getStatusColor(medicine.status)} shadow-sm`}>
                                        {medicine.status}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Created At</span>
                                <span className="text-slate-600">{new Date(medicine.createdAt).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side: Auditing Timeline */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Inventory Audit Trail</h3>
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col gap-6 max-h-[500px] overflow-y-auto shadow-sm">
                        {logs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                                <span className="material-symbols-rounded text-2xl text-slate-350">history</span>
                                <span className="text-[10px]">No audit history found.</span>
                            </div>
                        ) : (
                            <div className="relative border-l border-slate-100 ml-4 flex flex-col gap-6">
                                {logs.map((log) => (
                                    <div key={log._id} className="relative pl-6">
                                        {/* Dot/Icon indicator */}
                                        <div className={`absolute -left-3.5 top-0 w-7 h-7 rounded-lg border flex items-center justify-center text-[14px] ${getChangeTypeColor(log.changeType)} shadow-sm`}>
                                            <span className="material-symbols-rounded">{getChangeTypeIcon(log.changeType)}</span>
                                        </div>
                                        {/* Log Content */}
                                        <div className="flex flex-col gap-1.5 pt-0.5">
                                            <div className="flex justify-between items-center gap-2">
                                                <span className="text-[10px] font-bold text-slate-700">{log.changeType}</span>
                                                <span className="text-[9px] font-semibold text-slate-400">{new Date(log.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 leading-normal">{log.notes}</p>
                                            
                                            {/* Details depending on action */}
                                            {log.changeType === 'StockUpdate' && (
                                                <div className="text-[9px] text-slate-400 mt-1 flex items-center gap-1 bg-slate-50 p-1.5 rounded-lg border border-slate-150/50 shadow-inner">
                                                    <span>Stock:</span>
                                                    <span className={`font-bold ${log.quantityChanged > 0 ? 'text-teal-600' : 'text-red-500'}`}>
                                                        {log.quantityChanged > 0 ? `+${log.quantityChanged}` : log.quantityChanged}
                                                    </span>
                                                    <span>({log.oldStock} → {log.newStock})</span>
                                                </div>
                                            )}
                                            {log.changeType === 'StatusChange' && (
                                                <div className="text-[9px] text-slate-400 mt-1 flex items-center gap-1 bg-slate-50 p-1.5 rounded-lg border border-slate-150/50 shadow-inner">
                                                    <span>Status:</span>
                                                    <span className="line-through">{log.oldStatus}</span>
                                                    <span className="material-symbols-rounded text-[9px]">arrow_right_alt</span>
                                                    <span className="font-bold text-slate-600">{log.newStatus}</span>
                                                </div>
                                            )}
                                            {log.changeType === 'PriceUpdate' && (
                                                <div className="text-[9px] text-slate-400 mt-1 flex items-center gap-1 bg-slate-50 p-1.5 rounded-lg border border-slate-150/50 shadow-inner">
                                                    <span>Cost:</span>
                                                    <span>${log.oldPrice?.toFixed(2)} → ${log.newPrice?.toFixed(2)}</span>
                                                </div>
                                            )}
                                            <span className="text-[8px] font-bold text-slate-400 mt-0.5">By: {log.userId?.username || 'System Seed'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
