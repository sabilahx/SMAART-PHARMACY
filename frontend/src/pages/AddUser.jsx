import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AddUser() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [pharmacies, setPharmacies] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form inputs
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [qualification, setQualification] = useState('');
    const [registrationNumber, setRegistrationNumber] = useState('');
    const [shiftType, setShiftType] = useState('Day');
    const [role, setRole] = useState('Pharmacist');
    const [pharmacyId, setPharmacyId] = useState('');
    const [supplierId, setSupplierId] = useState('');
    const [status, setStatus] = useState('Active');
    
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (user?.role !== 'Admin') {
            navigate('/dashboard');
            return;
        }

        const fetchData = async () => {
            try {
                const [pharmRes, suppRes] = await Promise.all([
                    fetch('/api/admin/pharmacies'),
                    fetch('/api/suppliers')
                ]);
                
                if (pharmRes.ok) {
                    const data = await pharmRes.json();
                    setPharmacies(data.pharmacies || []);
                } else {
                    throw new Error('Failed to load branches');
                }

                if (suppRes.ok) {
                    const sData = await suppRes.json();
                    setSuppliers(sData.suppliers || []);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        
        if (!username.trim() || !password.trim() || !role || !pharmacyId) {
            setFormError('Username, password, role, and branch assignment are required.');
            return;
        }

        if (role === 'Supplier' && !supplierId) {
            setFormError('A Supplier profile must be selected for the Supplier role.');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, fullName, phone, email, qualification, registrationNumber, shiftType, role, pharmacyId, status, supplierId })
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to create user account.');
            }
            navigate('/users');
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
                        onClick={() => navigate('/users')}
                        className="w-10 h-10 rounded-xl bg-[var(--bg-primary)] border border-[var(--card-border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-cyan-400 hover:border-cyan-400 transition-all shadow-sm cursor-pointer"
                    >
                        <span className="material-symbols-rounded">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text-primary)] font-serif">Add New User</h1>
                        <p className="text-sm text-[var(--text-muted)] mt-1">Register a new system user and assign permissions</p>
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
                    
                    <form onSubmit={handleSubmit} className="premium-card p-8 flex flex-col gap-6 animate-slide-up">
                        <div className="flex items-center gap-3 border-b border-[var(--card-border)] pb-4 mb-2">
                            <span className="material-symbols-rounded text-cyan-400">person_add</span>
                            <h2 className="text-lg font-bold text-[var(--text-primary)] font-serif">Account Details</h2>
                        </div>
                        
                        {formError && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold font-mono flex items-center gap-2">
                                <span className="material-symbols-rounded text-sm">warning</span> {formError}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase font-bold text-[var(--text-secondary)]">Username *</label>
                                <input
                                    type="text"
                                    placeholder="Enter username"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-xl text-sm text-[var(--text-primary)] outline-none focus:border-cyan-400 transition-colors font-mono"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase font-bold text-[var(--text-secondary)]">Temporary Password *</label>
                                <input
                                    type="password"
                                    placeholder="Set temporary password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-xl text-sm text-[var(--text-primary)] outline-none focus:border-cyan-400 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase font-bold text-[var(--text-secondary)]">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="First & Last Name"
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-xl text-sm text-[var(--text-primary)] outline-none focus:border-cyan-400 transition-colors"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase font-bold text-[var(--text-secondary)]">Qualification</label>
                                <input
                                    type="text"
                                    placeholder="e.g. B.Pharm, Pharm.D"
                                    value={qualification}
                                    onChange={e => setQualification(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-xl text-sm text-[var(--text-primary)] outline-none focus:border-cyan-400 transition-colors font-mono"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase font-bold text-[var(--text-secondary)]">Contact Phone</label>
                                <input
                                    type="text"
                                    placeholder="+91 90000 00000"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-xl text-sm text-[var(--text-primary)] outline-none focus:border-cyan-400 transition-colors font-mono"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase font-bold text-[var(--text-secondary)]">Contact Email</label>
                                <input
                                    type="email"
                                    placeholder="user@smaartpharmacy.in"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-xl text-sm text-[var(--text-primary)] outline-none focus:border-cyan-400 transition-colors font-mono"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 border-b border-[var(--card-border)] pb-4 mt-6 mb-2">
                            <span className="material-symbols-rounded text-cyan-400">admin_panel_settings</span>
                            <h2 className="text-lg font-bold text-[var(--text-primary)] font-serif">System Assignment</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase font-bold text-[var(--text-secondary)]">System Role *</label>
                                <select 
                                    value={role} 
                                    onChange={e => {
                                        setRole(e.target.value);
                                        if (e.target.value !== 'Supplier') setSupplierId('');
                                    }}
                                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-xl text-sm text-[var(--text-primary)] outline-none focus:border-cyan-400 transition-colors font-bold cursor-pointer"
                                >
                                    <option value="Pharmacist">Pharmacist (Staff)</option>
                                    <option value="Manager">Manager (Branch)</option>
                                    <option value="Admin">Admin (HQ)</option>
                                    <option value="Supplier">Supplier</option>
                                </select>
                            </div>
                            
                            {role === 'Supplier' && (
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs uppercase font-bold text-[var(--text-secondary)]">Supplier Profile *</label>
                                    <select 
                                        value={supplierId} 
                                        onChange={e => {
                                            setSupplierId(e.target.value);
                                            const selectedSupplier = suppliers.find(s => s._id === e.target.value);
                                            if (selectedSupplier) {
                                                setPharmacyId(selectedSupplier.pharmacyId?._id || selectedSupplier.pharmacyId);
                                            }
                                        }}
                                        className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-xl text-sm text-[var(--text-primary)] outline-none focus:border-cyan-400 transition-colors font-mono cursor-pointer"
                                    >
                                        <option value="">Select Supplier</option>
                                        {suppliers.map(s => (
                                            <option key={s._id} value={s._id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase font-bold text-[var(--text-secondary)]">Branch Assignment *</label>
                                <select 
                                    value={pharmacyId} 
                                    onChange={e => setPharmacyId(e.target.value)}
                                    disabled={role === 'Supplier'}
                                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-xl text-sm text-[var(--text-primary)] outline-none focus:border-cyan-400 transition-colors font-mono cursor-pointer disabled:opacity-50"
                                >
                                    <option value="">Select Branch</option>
                                    {pharmacies.map(p => (
                                        <option key={p._id} value={p._id}>{p.name} ({p.branchCode})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase font-bold text-[var(--text-secondary)]">State Council Reg ID</label>
                                <input
                                    type="text"
                                    placeholder="Optional"
                                    value={registrationNumber}
                                    onChange={e => setRegistrationNumber(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-xl text-sm text-[var(--text-primary)] outline-none focus:border-cyan-400 transition-colors font-mono"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase font-bold text-[var(--text-secondary)]">Work Shift Type</label>
                                <div className="flex gap-4 mt-1">
                                    {['Day', 'Night', 'Rotating'].map(shift => (
                                        <label key={shift} className="flex items-center gap-2 cursor-pointer">
                                            <div className="w-5 h-5 rounded-full border-2 border-[var(--card-border)] flex items-center justify-center p-0.5">
                                                <div className={`w-full h-full rounded-full transition-colors ${shiftType === shift ? 'bg-cyan-400' : 'bg-transparent'}`}></div>
                                            </div>
                                            <span className="text-sm text-[var(--text-primary)] font-bold">{shift}</span>
                                            <input type="radio" className="hidden" name="shiftType" value={shift} checked={shiftType === shift} onChange={() => setShiftType(shift)} />
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase font-bold text-[var(--text-secondary)]">Account Status</label>
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
                                            <div className={`w-full h-full rounded-full transition-colors ${status === 'Disabled' ? 'bg-red-400' : 'bg-transparent'}`}></div>
                                        </div>
                                        <span className="text-sm text-[var(--text-primary)] font-bold">Disabled</span>
                                        <input type="radio" className="hidden" name="status" value="Disabled" checked={status === 'Disabled'} onChange={() => setStatus('Disabled')} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[var(--card-border)]">
                            <button 
                                type="button" 
                                onClick={() => navigate('/users')}
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
                                        Create User
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
