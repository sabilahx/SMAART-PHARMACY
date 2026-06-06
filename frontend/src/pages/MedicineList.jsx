import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MedicineList() {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Active', 'Inactive', 'Archived'
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    // Fetch medicines based on status filter
    const fetchMedicines = async () => {
        setLoading(true);
        setError(null);
        try {
            let url = '/api/medicines';
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

    // Client-side search filtering
    const filteredMedicines = medicines.filter(item => {
        const query = searchQuery.toLowerCase().trim();
        return !query || 
               item.name.toLowerCase().includes(query) || 
               item.ndc.includes(query) || 
               item.category.toLowerCase().includes(query) ||
               (item.supplier && item.supplier.toLowerCase().includes(query));
    });

    const getStatusColor = (status) => {
        if (status === 'Active') return 'text-emerald-400 bg-emerald-950/40 border-emerald-900/30';
        if (status === 'Inactive') return 'text-amber-400 bg-amber-950/40 border-amber-900/30';
        return 'text-slate-500 bg-slate-900/50 border-slate-800/40';
    };

    return (
        <div className="flex flex-col gap-8 max-w-6xl mx-auto">
            {/* Page Header toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col">
                    <h2 className="text-xl font-bold text-slate-100 font-title">Master Stock Ledger</h2>
                    <p className="text-xs text-slate-400 mt-1">Manage active, inactive, and archived medication ledgers.</p>
                </div>
                <button 
                    onClick={() => navigate('/medicines/add')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-slate-950 font-semibold text-xs rounded-lg hover:bg-emerald-400 active:bg-emerald-600 transition-all cursor-pointer"
                >
                    <span className="material-symbols-rounded text-sm">add</span>
                    <span>New Medication</span>
                </button>
            </div>

            {/* Filter & Search Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                    <span className="material-symbols-rounded absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">search</span>
                    <input 
                        type="text" 
                        placeholder="Search name, NDC, category..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Status Filter buttons */}
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 w-full md:w-auto overflow-x-auto">
                    {['All', 'Active', 'Inactive', 'Archived'].map(filter => (
                        <button
                            key={filter}
                            onClick={() => setStatusFilter(filter)}
                            className={`flex-grow md:flex-grow-0 px-4 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                                statusFilter === filter 
                                    ? 'bg-slate-800 text-slate-100' 
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Ledger Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20 text-slate-400 font-medium gap-3">
                        <span className="material-symbols-rounded animate-spin text-2xl text-emerald-400">sync</span>
                        <span className="text-xs">Loading stock ledger records...</span>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center p-20 text-red-400 font-medium gap-3">
                        <span className="material-symbols-rounded text-2xl">error</span>
                        <span className="text-xs">{error}</span>
                        <button onClick={fetchMedicines} className="mt-4 px-4 py-2 bg-slate-800 text-slate-200 rounded-lg text-xs hover:bg-slate-700 cursor-pointer">Retry</button>
                    </div>
                ) : filteredMedicines.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 text-slate-500 gap-3">
                        <span className="material-symbols-rounded text-4xl text-slate-600">inventory_2</span>
                        <div className="text-center">
                            <span className="text-xs font-semibold text-slate-300 block">No Medication Records Found</span>
                            <span className="text-[11px] text-slate-500 mt-1 block">Try clearing your filters or add a new medicine entry.</span>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/35">
                                    <th className="py-4 px-6">Medication</th>
                                    <th className="py-4 px-4">NDC Code</th>
                                    <th className="py-4 px-4">Category</th>
                                    <th className="py-4 px-4">Stock</th>
                                    <th className="py-4 px-4">Cost / Unit</th>
                                    <th className="py-4 px-4">Asset Value</th>
                                    <th className="py-4 px-4">Status</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 text-xs">
                                {filteredMedicines.map(item => {
                                    const assetValue = (item.stock * item.price).toFixed(2);
                                    return (
                                        <tr key={item._id} className="hover:bg-slate-800/10 transition-all">
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-100">{item.name}</span>
                                                    {item.supplier && <span className="text-[10px] text-slate-500 mt-0.5">{item.supplier}</span>}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 font-mono text-slate-300">{item.ndc}</td>
                                            <td className="py-4 px-4 text-slate-300">{item.category}</td>
                                            <td className="py-4 px-4 font-semibold text-slate-200">{item.stock.toLocaleString()}</td>
                                            <td className="py-4 px-4 text-slate-300">${item.price.toFixed(2)}</td>
                                            <td className="py-4 px-4 font-semibold text-slate-100">${parseFloat(assetValue).toLocaleString()}</td>
                                            <td className="py-4 px-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(item.status)}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button 
                                                    onClick={() => navigate(`/medicines/edit/${item._id}`)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 rounded-lg text-slate-200 hover:text-slate-50 text-[11px] font-medium transition-all cursor-pointer"
                                                >
                                                    <span className="material-symbols-rounded text-xs">edit</span>
                                                    <span>Edit</span>
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
