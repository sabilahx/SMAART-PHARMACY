import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MedicineList() {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Active', 'Inactive', 'Archived'
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    // Fetch medicines
    const fetchMedicines = async () => {
        setLoading(true);
        setError(null);
        try {
            let url = '/api/medicines';
            // We'll fetch all matching status, or handle client-side. The API supports status parameter.
            // Let's fetch all medicines belonging to the tenant and filter on client side for smoother feel,
            // or query depending on filter selection.
            if (statusFilter !== 'All') {
                url += `?status=${statusFilter}`;
            }
            const res = await fetch(url);
            if (!res.ok) {
                if (res.status === 401) {
                    navigate('/login');
                    return;
                }
                throw new Error('Failed to fetch medicine ledger');
            }
            const data = await res.json();
            setMedicines(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedicines();
    }, [statusFilter]);

    // Client-side search and category filtering
    const filteredMedicines = medicines.filter(item => {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch = !query || 
               item.name.toLowerCase().includes(query) || 
               item.ndc.includes(query) || 
               item.category.toLowerCase().includes(query) ||
               (item.supplier && item.supplier.toLowerCase().includes(query));
        
        const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    // Compute metrics
    const totalStock = medicines.reduce((acc, curr) => acc + (curr.status !== 'Archived' ? curr.stock : 0), 0);
    const activeCount = medicines.filter(m => m.status === 'Active').length;
    const totalAssetValue = medicines.reduce((acc, curr) => acc + (curr.status !== 'Archived' ? (curr.stock * curr.price) : 0), 0);

    const getStatusStyles = (status) => {
        if (status === 'Active') return 'text-teal-600 bg-teal-50 border-teal-100/60';
        if (status === 'Inactive') return 'text-amber-600 bg-amber-50 border-amber-100/60';
        return 'text-slate-400 bg-slate-100 border-slate-200/50';
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Cardiovascular': return 'favorite';
            case 'Anti-infective': return 'coronavirus';
            case 'Endocrine': return 'opacity';
            case 'Emergency': return 'emergency';
            case 'Analgesic': return 'healing';
            case 'Neurological': return 'psychology';
            case 'Gastrointestinal': return 'bubble_chart';
            default: return 'medication';
        }
    };

    const categories = ['All', 'Cardiovascular', 'Anti-infective', 'Endocrine', 'Emergency', 'General'];

    return (
        <div className="flex flex-col gap-8 max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col">
                    <h2 className="text-xl font-bold text-slate-800 font-title">Master Stock Ledger</h2>
                    <p className="text-xs text-slate-400 mt-1">Manage active, inactive, and archived medication logs inside your store.</p>
                </div>
                <button 
                    onClick={() => navigate('/medicines/add')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white font-bold text-xs rounded-xl hover:bg-teal-500 active:bg-teal-700 transition-all cursor-pointer shadow-md shadow-teal-500/10"
                >
                    <span className="material-symbols-rounded text-sm">add</span>
                    <span>New Medication</span>
                </button>
            </div>

            {/* Metrics Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center justify-between shadow-sm">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Ledger Stock</span>
                        <span className="text-xl font-bold text-slate-800 mt-1.5">{totalStock.toLocaleString()}</span>
                        <span className="text-[9px] text-slate-400 mt-1">units of active inventory</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                        <span className="material-symbols-rounded">inventory</span>
                    </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center justify-between shadow-sm">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Catalog</span>
                        <span className="text-xl font-bold text-slate-800 mt-1.5">{activeCount}</span>
                        <span className="text-[9px] text-slate-400 mt-1">active medications items</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <span className="material-symbols-rounded">check_circle</span>
                    </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center justify-between shadow-sm">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assets valuation</span>
                        <span className="text-xl font-bold text-teal-600 mt-1.5">${totalAssetValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span className="text-[9px] text-slate-400 mt-1">estimated cumulative cost value</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                        <span className="material-symbols-rounded">payments</span>
                    </div>
                </div>
            </div>

            {/* Filter & Search Panel */}
            <div className="flex flex-col gap-5 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    {/* Search Bar */}
                    <div className="relative w-full md:w-80">
                        <span className="material-symbols-rounded absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                        <input 
                            type="text" 
                            placeholder="Search name, NDC, category..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all shadow-inner shadow-slate-100"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Status Filter selector */}
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 w-full md:w-auto overflow-x-auto shadow-inner">
                        {['All', 'Active', 'Inactive', 'Archived'].map(filter => (
                            <button
                                key={filter}
                                onClick={() => setStatusFilter(filter)}
                                className={`flex-grow md:flex-grow-0 px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                    statusFilter === filter 
                                        ? 'bg-white text-teal-700 shadow-sm border border-slate-200/40' 
                                        : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Category selectors (inspired by image category row) */}
                <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Filter by Category</span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(cat)}
                                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer whitespace-nowrap ${
                                    categoryFilter === cat
                                        ? 'bg-teal-50 text-teal-700 border-teal-200'
                                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700'
                                }`}
                            >
                                <span className="material-symbols-rounded text-sm">{getCategoryIcon(cat)}</span>
                                <span>{cat}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Ledger Cards Grid */}
            <div>
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20 text-slate-400 font-medium gap-3">
                        <span className="material-symbols-rounded animate-spin text-2xl text-teal-500">sync</span>
                        <span className="text-xs">Loading ledger records...</span>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center p-20 text-red-500 font-medium gap-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
                        <span className="material-symbols-rounded text-2xl text-red-400">error</span>
                        <span className="text-xs">{error}</span>
                        <button onClick={fetchMedicines} className="mt-4 px-4 py-2 bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs hover:bg-slate-200 cursor-pointer">Retry</button>
                    </div>
                ) : filteredMedicines.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 text-slate-400 gap-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
                        <span className="material-symbols-rounded text-4xl text-slate-300">inventory_2</span>
                        <div className="text-center">
                            <span className="text-xs font-bold text-slate-700 block">No Medication Records Found</span>
                            <span className="text-[10px] text-slate-400 mt-1 block">Try clearing filters or add a new medicine entry.</span>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredMedicines.map(item => {
                            const val = (item.stock * item.price).toFixed(2);
                            return (
                                <div key={item._id} className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-slate-350 transition-all group relative">
                                    
                                    {/* Visual Avatar container */}
                                    <div className="w-full h-32 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center relative overflow-hidden mb-4 shadow-inner">
                                        <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-teal-50/70 rounded-full blur-xl pointer-events-none group-hover:bg-teal-50/90 transition-all"></div>
                                        <span className="material-symbols-rounded text-4xl text-teal-600 drop-shadow-sm group-hover:scale-110 transition-all duration-300">
                                            {getCategoryIcon(item.category)}
                                        </span>
                                        
                                        {/* Status badge in top right */}
                                        <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[9px] font-bold border ${getStatusStyles(item.status)} shadow-sm`}>
                                            {item.status}
                                        </span>
                                    </div>

                                    {/* Metadata */}
                                    <div className="flex flex-col gap-1 mb-4">
                                        <span 
                                            onClick={() => navigate(`/medicines/${item._id}`)}
                                            className="font-bold text-slate-800 text-xs hover:text-teal-600 cursor-pointer line-clamp-1 transition-all"
                                        >
                                            {item.name}
                                        </span>
                                        <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-mono">
                                            <span>NDC:</span>
                                            <span>{item.ndc}</span>
                                        </div>
                                        <span className="text-[8px] font-bold text-slate-400 bg-slate-100 border border-slate-150 px-2 py-0.5 rounded-md self-start mt-1">
                                            {item.category}
                                        </span>
                                    </div>

                                    {/* Pricing & Stock section (inspired by Brufen card design) */}
                                    <div className="flex justify-between items-end border-t border-slate-100 pt-3">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-semibold text-slate-400">Unit Cost</span>
                                            <span className="text-sm font-extrabold text-teal-600">${item.price.toFixed(2)}</span>
                                            <span className="text-[9px] font-bold text-slate-500 mt-0.5">{item.stock.toLocaleString()} units left</span>
                                        </div>
                                        
                                        {/* Action buttons */}
                                        <div className="flex items-center gap-1">
                                            <button 
                                                onClick={() => navigate(`/medicines/${item._id}`)}
                                                title="View Details"
                                                className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 flex items-center justify-center transition-all cursor-pointer"
                                            >
                                                <span className="material-symbols-rounded text-sm">visibility</span>
                                            </button>
                                            <button 
                                                onClick={() => navigate(`/medicines/edit/${item._id}`)}
                                                title="Edit Record"
                                                className="w-7 h-7 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-600 border border-teal-100/50 flex items-center justify-center transition-all cursor-pointer"
                                            >
                                                <span className="material-symbols-rounded text-sm">edit</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
