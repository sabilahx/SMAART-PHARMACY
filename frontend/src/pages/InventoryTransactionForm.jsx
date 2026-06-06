import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function InventoryTransactionForm() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    // Tab states: 'stock-in' | 'stock-out' | 'adjustment'
    const [activeTab, setActiveTab] = useState(searchParams.get('type') || 'stock-in');
    
    const [medicines, setMedicines] = useState([]);
    const [selectedMedId, setSelectedMedId] = useState(searchParams.get('medicineId') || '');
    const [selectedMed, setSelectedMed] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Form inputs
    const [formData, setFormData] = useState({
        quantity: '',
        quantityChanged: '',
        batchNumber: '',
        supplier: '',
        receivedDate: new Date().toISOString().split('T')[0],
        reason: 'Dispensed',
        adjustmentType: 'Adjustment',
        notes: ''
    });

    // Fetch tenant medicines for selection dropdown
    useEffect(() => {
        const fetchMedicines = async () => {
            try {
                const res = await fetch('/api/medicines');
                if (res.ok) {
                    const data = await res.json();
                    setMedicines(data);
                    // If medicineId was passed, find it
                    const preselectedId = searchParams.get('medicineId');
                    if (preselectedId) {
                        const found = data.find(m => m._id === preselectedId);
                        if (found) setSelectedMed(found);
                    }
                }
            } catch (err) {
                console.error('Failed to load medicines list', err);
            }
        };
        fetchMedicines();
    }, [searchParams]);

    // Handle medicine selection change
    const handleMedChange = (e) => {
        const id = e.target.value;
        setSelectedMedId(id);
        const found = medicines.find(m => m._id === id);
        setSelectedMed(found || null);
        setError(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!selectedMedId) {
            setError('Please select a medication.');
            return;
        }

        let endpoint = '';
        let bodyPayload = { medicineId: selectedMedId, notes: formData.notes };

        if (activeTab === 'stock-in') {
            const qty = Number(formData.quantity);
            if (!qty || qty <= 0) {
                setError('Please enter a valid positive quantity.');
                return;
            }
            endpoint = '/api/inventory/stock-in';
            bodyPayload = {
                ...bodyPayload,
                quantity: qty,
                batchNumber: formData.batchNumber,
                supplier: formData.supplier || selectedMed.supplier,
                receivedDate: formData.receivedDate
            };
        } else if (activeTab === 'stock-out') {
            const qty = Number(formData.quantity);
            if (!qty || qty <= 0) {
                setError('Please enter a valid positive quantity.');
                return;
            }
            // Business Rule Validation: No negative stock
            if (selectedMed.stock < qty) {
                setError(`Deduction rejected. Current available stock is ${selectedMed.stock} units, which is less than requested ${qty} units.`);
                return;
            }
            endpoint = '/api/inventory/stock-out';
            bodyPayload = {
                ...bodyPayload,
                quantity: qty,
                reason: formData.reason
            };
        } else {
            // Adjustment
            const qtyChange = Number(formData.quantityChanged);
            if (!qtyChange || qtyChange === 0) {
                setError('Please enter a non-zero adjustment quantity (e.g. +50 or -20).');
                return;
            }
            // Business Rule Validation: No negative stock
            if (selectedMed.stock + qtyChange < 0) {
                setError(`Adjustment rejected. Resulting stock (${selectedMed.stock + qtyChange}) cannot be negative.`);
                return;
            }
            endpoint = '/api/inventory/adjustment';
            bodyPayload = {
                ...bodyPayload,
                quantityChanged: qtyChange,
                transactionType: formData.adjustmentType,
                reason: formData.reason || 'Manual check correction'
            };
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyPayload)
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Transaction submission failed');
            }
            navigate('/inventory/history');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Calculate simulated results
    const getSimulatedStock = () => {
        if (!selectedMed) return null;
        if (activeTab === 'stock-in') {
            const qty = Number(formData.quantity) || 0;
            return selectedMed.stock + qty;
        } else if (activeTab === 'stock-out') {
            const qty = Number(formData.quantity) || 0;
            return selectedMed.stock - qty;
        } else {
            const qty = Number(formData.quantityChanged) || 0;
            return selectedMed.stock + qty;
        }
    };

    const simulatedStock = getSimulatedStock();

    return (
        <div className="max-w-2xl mx-auto flex flex-col gap-8">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <span className="hover:text-slate-600 cursor-pointer" onClick={() => navigate('/inventory/history')}>Movements Log</span>
                    <span className="material-symbols-rounded text-sm">chevron_right</span>
                    <span className="text-slate-600">Register Movement</span>
                </div>
                <h2 className="text-xl font-bold text-slate-800 font-title mt-1">Register Stock Movement</h2>
                <p className="text-xs text-slate-400">Post transaction entries to track inbound, outbound, or adjustment transactions.</p>
            </div>

            {/* Form tabs */}
            <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-2xl shadow-inner w-full">
                {[
                    { id: 'stock-in', label: 'Stock In', icon: 'add_circle' },
                    { id: 'stock-out', label: 'Stock Out', icon: 'remove_circle' },
                    { id: 'adjustment', label: 'Adjustment', icon: 'published_with_changes' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id);
                            setError(null);
                        }}
                        className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            activeTab === tab.id
                                ? 'bg-white text-teal-700 shadow-sm border border-slate-200/40'
                                : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        <span className="material-symbols-rounded text-base">{tab.icon}</span>
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Error Banner */}
            {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">
                    <span className="material-symbols-rounded text-sm mt-0.5">report</span>
                    <span>{error}</span>
                </div>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-sm">
                
                {/* Select Medicine */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Select Medication *</label>
                    <select
                        value={selectedMedId}
                        onChange={handleMedChange}
                        className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs text-slate-700 focus:outline-none focus:border-teal-500 focus:bg-white transition-all shadow-sm"
                    >
                        <option value="">-- Click to Select Medication --</option>
                        {medicines.map(m => (
                            <option key={m._id} value={m._id}>
                                {m.name} (NDC: {m.ndc})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Simulated Ledger details display */}
                {selectedMed && (
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-150 p-4 rounded-xl shadow-inner text-xs">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Current Stock Ledger</span>
                            <span className="font-bold text-slate-700 text-sm">{selectedMed.stock.toLocaleString()} units</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Simulated New Level</span>
                            <span className={`font-extrabold text-sm ${simulatedStock < 0 ? 'text-red-500' : 'text-teal-600'}`}>
                                {simulatedStock !== null ? `${simulatedStock.toLocaleString()} units` : '--'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Conditional Fields depending on activeTab */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-6">
                    {activeTab === 'stock-in' && (
                        <>
                            {/* Quantity In */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Receive Quantity *</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleInputChange}
                                    placeholder="0"
                                    min="1"
                                    className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all shadow-inner shadow-slate-100"
                                />
                            </div>

                            {/* Batch Number */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Batch / Lot Number</label>
                                <input
                                    type="text"
                                    name="batchNumber"
                                    value={formData.batchNumber}
                                    onChange={handleInputChange}
                                    placeholder="LOT-X2838-Y"
                                    className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all shadow-inner shadow-slate-100 font-mono"
                                />
                            </div>

                            {/* Supplier */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Supplier</label>
                                <input
                                    type="text"
                                    name="supplier"
                                    value={formData.supplier}
                                    onChange={handleInputChange}
                                    placeholder="e.g. McKesson (defaults to catalog)"
                                    className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all shadow-inner shadow-slate-100"
                                />
                            </div>

                            {/* Received Date */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Receive Date</label>
                                <input
                                    type="date"
                                    name="receivedDate"
                                    value={formData.receivedDate}
                                    onChange={handleInputChange}
                                    className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs text-slate-700 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                                />
                            </div>
                        </>
                    )}

                    {activeTab === 'stock-out' && (
                        <>
                            {/* Quantity Out */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Deduct Quantity *</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleInputChange}
                                    placeholder="0"
                                    min="1"
                                    className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all shadow-inner shadow-slate-100"
                                />
                            </div>

                            {/* Reason for Stock Out */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Reason for Stock Out</label>
                                <select
                                    name="reason"
                                    value={formData.reason}
                                    onChange={handleInputChange}
                                    className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs text-slate-700 focus:outline-none focus:border-teal-500 focus:bg-white transition-all shadow-sm"
                                >
                                    <option value="Dispensed">Dispensed (Prescription)</option>
                                    <option value="Loss/Damage">Loss / Damage</option>
                                    <option value="Expired">Expired stock deduction</option>
                                    <option value="Return to Supplier">Return to Supplier</option>
                                </select>
                            </div>
                        </>
                    )}

                    {activeTab === 'adjustment' && (
                        <>
                            {/* Quantity Adjustment (+/-) */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Adjustment Quantity *</label>
                                <input
                                    type="number"
                                    name="quantityChanged"
                                    value={formData.quantityChanged}
                                    onChange={handleInputChange}
                                    placeholder="Use positive/negative (e.g. +50 or -15)"
                                    className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all shadow-inner shadow-slate-100"
                                />
                            </div>

                            {/* Adjustment Type */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Adjustment Type *</label>
                                <select
                                    name="adjustmentType"
                                    value={formData.adjustmentType}
                                    onChange={handleInputChange}
                                    className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs text-slate-700 focus:outline-none focus:border-teal-500 focus:bg-white transition-all shadow-sm"
                                >
                                    <option value="Adjustment">Manual adjustment correction</option>
                                    <option value="Expired">Expired medication waste</option>
                                    <option value="Archived">Archived record status change</option>
                                </select>
                            </div>

                            {/* Reason details */}
                            <div className="flex flex-col gap-1.5 md:col-span-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Deduction / Correction Reason</label>
                                <input
                                    type="text"
                                    name="reason"
                                    value={formData.reason}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Inventory check count mismatch, Broken vial"
                                    className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all shadow-inner shadow-slate-100"
                                />
                            </div>
                        </>
                    )}

                    {/* Common Notes Field */}
                    <div className="flex flex-col gap-1.5 md:col-span-2 border-t border-slate-100 pt-6">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Transaction audit notes</label>
                        <textarea
                            name="notes"
                            rows="3"
                            value={formData.notes}
                            onChange={handleInputChange}
                            placeholder="Add additional remarks for ledger records..."
                            className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all shadow-inner shadow-slate-100 resize-none"
                        ></textarea>
                    </div>
                </div>

                {/* Form buttons */}
                <div className="flex justify-end gap-3 mt-6 border-t border-slate-100 pt-6">
                    <button
                        type="button"
                        onClick={() => navigate('/inventory/history')}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-sm shadow-slate-100"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 text-white font-bold text-xs rounded-xl hover:bg-teal-500 active:bg-teal-700 disabled:opacity-50 shadow-md shadow-teal-500/10 transition-all cursor-pointer"
                    >
                        {isSubmitting && <span className="material-symbols-rounded animate-spin text-sm">sync</span>}
                        <span>Post Transaction</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
