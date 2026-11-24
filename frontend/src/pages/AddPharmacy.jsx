import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AddPharmacy() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form inputs
    const [name, setName] = useState('');
    const [branchCode, setBranchCode] = useState('');
    const [address, setAddress] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [email, setEmail] = useState('');
    const [coordinator, setCoordinator] = useState('');
    const [gstin, setGstin] = useState('');
    const [drugLicence, setDrugLicence] = useState('');
    const [openingHours, setOpeningHours] = useState('');
    const [assignedManager, setAssignedManager] = useState('');
    const [status, setStatus] = useState('Active');
    
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (user?.role !== 'Admin') {
            navigate('/dashboard');
            return;
        }

        const fetchManagers = async () => {
            try {
                const res = await fetch('/api/admin/users');
                if (res.ok) {
                    const data = await res.json();
                    const managerUsers = (data.users || []).filter(u => u.role === 'Manager' || u.role === 'Admin');
                    setManagers(managerUsers);
                }
            } catch (err) {
                console.error("Failed to load managers", err);
            } finally {
                setLoading(false);
            }
        };

        fetchManagers();
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        
        if (!name.trim()) {
            setFormError('Pharmacy Name is required.');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/admin/pharmacies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name, branchCode, address, contactPhone, email, 
                    coordinator, gstin, drugLicence, openingHours, 
                    assignedManager: assignedManager || null, 
                    status 
                })
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to create branch.');
            }
            navigate('/pharmacies');
        } catch (err) {
            setFormError(err.message);
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center h-full">
                <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
                <p className="mt-4 text-[var(--text-secondary)] font-mono animate-pulse">Initializing Data...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--bg-primary)]">
            <div className="px-8 py-6 border-b border-[var(--card-border)] bg-[var(--bg-secondary)] flex justify-between items-center z-10 sticky top-0">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/pharmacies')}
                        className="w-10 h-10 rounded-xl bg-[var(--bg-primary)] border border-[var(--card-border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-cyan-400 hover:border-cyan-400 transition-all shadow-sm cursor-pointer"
                    >
                        <span className="material-symbols-rounded">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text-primary)] font-serif">Add New Pharmacy Branch</h1>
                        <p className="text-sm text-[var(--text-muted)] mt-1">Register a new pharmacy location and compliance details</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-4xl mx-auto">
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
                            <span className="material-symbols-rounded">error</span>
                            <span className="text-sm font-bold font-mono">{error}</span>
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="premium-card-elevated p-8 flex flex-col gap-6 animate-slide-up">
                        <div className="flex items-center gap-3 border-b border-[var(--card-border)] pb-4 mb-2">
                            <span className="material-symbols-rounded text-cyan-400">storefront</span>
                            <h2 className="text-lg font-bold text-[var(--text-primary)] font-serif">Branch Details</h2>
                        </div>
                        
                        {formError && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold font-mono flex items-center gap-2">
                                <span className="material-symbols-rounded text-sm">warning</span> {formError}
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            <label className="text-xs uppercase font-bold text-[var(--text-secondary)]">Pharmacy Name *</label>
                            <input
                                type="text"
                                placeholder="Enter branch name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-xl text-sm text-[var(--text-primary)] outline-none focus:border-cyan-400 transition-colors"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase font-bold text-[var(--text-secondary)]">Branch Code</label>
                                <input
                                    type="text"
                                    placeholder="(Auto Generated if left blank)"
                                    value={branchCode}
                                    onChange={e => setBranchCode(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-xl text-sm text-[var(--text-primary)] outline-none focus:border-cyan-400 transition-colors font-mono"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase font-bold text-[var(--text-secondary)]">Coordinator Name</label>
                                <input
                                    type="text"
                                    placeholder="Coordinator Name"
                                    value={coordinator}
                                    onChange={e => setCoordinator(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-xl text-sm text-[var(--text-primary)] outline-none focus:border-cyan-400 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs uppercase font-bold text-[var(--text-secondary)]">Address</label>
                            <input
                                type="text"
                                placeholder="Enter full branch address"
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                                className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-xl text-sm text-[var(--text-primary)] outline-none focus:border-cyan-400 transition-colors"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase font-bold text-[var(--text-secondary)]">Contact Phone</label>
                                <input
                                    type="text"
                                    placeholder="+91 90000 00000"
                                    value={contactPhone}
                                    onChange={e => setContactPhone(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-xl text-sm text-[var(--text-primary)] outline-none focus:border-cyan-400 transition-colors font-mono"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase font-bold text-[var(--text-secondary)]">Branch Email</label>
                                <input
                                    type="email"
                                    placeholder="branch@smaartpharmacy.in"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-xl text-sm text-[var(--text-primary)] outline-none focus:border-cyan-400 transition-colors font-mono"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 border-b border-[var(--card-border)] pb-4 mt-6 mb-2">
                            <span className="material-symbols-rounded text-cyan-400">policy</span>
                            <h2 className="text-lg font-bold text-[var(--text-primary)] font-serif">Compliance & Operations</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase font-bold text-[var(--text-secondary)]">GSTIN</label>
                                <input
                                    type="text"
                                    placeholder="GSTIN"
                                    value={gstin}
                                    onChange={e => setGstin(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-xl text-sm text-[var(--text-primary)] outline-none focus:border-cyan-400 transition-colors font-mono uppercase"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase font-bold text-[var(--text-secondary)]">Drug Licence</label>
                                <input
                                    type="text"
                                    placeholder="DL Number"
                                    value={drugLicence}
                                    onChange={e => setDrugLicence(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-xl text-sm text-[var(--text-primary)] outline-none focus:border-cyan-400 transition-colors font-mono uppercase"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase font-bold text-[var(--text-secondary)]">Assigned Manager</label>
                                <select 
                                    value={assignedManager} 
                                    onChange={e => setAssignedManager(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-xl text-sm text-[var(--text-primary)] outline-none focus:border-cyan-400 transition-colors cursor-pointer"
                                >
                                    <option value="">Unassigned</option>
                                    {managers.map(m => (
                                        <option key={m._id} value={m._id}>{m.fullName} ({m.username})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase font-bold text-[var(--text-secondary)]">Opening Hours</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 9:00 AM - 10:00 PM"
                                    value={openingHours}
                                    onChange={e => setOpeningHours(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-xl text-sm text-[var(--text-primary)] outline-none focus:border-cyan-400 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs uppercase font-bold text-[var(--text-secondary)]">Branch Status</label>
                            <div className="flex gap-4 mt-1">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <div className="w-5 h-5 rounded-full border-2 border-[var(--card-border)] flex items-center justify-center p-0.5">
                                        <div className={`w-full h-full rounded-full transition-colors ${status === 'Active' ? 'bg-emerald-400' : 'bg-transparent'}`}></div>
                                    </div>
                                    <span className="text-sm text-[var(--text-primary)] font-bold">Active</span>
                                    <input type="radio" className="hidden" name="status" value="Active" checked={status === 'Active'} onChange={() => setStatus('Active')} />
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <div className="w-5 h-5 rounded-full border-2 border-[var(--card-border)] flex items-center justify-center p-0.5">
                                        <div className={`w-full h-full rounded-full transition-colors ${status === 'Inactive' ? 'bg-red-400' : 'bg-transparent'}`}></div>
                                    </div>
                                    <span className="text-sm text-[var(--text-primary)] font-bold">Inactive</span>
                                    <input type="radio" className="hidden" name="status" value="Inactive" checked={status === 'Inactive'} onChange={() => setStatus('Inactive')} />
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[var(--card-border)]">
                            <button 
                                type="button" 
                                onClick={() => navigate('/pharmacies')}
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
                                        Provisioning...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-rounded">check_circle</span>
                                        Create Branch
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
