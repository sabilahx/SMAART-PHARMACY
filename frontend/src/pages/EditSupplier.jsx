import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function EditSupplier() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form inputs
    const [name, setName] = useState('');
    const [contactPerson, setContactPerson] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [gstNumber, setGstNumber] = useState('');
    const [status, setStatus] = useState('Active');
    
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (user?.role !== 'Admin' && user?.role !== 'Manager') {
            navigate('/dashboard');
            return;
        }

        const fetchSupplierData = async () => {
            try {
                // We'll fetch all suppliers and find the one with the given ID since there is no explicit single fetch documented in original UI.
                const res = await fetch('/api/suppliers');
                if (!res.ok) throw new Error('Failed to load suppliers');
                const data = await res.json();
                
                const supplier = data.find(s => s._id === id);
                if (!supplier) {
                    throw new Error('Supplier not found');
                }

                setName(supplier.name || '');
                setContactPerson(supplier.contactPerson || '');
                setPhone(supplier.phone || '');
                setEmail(supplier.email || '');
                setAddress(supplier.address || '');
                setGstNumber(supplier.gstNumber || '');
                setStatus(supplier.status || 'Active');

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSupplierData();
    }, [user, navigate, id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        
        if (!name || !contactPerson || !phone || !email || !address || !gstNumber) {
            setFormError('All fields are required.');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(`/api/suppliers/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name, contactPerson, phone, email, address, gstNumber, status
                })
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to update supplier.');
            }
            navigate('/suppliers');
        } catch (err) {
            setFormError(err.message);
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center h-full">
                <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
                <p className="mt-4 text-[var(--text-secondary)] font-mono animate-pulse">Loading Supplier Details...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--bg-primary)]">
            <div className="px-8 py-6 border-b border-[var(--card-border)] bg-[var(--bg-secondary)] flex justify-between items-center z-10 sticky top-0">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/suppliers')}
                        className="w-10 h-10 rounded-xl bg-[var(--bg-primary)] border border-[var(--card-border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-cyan-400 hover:border-cyan-400 transition-all shadow-sm cursor-pointer"
                    >
                        <span className="material-symbols-rounded">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text-primary)] font-serif">Edit Supplier</h1>
                        <p className="text-sm text-[var(--text-muted)] mt-1">Update profile information for <span className="font-bold text-[var(--text-primary)]">{name}</span></p>
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
                            <span className="material-symbols-rounded text-cyan-400">local_shipping</span>
                            <h2 className="text-lg font-bold text-[var(--text-primary)] font-serif">Supplier Details</h2>
                        </div>
                        
                        {formError && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold font-mono flex items-center gap-2">
                                <span className="material-symbols-rounded text-sm">warning</span> {formError}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase font-bold text-[var(--text-secondary)]">Supplier Name *</label>
                                <input
                                    type="text" required
                                    placeholder="Enter company or supplier name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-xl text-sm text-[var(--text-primary)] outline-none focus:border-cyan-400 transition-colors"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase font-bold text-[var(--text-secondary)]">Contact Person *</label>
                                <input
                                    type="text" required
                                    placeholder="Primary contact name"
                                    value={contactPerson}
                                    onChange={e => setContactPerson(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-xl text-sm text-[var(--text-primary)] outline-none focus:border-cyan-400 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase font-bold text-[var(--text-secondary)]">Phone Number *</label>
                                <input
                                    type="text" required
                                    placeholder="+91 90000 00000"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-xl text-sm text-[var(--text-primary)] outline-none focus:border-cyan-400 transition-colors font-mono"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase font-bold text-[var(--text-secondary)]">Email Address *</label>
                                <input
                                    type="email" required
                                    placeholder="contact@supplier.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-xl text-sm text-[var(--text-primary)] outline-none focus:border-cyan-400 transition-colors font-mono"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 border-b border-[var(--card-border)] pb-4 mt-6 mb-2">
                            <span className="material-symbols-rounded text-cyan-400">policy</span>
                            <h2 className="text-lg font-bold text-[var(--text-primary)] font-serif">Compliance & Address</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase font-bold text-[var(--text-secondary)]">GST Registration No. *</label>
                                <input
                                    type="text" required
                                    placeholder="GSTIN"
                                    value={gstNumber}
                                    onChange={e => setGstNumber(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-xl text-sm text-[var(--text-primary)] outline-none focus:border-cyan-400 transition-colors font-mono uppercase"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase font-bold text-[var(--text-secondary)]">Supplier Status</label>
                                <select 
                                    value={status} onChange={(e) => setStatus(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-xl text-sm text-[var(--text-primary)] outline-none focus:border-cyan-400 transition-colors cursor-pointer"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Archived">Archived</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs uppercase font-bold text-[var(--text-secondary)]">Office Address *</label>
                            <textarea
                                required rows="3"
                                placeholder="Enter full office address"
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                                className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-xl text-sm text-[var(--text-primary)] outline-none focus:border-cyan-400 transition-colors resize-none"
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[var(--card-border)]">
                            <button 
                                type="button" 
                                onClick={() => navigate('/suppliers')}
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
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-rounded">save</span>
                                        Save Changes
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
