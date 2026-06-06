import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function EditMedicine() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        ndc: '',
        category: 'General',
        stock: '',
        price: '',
        supplier: '',
        status: 'Active'
    });
    
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Fetch existing details
    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await fetch(`/api/medicines/${id}`);
                if (!res.ok) {
                    if (res.status === 401) {
                        navigate('/login');
                        return;
                    }
                    throw new Error('Failed to load medication record');
                }
                const data = await res.json();
                setFormData({
                    name: data.name,
                    ndc: data.ndc,
                    category: data.category || 'General',
                    stock: data.stock.toString(),
                    price: data.price.toString(),
                    supplier: data.supplier || '',
                    status: data.status || 'Active'
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!formData.name || !formData.ndc || !formData.price) {
            setError('Please fill in Name, NDC Code, and Unit Cost.');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/medicines/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    stock: Number(formData.stock),
                    price: Number(formData.price)
                })
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to update medication record');
            }
            navigate('/medicines');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusStyles = (statusVal) => {
        if (formData.status === statusVal) {
            if (statusVal === 'Active') return 'bg-teal-50 text-teal-700 border-teal-200';
            if (statusVal === 'Inactive') return 'bg-amber-50 text-amber-700 border-amber-250';
            return 'bg-slate-100 text-slate-700 border-slate-300';
        }
        return 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50 hover:text-slate-600';
    };

    return (
        <div className="max-w-2xl mx-auto flex flex-col gap-8">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <span className="hover:text-slate-600 cursor-pointer" onClick={() => navigate('/medicines')}>Stock Ledger</span>
                    <span className="material-symbols-rounded text-sm">chevron_right</span>
                    <span className="text-slate-600">Edit Medication</span>
                </div>
                <h2 className="text-xl font-bold text-slate-800 font-title mt-1">Update Medication Details</h2>
                <p className="text-xs text-slate-400">Modify properties or adjust status of this catalog listing.</p>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-20 text-slate-400 gap-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <span className="material-symbols-rounded animate-spin text-2xl text-teal-500">sync</span>
                    <span className="text-xs">Loading record details...</span>
                </div>
            ) : (
                <>
                    {/* Error Banner */}
                    {error && (
                        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">
                            <span className="material-symbols-rounded text-sm mt-0.5">report</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name */}
                            <div className="flex flex-col gap-1.5 md:col-span-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Medication Name *</label>
                                <input 
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all shadow-inner shadow-slate-100"
                                />
                            </div>

                            {/* NDC Code */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">NDC Code *</label>
                                <input 
                                    type="text"
                                    name="ndc"
                                    value={formData.ndc}
                                    onChange={handleChange}
                                    className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all font-mono shadow-inner shadow-slate-100"
                                />
                            </div>

                            {/* Category */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Category / Class</label>
                                <select 
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs text-slate-700 focus:outline-none focus:border-teal-500 focus:bg-white transition-all shadow-sm"
                                >
                                    <option value="General">General</option>
                                    <option value="Cardiovascular">Cardiovascular</option>
                                    <option value="Anti-infective">Anti-infective</option>
                                    <option value="Endocrine">Endocrine</option>
                                    <option value="Neurological">Neurological</option>
                                    <option value="Emergency">Emergency</option>
                                    <option value="Analgesic">Analgesic</option>
                                    <option value="Gastrointestinal">Gastrointestinal</option>
                                </select>
                            </div>

                            {/* Cost per unit */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Unit Cost ($) *</label>
                                <input 
                                    type="number"
                                    step="0.01"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all shadow-inner shadow-slate-100"
                                />
                            </div>

                            {/* Stock quantity */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Stock Quantity</label>
                                <input 
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all shadow-inner shadow-slate-100"
                                />
                            </div>

                            {/* Supplier */}
                            <div className="flex flex-col gap-1.5 md:col-span-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Supplier Name</label>
                                <input 
                                    type="text"
                                    name="supplier"
                                    value={formData.supplier}
                                    onChange={handleChange}
                                    className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all shadow-inner shadow-slate-100"
                                />
                            </div>

                            {/* Status controls */}
                            <div className="flex flex-col gap-1.5 md:col-span-2 border-t border-slate-100 pt-6 mt-2">
                                <label className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">Inventory Status</label>
                                <p className="text-[10px] text-slate-400 mb-1">Medicines cannot be deleted. Adjust status to manage ledger visibility.</p>
                                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1.5 w-max shadow-inner">
                                    {['Active', 'Inactive', 'Archived'].map(statusVal => (
                                        <button
                                            key={statusVal}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, status: statusVal }))}
                                            className={`px-4 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${getStatusStyles(statusVal)}`}
                                        >
                                            {statusVal}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6 border-t border-slate-100 pt-6">
                            <button 
                                type="button"
                                onClick={() => navigate('/medicines')}
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
                                <span>Save Changes</span>
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
}
