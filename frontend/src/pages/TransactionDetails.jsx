import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function TransactionDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tx, setTx] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTxDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/inventory/history?id=${id}`);
                if (!res.ok) {
                    if (res.status === 401) {
                        navigate('/login');
                        return;
                    }
                    throw new Error('Failed to load transaction details.');
                }
                const data = await res.json();
                if (data.length === 0) {
                    throw new Error('Transaction record not found.');
                }
                setTx(data[0]); // Returns as an array filtered by _id
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTxDetails();
    }, [id, navigate]);

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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-slate-400 font-medium gap-3">
                <span className="material-symbols-rounded animate-spin text-2xl text-teal-500">sync</span>
                <span className="text-xs">Loading transaction receipt...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-red-500 font-medium gap-3 max-w-md mx-auto">
                <span className="material-symbols-rounded text-2xl text-red-400">error</span>
                <span className="text-xs text-center">{error}</span>
                <button onClick={() => navigate('/inventory/history')} className="mt-4 px-4 py-2 bg-slate-150 text-slate-600 border border-slate-250 rounded-xl text-xs hover:bg-slate-200 cursor-pointer">
                    Back to History
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto flex flex-col gap-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <span className="hover:text-slate-600 cursor-pointer" onClick={() => navigate('/inventory/history')}>Movements Log</span>
                        <span className="material-symbols-rounded text-sm">chevron_right</span>
                        <span className="text-slate-600">Transaction Details</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 font-title mt-1">Transaction Receipt</h2>
                </div>
                <button 
                    onClick={() => navigate('/inventory/history')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-sm shadow-slate-100"
                >
                    <span className="material-symbols-rounded text-sm">arrow_back</span>
                    <span>Back</span>
                </button>
            </div>

            {/* Receipt Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-sm relative overflow-hidden">
                {/* Decorative border */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-teal-600 to-sky-500"></div>

                {/* Primary Tx Info */}
                <div className="flex justify-between items-start border-b border-slate-100 pb-5 mt-2">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transaction ID</span>
                        <span className="text-xs font-mono font-bold text-slate-700 mt-1">{tx._id}</span>
                        <span className="text-[10px] text-slate-400 mt-1">{new Date(tx.createdAt).toLocaleString()}</span>
                    </div>
                    <div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border ${getTypeStyles(tx.transactionType)} shadow-sm`}>
                            <span className="material-symbols-rounded text-xs">{getTypeIcon(tx.transactionType)}</span>
                            <span>{tx.transactionType}</span>
                        </span>
                    </div>
                </div>

                {/* Medication summary */}
                <div className="flex flex-col gap-1 border-b border-slate-100 pb-5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Medication Details</span>
                    {tx.medicineId ? (
                        <div className="flex flex-col gap-1 mt-1.5">
                            <span 
                                onClick={() => navigate(`/medicines/${tx.medicineId._id}`)}
                                className="font-bold text-slate-800 text-sm hover:text-teal-600 cursor-pointer hover:underline transition-all"
                            >
                                {tx.medicineId.name}
                            </span>
                            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                                <span className="font-mono text-[10px]">NDC: {tx.medicineId.ndc}</span>
                                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-md text-slate-500 font-bold uppercase tracking-wide">
                                    {tx.medicineId.category}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <span className="text-slate-400 italic text-xs mt-1.5">Medication record deleted from catalog</span>
                    )}
                </div>

                {/* Adjustment Quantity info */}
                <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl shadow-inner grid grid-cols-2 gap-4 text-xs">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Adjustment Qty</span>
                        <span className={`text-base font-extrabold ${tx.quantityChanged > 0 ? 'text-teal-600' : tx.quantityChanged < 0 ? 'text-red-500' : 'text-slate-500'}`}>
                            {tx.quantityChanged > 0 ? `+${tx.quantityChanged.toLocaleString()}` : tx.quantityChanged.toLocaleString()} units
                        </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Authorized Clerk</span>
                        <span className="text-sm font-bold text-slate-700 mt-0.5">{tx.userId?.username || 'Seed'}</span>
                    </div>
                </div>

                {/* Batch details / Supplier details if Stock In */}
                {tx.transactionType === 'Stock In' && (
                    <div className="flex flex-col gap-4 border-b border-slate-100 pb-5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Batch Tracking Metadata</span>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="flex flex-col gap-1">
                                <span className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">Batch Number</span>
                                <span className="font-mono text-slate-700 font-bold">{tx.batchNumber || 'N/A'}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">Supplier</span>
                                <span className="text-slate-700 font-semibold">{tx.supplier || 'N/A'}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">Date Received</span>
                                <span className="text-slate-600">
                                    {tx.receivedDate ? new Date(tx.receivedDate).toLocaleDateString() : new Date(tx.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reason Details if Stock Out / Adjustment */}
                {tx.transactionType !== 'Stock In' && tx.reason && (
                    <div className="flex flex-col gap-2 border-b border-slate-100 pb-5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Adjustment Reason</span>
                        <div className="bg-slate-50 border border-slate-150 p-3 rounded-lg text-xs font-semibold text-slate-700">
                            {tx.reason}
                        </div>
                    </div>
                )}

                {/* Audit notes */}
                <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Audit notes</span>
                    <p className="text-xs text-slate-500 leading-relaxed italic bg-slate-50 border border-slate-150 p-3.5 rounded-xl">
                        "{tx.notes || 'No remarks recorded.'}"
                    </p>
                </div>
            </div>
        </div>
    );
}
