import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AddPurchaseOrder() {
    const { user, activeBranch } = useAuth();
    const navigate = useNavigate();

    // Data States
    const [suppliers, setSuppliers] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form inputs
    const [supplierId, setSupplierId] = useState('');
    const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
    const [notes, setNotes] = useState('');
    const [status, setStatus] = useState('Draft');
    const [poItems, setPoItems] = useState([{ medicineId: '', quantity: 100, unitCost: 0 }]);
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                // Fetch suppliers
                const supUrl = activeBranch?.id ? `/api/suppliers?filter=Active&branchId=${activeBranch.id}` : '/api/suppliers?filter=Active';
                const supRes = await fetch(supUrl);
                if (supRes.ok) {
                    const supData = await supRes.json();
                    setSuppliers(supData);
                }

                // Fetch medicines
                const medUrl = activeBranch?.id ? `/api/medicines?branchId=${activeBranch.id}` : '/api/medicines';
                const medRes = await fetch(medUrl);
                if (medRes.ok) {
                    const medData = await medRes.json();
                    setMedicines(medData.medicines || medData || []);
                }
            } catch (err) {
                console.error("Failed to load initial data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [activeBranch]);

    const handleAddItemRow = () => {
        setPoItems([...poItems, { medicineId: '', quantity: 100, unitCost: 0 }]);
    };

    const handleRemoveItemRow = (index) => {
        if (poItems.length === 1) return;
        const newItems = [...poItems];
        newItems.splice(index, 1);
        setPoItems(newItems);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...poItems];
        newItems[index][field] = value;

        // Auto-fill Unit Cost if medicineId selection changes
        if (field === 'medicineId') {
            const med = medicines.find(m => m._id === value);
            if (med) {
                newItems[index].unitCost = med.supplierCost || 0;
            }
        }
        setPoItems(newItems);
    };

    const calculateGrandTotal = () => {
        return poItems.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitCost)), 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        
        if (!supplierId || poItems.some(item => !item.medicineId || item.quantity <= 0)) {
            setFormError('Supplier and valid medicine rows are required.');
            return;
        }

        setSubmitting(true);
        try {
            const url = activeBranch?.id ? `/api/purchase-orders?branchId=${activeBranch.id}` : '/api/purchase-orders';
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    supplierId,
                    expectedDeliveryDate,
                    status,
                    notes,
                    medicines: poItems.map(item => ({
                        medicineId: item.medicineId,
                        quantity: Number(item.quantity),
                        unitCost: Number(item.unitCost)
                    }))
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Failed to generate PO.');
            }

            navigate('/purchase-orders');
        } catch (err) {
            setFormError(err.message);
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center h-full">
                <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
                <p className="mt-4 text-[var(--text-secondary)] font-mono animate-pulse">Loading form data...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--bg-primary)]">
            <div className="px-8 py-6 border-b border-[var(--card-border)] bg-[var(--bg-secondary)] flex justify-between items-center z-10 sticky top-0">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/purchase-orders')}
                        className="w-10 h-10 rounded-xl bg-[var(--bg-primary)] border border-[var(--card-border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-cyan-400 hover:border-cyan-400 transition-all shadow-sm cursor-pointer"
                    >
                        <span className="material-symbols-rounded">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text-primary)] font-serif">Create Purchase Order</h1>
                        <p className="text-sm text-[var(--text-muted)] mt-1">Generate a new procurement order for suppliers</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-5xl mx-auto">
                    <form onSubmit={handleSubmit} className="premium-card p-8 flex flex-col gap-6 animate-slide-up">
                        <div className="flex items-center gap-3 border-b border-[var(--card-border)] pb-4 mb-2">
                            <span className="material-symbols-rounded text-cyan-400">add_shopping_cart</span>
                            <h2 className="text-lg font-bold text-[var(--text-primary)] font-serif">Order Details</h2>
                        </div>
                        
                        {formError && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold font-mono flex items-center gap-2">
                                <span className="material-symbols-rounded text-sm">warning</span> {formError}
                            </div>
                        )}

                        {/* Supplier & Expected Date */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase font-bold text-[var(--text-secondary)]">Select Supplier *</label>
                                <select 
                                    required value={supplierId} onChange={(e) => setSupplierId(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-xl text-sm text-[var(--text-primary)] outline-none focus:border-cyan-400 transition-colors cursor-pointer"
                                >
                                    <option value="">-- Choose Vendor --</option>
                                    {suppliers.map(s => (
                                        <option key={s._id} value={s._id}>{s.name} (Health Score: {s.healthScore})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase font-bold text-[var(--text-secondary)]">Expected Delivery *</label>
                                <input 
                                    type="date" required
                                    value={expectedDeliveryDate} onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-xl text-sm text-[var(--text-primary)] outline-none focus:border-cyan-400 transition-colors"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase font-bold text-[var(--text-secondary)]">Initial Status</label>
                                <select 
                                    value={status} onChange={(e) => setStatus(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-xl text-sm text-[var(--text-primary)] outline-none focus:border-cyan-400 transition-colors cursor-pointer"
                                >
                                    <option value="Draft">Draft</option>
                                    <option value="Pending Approval">Pending Approval</option>
                                    {user?.role === 'Admin' && (
                                        <>
                                            <option value="Ordered">Ordered</option>
                                            <option value="In Transit">In Transit</option>
                                        </>
                                    )}
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 border-b border-[var(--card-border)] pb-4 mt-6 mb-2 justify-between">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-rounded text-cyan-400">medication</span>
                                <h2 className="text-lg font-bold text-[var(--text-primary)] font-serif">Medicine Items List</h2>
                            </div>
                            <button 
                                type="button" onClick={handleAddItemRow}
                                className="px-4 py-2 rounded-lg bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400/20 text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-rounded text-sm">add</span> Add Medicine
                            </button>
                        </div>

                        {/* Dynamic Medicine Rows */}
                        <div className="flex flex-col gap-4 bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--card-border)]">
                            <div className="grid grid-cols-[1fr_100px_120px_100px_40px] gap-4 px-2 pb-2 border-b border-[var(--card-border)] text-xs uppercase font-bold text-[var(--text-secondary)]">
                                <div>Medicine</div>
                                <div className="text-center">Quantity</div>
                                <div className="text-right">Unit Cost (₹)</div>
                                <div className="text-right">Total (₹)</div>
                                <div></div>
                            </div>
                            
                            <div className="flex flex-col gap-3">
                                {poItems.map((item, idx) => (
                                    <div key={idx} className="grid grid-cols-[1fr_100px_120px_100px_40px] gap-4 items-center">
                                        <select 
                                            required value={item.medicineId} 
                                            onChange={(e) => handleItemChange(idx, 'medicineId', e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] text-sm text-[var(--text-primary)] outline-none focus:border-cyan-400 transition-colors"
                                        >
                                            <option value="">-- Select Medicine --</option>
                                            {medicines.map(m => (
                                                <option key={m._id} value={m._id}>{m.name} (Stock: {m.stock})</option>
                                            ))}
                                        </select>

                                        <input 
                                            type="number" required min="1" placeholder="Qty"
                                            value={item.quantity} onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] text-sm text-[var(--text-primary)] outline-none text-center focus:border-cyan-400 transition-colors"
                                        />

                                        <input 
                                            type="number" required min="0" step="0.01" placeholder="Unit Cost"
                                            value={item.unitCost} onChange={(e) => handleItemChange(idx, 'unitCost', e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] text-sm text-[var(--text-primary)] outline-none text-right font-mono focus:border-cyan-400 transition-colors"
                                        />

                                        <span className="w-full text-right text-sm font-bold text-[var(--text-primary)] font-mono">
                                            {(item.quantity * item.unitCost).toFixed(2)}
                                        </span>

                                        <button 
                                            type="button" onClick={() => handleRemoveItemRow(idx)}
                                            className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer disabled:opacity-40 transition-colors"
                                            disabled={poItems.length === 1}
                                        >
                                            <span className="material-symbols-rounded text-sm">delete</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mt-4">
                            <div className="flex-1 w-full flex flex-col gap-2">
                                <label className="text-xs uppercase font-bold text-[var(--text-secondary)]">Procurement Notes</label>
                                <textarea 
                                    rows="2" placeholder="E.g. standard monthly stock reorder"
                                    value={notes} onChange={(e) => setNotes(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-xl text-sm text-[var(--text-primary)] outline-none focus:border-cyan-400 transition-colors resize-none"
                                />
                            </div>
                            
                            <div className="p-4 rounded-xl bg-cyan-400/5 border border-cyan-400/20 flex flex-col items-end min-w-[250px]">
                                <span className="text-xs uppercase font-bold text-[var(--text-secondary)] mb-1">Grand Total</span>
                                <span className="text-3xl font-black text-cyan-400 font-mono">
                                    ₹{calculateGrandTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-[var(--card-border)]">
                            <button 
                                type="button" 
                                onClick={() => navigate('/purchase-orders')}
                                className="px-6 py-3 rounded-xl text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                disabled={submitting}
                                className="px-8 py-3 rounded-xl text-sm font-bold text-slate-900 transition-all cursor-pointer shadow-[0_4px_24px_rgba(0,194,204,0.3)] hover:shadow-[0_4px_32px_rgba(0,194,204,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                style={{ background: 'linear-gradient(135deg, #00B4D8 0%, #0099a8 100%)' }}
                            >
                                {submitting ? (
                                    <>
                                        <span className="material-symbols-rounded animate-spin">progress_activity</span>
                                        Confirming Order...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-rounded">check_circle</span>
                                        Confirm Order
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
