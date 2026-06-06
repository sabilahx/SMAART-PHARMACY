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

            // Fetch transaction history for this specific medicine
            const logsRes = await fetch(`/api/inventory/history?medicineId=${id}`);
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

    const getChangeTypeIcon = (type) => {
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

    const getChangeTypeColor = (type) => {
        switch (type) {
            case 'Stock In': return 'text-teal-600 bg-teal-50 border-teal-100/50';
            case 'Stock Out': return 'text-sky-600 bg-sky-50 border-sky-100/50';
            case 'Adjustment': return 'text-purple-600 bg-purple-50 border-purple-100/50';
            case 'Expired': return 'text-amber-600 bg-amber-50 border-amber-100/50';
            case 'Archived':
            default:
                return 'text-slate-500 bg-slate-50 border-slate-150/40';
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
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 transition-all cursor-pointer shadow-sm"
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

                    {/* Quick Stock Actions */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Inventory Management Shortcuts</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <button
                                onClick={() => navigate(`/inventory/transaction-new?medicineId=${medicine._id}&type=stock-in`)}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-500 transition-all cursor-pointer shadow-md shadow-teal-500/10"
                            >
                                <span className="material-symbols-rounded text-base">add_circle</span>
                                <span>Stock In</span>
                            </button>
                            <button
                                onClick={() => navigate(`/inventory/transaction-new?medicineId=${medicine._id}&type=stock-out`)}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-500 transition-all cursor-pointer shadow-md shadow-sky-500/10"
                            >
                                <span className="material-symbols-rounded text-base">remove_circle</span>
                                <span>Stock Out</span>
                            </button>
                            <button
                                onClick={() => navigate(`/inventory/transaction-new?medicineId=${medicine._id}&type=adjustment`)}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 hover:text-slate-800 hover:border-slate-350 transition-all cursor-pointer shadow-sm"
                            >
                                <span className="material-symbols-rounded text-base">published_with_changes</span>
                                <span>Adjust Stock</span>
                            </button>
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
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Ledger Transaction Logs</h3>
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col gap-6 max-h-[640px] overflow-y-auto shadow-sm">
                        {logs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                                <span className="material-symbols-rounded text-2xl text-slate-350">history</span>
                                <span className="text-[10px]">No transaction history logged yet.</span>
                            </div>
                        ) : (
                            <div className="relative border-l border-slate-100 ml-4 flex flex-col gap-6">
                                {logs.map((log) => (
                                    <div key={log._id} className="relative pl-6">
                                        {/* Dot/Icon indicator */}
                                        <div className={`absolute -left-3.5 top-0 w-7 h-7 rounded-lg border flex items-center justify-center text-[14px] ${getChangeTypeColor(log.transactionType)} shadow-sm`}>
                                            <span className="material-symbols-rounded">{getChangeTypeIcon(log.transactionType)}</span>
                                        </div>
                                        {/* Log Content */}
                                        <div className="flex flex-col gap-1.5 pt-0.5 animate-fadeIn">
                                            <div className="flex justify-between items-center gap-2">
                                                <span 
                                                    onClick={() => navigate(`/inventory/transaction/${log._id}`)}
                                                    className="text-[10px] font-bold text-slate-700 hover:text-teal-655 hover:underline cursor-pointer"
                                                >
                                                    {log.transactionType}
                                                </span>
                                                <span className="text-[9px] font-semibold text-slate-400">{new Date(log.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 leading-normal">{log.notes}</p>
                                            
                                            {/* Details depending on action */}
                                            <div className="text-[9px] text-slate-400 mt-1 flex items-center gap-1 bg-slate-50 p-1.5 rounded-lg border border-slate-150/50 shadow-inner">
                                                <span>Qty:</span>
                                                <span className={`font-bold ${log.quantityChanged > 0 ? 'text-teal-600' : log.quantityChanged < 0 ? 'text-red-500' : 'text-slate-500'}`}>
                                                    {log.quantityChanged > 0 ? `+${log.quantityChanged.toLocaleString()}` : log.quantityChanged.toLocaleString()}
                                                </span>
                                                {log.reason && <span>({log.reason})</span>}
                                            </div>
                                            
                                            {log.batchNumber && (
                                                <span className="text-[8px] text-slate-400 font-mono">Batch: {log.batchNumber}</span>
                                            )}

                                            <span className="text-[8px] font-bold text-slate-450 mt-0.5">By: {log.userId?.username || 'Seed'}</span>
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
